import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const required = [
  ".github/agents/agent-triage.md",
  ".github/agents/agent-pr-review.md",
  ".github/agents/agent-ci-failure.md",
  "scripts/security/redact-secrets.mjs",
  "scripts/test-selection.mjs",
  "scripts/test-generation.mjs",
];

const failures = [];
const warnings = [];
for (const file of required) {
  try { await fs.access(path.join(root, file)); }
  catch { failures.push(`Missing ${file}`); }
}

const read = async (file) => fs.readFile(path.join(root, file), "utf8");
if (!failures.length) {
  const triage = await read(".github/agents/agent-triage.md");
  const review = await read(".github/agents/agent-pr-review.md");
  const ciFailure = await read(".github/agents/agent-ci-failure.md");
  const redactor = await read("scripts/security/redact-secrets.mjs");
  const selection = await read("scripts/test-selection.mjs");
  const generation = await read("scripts/test-generation.mjs");
  for (const [name, source] of [["triage", triage], ["review", review], ["ciFailure", ciFailure]]) {
    const hasSafeApplyContract = source.includes('"autoApply": false') || source.includes("`autoApply` must always be `false`") || source.includes("autoApply=false");
    if (!hasSafeApplyContract) failures.push(`${name} agent missing autoApply=false guardrail`);
  }
  if (!redactor.includes("[REDACTED]")) failures.push("redactSecrets must redact credentials");
  if (!selection.includes("git") || !selection.includes("selectedTests")) failures.push("test-selection must remain deterministic and report selected tests");
  if (!generation.includes("requiresHumanReview") || !generation.includes("aiOptional")) failures.push("test-generation must remain advisory");
}

const scanRoots = ["src", "tests", "scripts"];
const legacy = [];
async function scan(dir) {
  const entries = await fs.readdir(path.join(root, dir), { withFileTypes: true });
  for (const entry of entries) {
    const relative = path.join(dir, entry.name);
    if (relative === "scripts/validate-ai-tools.mjs") continue;
    if (entry.isDirectory()) { await scan(relative); continue; }
    if (!/\.(ts|tsx|mjs|js)$/.test(entry.name)) continue;
    const content = await fs.readFile(path.join(root, relative), "utf8");
    const legacyImport = /(?:import\s+[^;]*from\s+|require\s*\(\s*)["'][^"']*(?:megaToolsCatalog|megaToolsEngine|src\/data\/tools)[^"']*["']/.test(content);
    if (legacyImport) legacy.push(relative);
    if (/(?:import\s+[^;]*from\s+|require\s*\(\s*)["'][^"']*@\/data\/tools["']/.test(content)) {
      warnings.push(`${relative} uses the transitional tools compatibility shim`);
    }
  }
}
for (const dir of scanRoots) { try { await scan(dir); } catch {} }
if (legacy.length) failures.push(`Legacy mega-tool imports remain: ${legacy.join(", ")}`);

if (warnings.length) {
  console.warn(`Advanced AI tools advisory: ${warnings.length} compatibility-shim import(s).`);
  warnings.slice(0, 20).forEach((warning) => console.warn(`- ${warning}`));
}

if (failures.length) {
  console.error(`Advanced AI tools validation failed with ${failures.length} issue(s).`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("Advanced AI tools validation: PASS");
