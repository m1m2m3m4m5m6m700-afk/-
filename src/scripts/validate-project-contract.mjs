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
  "test:desktop",
  "test:desktop:flaky",
]) if (!scripts[script]) fail(`Missing required npm script: ${script}`);

const lockfile = await read("package-lock.json");
if (!lockfile.includes('"lockfileVersion": 3')) fail("package-lock.json must use lockfileVersion 3.");

const workflow = await read(".github/workflows/tool-platform.yml");
for (const required of [
  "npm ci",
  "npm run verify:foundation",
  "npm run validate:performance",
  "npm run test:desktop:flaky",
  "if: failure()",
  "playwright-report",
  "test-results",
]) if (!workflow.includes(required)) fail(`Tool Platform CI is missing required gate/diagnostic: ${required}`);
if (!workflow.includes("actions/checkout@v5") || !workflow.includes("actions/setup-node@v5")) fail("CI actions must use the current v5 runtime actions.");
if (!workflow.includes("playwright install --with-deps chromium")) fail("Desktop CI must install a real Chromium browser.");

const runtimeTypes = await read("src/lib/tool-runtime/types.ts");
const platformFiles = await walk("src/lib/tool-platform", (p) => /\.(ts|tsx|mjs)$/.test(p));
const runtimeFiles = await walk("src/lib/tool-runtime", (p) => /\.(ts|tsx|mjs)$/.test(p));
const routeFiles = await walk("src/routes", (p) => /\.(ts|tsx)$/.test(p));
const testFiles = await walk("tests", (p) => /\.(ts|tsx|mjs|js)$/.test(p));
if (!runtimeTypes) fail("Runtime type contract is missing.");

const forbiddenLegacyImport = /@\/data\/(tools|categories)|from ["']\.\.\/.*data\/(tools|categories)/;
for (const file of [...platformFiles, ...runtimeFiles, ...routeFiles.filter((file) => file.includes("tools"))]) {
  const source = await read(file);
  if (forbiddenLegacyImport.test(source)) fail(`Legacy catalog import leaked into protected surface: ${file}`);
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
const registrations = [...registry.matchAll(/id:\s*["']([^"']+)["'][\s\S]*?lifecycle:\s*["']([^"']+)["']/g)].map((m) => ({ id: m[1], lifecycle: m[2] }));
if (registrations.length === 0) fail("Public desktop registry contains no registrations.");
for (const { id, lifecycle } of registrations) {
  if (lifecycle !== "public") fail(`Public registry entry ${id} has invalid lifecycle: ${lifecycle}`);
  if (!tests.includes(`/tools/${id}`)) fail(`Missing E2E route assertion for public tool: ${id}`);
  if (!tests.includes("expect(")) fail(`No result assertions found in desktop E2E coverage: ${id}`);
}

const contracts = await read("src/lib/tool-platform/testContracts.ts");
const usesStrictChecks = contracts.includes("const strictChecks = [\"render\", \"interaction\", \"output\", \"error\"] as const") || contracts.includes("const strictChecks = ['render', 'interaction', 'output', 'error'] as const");
for (const { id } of registrations) {
  const start = contracts.indexOf(`toolId: "${id}"`);
  if (start < 0) fail(`Missing verification contract for public tool: ${id}`);
  else if (!usesStrictChecks) {
    const block = contracts.slice(start, start + 500);
    for (const check of ["render", "interaction", "output", "error"]) if (!block.includes(`"${check}"`)) fail(`Tool ${id} is missing strict verification check: ${check}`);
  }
}

if (failures.length) {
  console.error("STRICT PROJECT CONTRACT: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("STRICT PROJECT CONTRACT: PASS");
