#!/usr/bin/env node
/**
 * AI architecture guards. Dependency-free by design so the guard can run
 * before npm ci. It protects server-only secrets, centralized provider access,
 * and the read-only orchestration context.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function listFiles(dir) {
  const absolute = path.join(root, dir);
  if (!fs.existsSync(absolute)) return [];
  const result = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(?:ts|tsx|js|mjs|cjs)$/.test(entry.name)) result.push(full);
    }
  };
  walk(absolute);
  return result;
}

function sourceWithoutComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "$1");
}

function report(file, line, message) {
  failures.push(`${path.relative(root, file)}:${line} — ${message}`);
}

function scan(file, patterns, label) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = sourceWithoutComments(lines[index]);
    if (patterns.some((pattern) => pattern.test(line))) report(file, index + 1, label);
  }
}

// 1) Secret leakage guard: browser-facing source must never reference
// provider secret environment variables or raw provider API-key headers.
const browserFiles = [
  ...listFiles("src/components"),
  ...listFiles("src/routes"),
];
const secretPatterns = [
  /\bGEMINI_API_KEY\b/,
  /\bOPENAI_API_KEY\b/,
  /\bOPENROUTER_API_KEY\b/,
  /\bANTHROPIC_API_KEY\b/,
  /process\.env\.[A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD)\b/,
];
for (const file of browserFiles) scan(file, secretPatterns, "provider secret must remain server-side");

// 2) Provider invocation guard: direct provider imports/calls are confined to
// the AI provider layer and the single aiService orchestration entry point.
const allowedProviderFiles = new Set(
  listFiles("src/lib/ai/providers").map((file) => path.normalize(file)),
);
allowedProviderFiles.add(path.normalize(path.join(root, "src/lib/ai/aiService.ts")));
const providerFiles = listFiles("src").filter((file) => !allowedProviderFiles.has(path.normalize(file)));
const providerPatterns = [
  /from\s+["'][^"']*\/ai\/providers(?:\/|["'])/,
  /require\(\s*["'][^"']*\/ai\/providers\//,
  /new\s+(?:GoogleGenerativeAI|OpenAI|Anthropic)\s*\(/,
  /\.generateContent\s*\(/,
  /\.chat\.completions\.create\s*\(/,
];
for (const file of providerFiles) scan(file, providerPatterns, "direct AI provider access must flow through aiService/provider layer");

// 3) Read-only context guard: context.ts may describe capabilities but must
// never gain file/db writes, mutations, or tool execution authority.
const contextPath = path.join(root, "src/lib/ai/orchestration/context.ts");
if (!fs.existsSync(contextPath)) {
  failures.push("src/lib/ai/orchestration/context.ts — read-only AI context module is missing");
} else {
  const raw = fs.readFileSync(contextPath, "utf8");
  const source = sourceWithoutComments(raw);
  const forbidden = [
    /fs\.(?:writeFile|writeFileSync|appendFile|appendFileSync)\s*\(/,
    /(?:db|database)\.(?:insert|update|delete|transaction)\s*\(/,
    /\b(?:invoke|apply|mutate|mutation|executeTool|runTool)\s*\(/,
    /\b(?:fetch|axios)\s*\(/,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(source)) {
      const match = source.match(pattern);
      const line = match?.index == null ? 1 : source.slice(0, match.index).split(/\r?\n/).length;
      report(contextPath, line, `read-only context contains forbidden capability: ${pattern}`);
    }
  }
}

// 4) Policy invariant: the orchestration context must expose the hard policy
// flags so a future refactor cannot silently enable execution.
if (fs.existsSync(contextPath)) {
  const source = fs.readFileSync(contextPath, "utf8");
  for (const invariant of [
    "readOnly: true",
    "canInvokeTools: false",
    "canWriteDatabase: false",
    "autoApply: false",
    "requiresHumanReview: true",
  ]) {
    if (!source.includes(invariant)) {
      failures.push(`src/lib/ai/orchestration/context.ts — missing policy invariant: ${invariant}`);
    }
  }
}

if (failures.length) {
  console.error("AI architecture guards FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("AI architecture guards passed.");
