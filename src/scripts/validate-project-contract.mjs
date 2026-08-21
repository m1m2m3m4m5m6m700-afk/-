// Strict project gate: architecture, CI, and tool contracts must agree.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const failures = [];
const fail = (message) => failures.push(message);

async function read(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    fail(`Missing required file: ${path}`);
    return "";
  }
}

async function walk(dir, predicate = () => true) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (["node_modules", ".git", ".output", "dist"].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path, predicate));
    else if (predicate(path)) files.push(path);
  }
  return files;
}

const packageJson = JSON.parse(await read("package.json"));
const scripts = packageJson.scripts ?? {};
for (const script of [
  "verify:foundation",
  "verify:tool",
  "verify:project",
  "validate:project-contract",
  "validate:test-quality",
  "test:property-fuzz",
  "test:fault-injection",
  "validate:security-strict",
  "validate:flaky-isolation",
  "validate:failure-quality",
  "validate:performance",
  "validate:tool-platform",
  "validate:tool-platform-lifecycle",
  "validate:tool-platform-boundaries",
  "validate:tool-platform-regression",
  "validate:route-tree",
  "typecheck",
  "lint",
  "test:desktop",
  "test:desktop:flaky",
]) if (!scripts[script]) fail(`Missing required npm script: ${script}`);

const lockfile = await read("package-lock.json");
if (!lockfile.includes('"lockfileVersion": 3')) fail("package-lock.json must use lockfileVersion 3.");

// CI is intentionally a single canonical workflow with independent parallel gates.
const workflow = await read(".github/workflows/ci.yml");
for (const required of [
  "pull_request:",
  "actions/checkout@v5",
  "actions/setup-node@v5",
  "node-version-file: .nvmrc",
  "npm ci",
  "npm run validate-ci-contract",
  "max-parallel: 24",
  "typecheck:",
  "lint:",
  "build:",
  "e2e:",
  "security:",
  "diagnostics:",
  "gate:",
  "node scripts/diagnose-ci-failure.mjs",
  "playwright-report",
  "test-results",
  "node scripts/scan-secrets.mjs",
  "github/codeql-action/init@v3",
  "github/codeql-action/analyze@v3",
]) if (!workflow.includes(required)) fail(`Parallel CI is missing required contract: ${required}`);

const runtimeTypes = await read("src/lib/tool-runtime/types.ts");
const platformFiles = await walk("src/lib/tool-platform", (p) => /\.(ts|tsx|mjs)$/.test(p));
const runtimeFiles = await walk("src/lib/tool-runtime", (p) => /\.(ts|tsx|mjs)$/.test(p));
const routeFiles = await walk("src/routes", (p) => /\.(ts|tsx)$/.test(p));
const testFiles = await walk("tests", (p) => /\.(ts|tsx|mjs|js)$/.test(p));
if (!runtimeTypes) fail("Runtime type contract is missing.");

const forbiddenLegacyImport = /@\/data\/(tools|categories)|from ["']\.\.\/.*data\/(tools|categories)/;
for (const file of [...platformFiles, ...runtimeFiles, ...routeFiles.filter((file) => file.includes("tools"))]) {
  if (forbiddenLegacyImport.test(await read(file))) fail(`Legacy catalog import leaked into protected surface: ${file}`);
}

const placeholderPattern = /existing catalog entries unchanged|TODO\s*:|planned-only placeholder|throw new Error\(["']Not implemented/i;
for (const root of ["src/lib/tool-platform", "src/lib/tool-runtime", "src/routes"]) {
  for (const file of await walk(root, (p) => /\.(ts|tsx|mjs)$/.test(p))) {
    if (placeholderPattern.test(await read(file))) fail(`Placeholder/unimplemented code found in public architecture surface: ${file}`);
  }
}

for (const file of testFiles) {
  const source = await read(file);
  if (/\b(?:test|it|describe)\.only\s*\(/.test(source)) fail(`Focused test is forbidden in CI: ${file}`);
  if (/\b(?:test|it|describe)\.(?:skip|fixme)\s*\(/.test(source)) fail(`Skipped/fixme test is forbidden in CI: ${file}`);
}

const registryPath = "src/lib/tool-platform/publicDesktopTools.ts";
const registry = await read(registryPath);
const registryExportCount = (registry.match(/export const publicToolRegistrations\b/g) ?? []).length;
if (registryExportCount !== 1) fail(`Expected exactly one publicToolRegistrations export in ${registryPath}; found ${registryExportCount}.`);

const candidates = await walk("src/lib", (p) => /\.(ts|tsx)$/.test(p));
let registrationExportFiles = 0;
for (const file of candidates) {
  const source = await read(file);
  registrationExportFiles += (source.match(/export const publicToolRegistrations\b/g) ?? []).length;
}
if (registrationExportFiles !== 1) fail(`Expected exactly one public tool registry export in src/lib; found ${registrationExportFiles}.`);

const tests = await read("tests/desktop-tools.spec.ts");
const manifestSection = registry.match(/const manifestData = \[([\s\S]*?)\n\] as const;/)?.[1] ?? "";
const registrations = [...manifestSection.matchAll(/\{([\s\S]*?)\n\s*\},/g)]
  .map((match) => match[1])
  .map((block) => ({
    id: block.match(/id:\s*["']([^"']+)["']/)?.[1],
    slug: block.match(/slug:\s*["']([^"']+)["']/)?.[1],
    lifecycle: block.match(/lifecycle:\s*["']([^"']+)["']/)?.[1],
  }))
  .filter((entry) => entry.id && entry.slug && entry.lifecycle);

const routeAssertions = new Set([
  ...[...tests.matchAll(/openTool\(page,\s*["']([^"']+)["']\)/g)].map((match) => match[1]),
  ...[...tests.matchAll(/page\.goto\(\s*["']\/tools\/([^"']+)["']/g)].map((match) => match[1]),
]);

if (registrations.length === 0) fail("Public desktop registry contains no registrations.");
for (const { id, slug, lifecycle } of registrations) {
  if (lifecycle !== "public") fail(`Public registry entry ${id} has invalid lifecycle: ${lifecycle}`);
  if (!routeAssertions.has(slug)) fail(`Missing E2E route assertion for public tool: ${id} (${slug})`);
}
if (!tests.includes("expect(")) fail("No result assertions found in desktop E2E coverage.");

const contracts = await read("src/lib/tool-platform/testContracts.ts");
const requiredChecks = [
  "render",
  "interaction",
  "output",
  "error",
  "security",
  "performance",
  "mutation",
  "invariant",
  "evidence",
];
const contractLines = contracts.split(/\r?\n/).map((line) => line.trim());
for (const check of requiredChecks) {
  if (!contractLines.some((line) => line === `\"${check}\",`)) {
    fail(`Shared certification check is missing from testContracts.ts: ${check}`);
  }
}
if (!contractLines.some((line) => line.startsWith("const strictChecks ="))) {
  fail("testContracts.ts must define the shared strictChecks set.");
}
for (const { id } of registrations) {
  const entry = contractLines.find((line) => line.startsWith(`{ toolId: "${id}"`));
  if (!entry) {
    fail(`Tool ${id} is missing a strict verification contract entry.`);
    continue;
  }
  if (!entry.includes("requiredChecks: strictChecks")) {
    fail(`Tool ${id} must be backed by the shared strictChecks set.`);
  }
}

for (const required of [
  'level: "certified"',
  "requiredEvidence: true",
  "regressionLocked: true",
  'dataProcessing: "local-only"',
]) {
  if (!contracts.includes(required)) fail(`Certification contract is missing required rule: ${required}`);
}

if (failures.length) {
  console.error("STRICT PROJECT CONTRACT: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("STRICT PROJECT CONTRACT: PASS");
