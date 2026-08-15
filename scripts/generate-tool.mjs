#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const slug = process.argv[2]?.trim();
const args = new Map(process.argv.slice(3).flatMap((value, index, values) => {
  if (!value.startsWith("--")) return [];
  const [key, inlineValue] = value.slice(2).split("=", 2);
  if (inlineValue !== undefined) return [[key, inlineValue]];
  const next = values[index + 1];
  return next && !next.startsWith("--") ? [[key, next]] : [[key, "true"]];
}));

const fail = (message) => {
  console.error(`generate:tool: ${message}`);
  process.exit(1);
};

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  fail("Usage: npm run generate:tool -- <slug> [--category <id>] [--runtime browser|server|hybrid] [--name <name>]");
}

const toolsSource = fs.readFileSync(path.join(root, "src/data/tools.ts"), "utf8");
const categoriesSource = fs.readFileSync(path.join(root, "src/data/categories.ts"), "utf8");
const routeDir = path.join(root, "src/routes");

const toolIds = new Set([...toolsSource.matchAll(/\bt\(\s*"([^"]+)"/g)].map((match) => match[1]));
const toolSlugs = new Set([...toolsSource.matchAll(/,\s*"([a-z0-9]+(?:-[a-z0-9]+)*)"\s*\)\s*,/g)].map((match) => match[1]));
const categoryIds = new Set([...categoriesSource.matchAll(/\bid:\s*"([a-z0-9-]+)"/g)].map((match) => match[1]));
const runtimeKinds = new Set(["browser", "server", "hybrid"]);

function routeExists(currentDir) {
  if (!fs.existsSync(currentDir)) return false;
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const absolute = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (routeExists(absolute)) return true;
      continue;
    }
    if (entry.isFile() && new Set([`${slug}.tsx`, `${slug}.ts`, `${slug}.md`]).has(entry.name)) return true;
  }
  return false;
}

if (toolIds.has(slug)) fail(`Duplicate tool ID: ${slug}`);
if (toolSlugs.has(slug)) fail(`Duplicate tool slug: ${slug}`);
if (routeExists(routeDir)) fail(`Duplicate route candidate already exists for slug: ${slug}`);

const category = args.get("category");
if (!category || !categoryIds.has(category)) {
  fail(`Invalid or missing category. Choose one from: ${[...categoryIds].join(", ")}`);
}
const runtime = args.get("runtime") ?? "browser";
if (!runtimeKinds.has(runtime)) fail(`Invalid runtime: ${runtime}. Use browser, server, or hybrid.`);

const name = args.get("name") ?? slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
const scaffoldRoot = path.join(root, "docs", "tool-scaffolds", slug);
if (fs.existsSync(scaffoldRoot)) fail(`Scaffold already exists: docs/tool-scaffolds/${slug}`);

const symbol = slug.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
fs.mkdirSync(scaffoldRoot, { recursive: true });

const definitionSource = [
  'import type { CanonicalToolDefinition } from "@/lib/tool-quality/contract";',
  "",
  `export const ${symbol}Definition: CanonicalToolDefinition = {`,
  `  id: ${JSON.stringify(slug)},`,
  `  slug: ${JSON.stringify(slug)},`,
  `  name: ${JSON.stringify(name)},`,
  '  description: "TODO: add the canonical product description.",',
  `  category: ${JSON.stringify(category)},`,
  '  version: "0.1.0",',
  '  status: "planned",',
  `  runtime: ${JSON.stringify(runtime)},`,
  '  input: "TODO",',
  '  output: "TODO",',
  "  validation: {",
  "    validInput: false,",
  "    invalidInput: false,",
  "    emptyInput: false,",
  "    boundaryInput: false,",
  "    failureBehavior: false,",
  "    outputValidation: false,",
  "    downloadValidation: false,",
  "    cleanupValidation: false,",
  "  },",
  "  metadata: {},",
  "  localization: {},",
  "  seo: {},",
  "  permissions: [],",
  "  limits: {},",
  "  dependencies: [],",
  '  lifecycle: "planned",',
  "};",
  "",
].join("\n");
fs.writeFileSync(path.join(scaffoldRoot, "definition.ts"), definitionSource);

const runtimeSource = [
  'import type { ReadyToolRuntimeDefinition } from "@/lib/tool-runtime/types";',
  "",
  "/** Scaffold only. Do not register this runtime until real behavior and tests exist. */",
  `export const ${symbol}Runtime: ReadyToolRuntimeDefinition | null = null;`,
  "",
].join("\n");
fs.writeFileSync(path.join(scaffoldRoot, "runtime.tsx"), runtimeSource);

fs.writeFileSync(path.join(scaffoldRoot, "validator.mjs"), [
  "const issues = [];",
  `// TODO: validate MIME/type, size, boundary and failure conditions for ${slug}.`,
  'if (issues.length) throw new Error(issues.join("\\n"));',
  `console.log(${JSON.stringify(`${slug} validator scaffold loaded.`)});`,
  "",
].join("\n"));

fs.writeFileSync(path.join(scaffoldRoot, "tests.mjs"), [
  'import test from "node:test";',
  "",
  `test(${JSON.stringify(`${slug} scaffold`)}, () => {`,
  "  // TODO: replace scaffold with valid/invalid/boundary/failure/output/cleanup tests.",
  "});",
  "",
].join("\n"));

fs.writeFileSync(
  path.join(scaffoldRoot, "seo.json"),
  JSON.stringify({ slug, title: `${name} | Flixo`, description: "TODO: canonical SEO description.", status: "planned" }, null, 2) + "\n",
);
fs.writeFileSync(
  path.join(scaffoldRoot, "i18n.json"),
  JSON.stringify({ en: { name, description: "TODO" }, ar: { name: "TODO", description: "TODO" } }, null, 2) + "\n",
);

const readme = [
  `# ${name}`,
  "",
  "Generated by the official Flixo single-tool generator.",
  "",
  "- Canonical registry: `src/data/tools.ts`",
  `- Runtime: \`src/lib/tool-runtime/tools/${slug}.tsx\``,
  `- Route: \`src/routes/tools/${slug}.tsx\``,
  "- Content: `src/data/toolContent.ts`",
  "- SEO: `src/data/toolSeo.ts`",
  "- i18n: existing Flixo localization layer",
  "",
  "The generator intentionally does not modify or register the tool. Implement and review the scaffold, then register it through the existing contracts and release gates.",
  "",
].join("\n");
fs.writeFileSync(path.join(scaffoldRoot, "README.md"), readme);

console.log(`Generated unregistered tool scaffold: docs/tool-scaffolds/${slug}`);
console.log("Publish is disabled by design; registration and release gates remain manual.");
