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
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".output" || entry.name === "dist") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path, predicate)));
    else if (predicate(path)) files.push(path);
  }
  return files;
}

const packageJson = JSON.parse(await read("package.json"));
const scripts = packageJson.scripts ?? {};
const requiredScripts = [
  "verify:foundation",
  "verify:tool",
  "validate:tool-platform",
  "validate:tool-platform-lifecycle",
  "validate:tool-platform-boundaries",
  "validate:tool-platform-regression",
  "validate:route-tree",
  "test:desktop",
];
for (const script of requiredScripts) if (!scripts[script]) fail(`Missing required npm script: ${script}`);

const lockfile = await read("package-lock.json");
if (!lockfile.includes('"lockfileVersion": 3')) fail("package-lock.json must use lockfileVersion 3.");

const workflow = await read(".github/workflows/tool-platform.yml");
for (const required of ["npm ci", "npm run build", "npm run typecheck", "npm run lint", "npm run test:desktop"]) {
  if (!workflow.includes(required)) fail(`Tool Platform CI is missing required gate: ${required}`);
}
if (!workflow.includes("playwright install --with-deps chromium")) fail("Desktop CI must install a real Chromium browser.");

const runtimeTypes = await read("src/lib/tool-runtime/types.ts");
const routeFile = await read("src/routes/tools/$slug.tsx");
const platformFiles = await walk("src/lib/tool-platform", (p) => /\.(ts|tsx|mjs)$/.test(p));
const runtimeFiles = await walk("src/lib/tool-runtime", (p) => /\.(ts|tsx|mjs)$/.test(p));
const routeFiles = await walk("src/routes", (p) => /\.(ts|tsx)$/.test(p));

const forbiddenLegacyImport = /@\/data\/(tools|categories)|from ["']\.\.\/.*data\/(tools|categories)/;
for (const file of [...platformFiles, ...runtimeFiles]) {
  const source = await read(file);
  if (forbiddenLegacyImport.test(source)) fail(`Legacy catalog import leaked into platform/runtime: ${file}`);
}

const publicRoutes = routeFiles.filter((file) => file.includes("tools") || file.includes("admin"));
for (const file of publicRoutes) {
  const source = await read(file);
  if (forbiddenLegacyImport.test(source) && file.includes("tools")) fail(`Legacy catalog import leaked into tool route: ${file}`);
}

const placeholderPattern = /existing catalog entries unchanged|TODO\s*:|planned-only placeholder|throw new Error\(["']Not implemented/i;
for (const root of ["src/lib/tool-platform", "src/lib/tool-runtime", "src/routes"]) {
  const files = await walk(root, (p) => /\.(ts|tsx|mjs)$/.test(p));
  for (const file of files) {
    const source = await read(file);
    if (placeholderPattern.test(source)) fail(`Placeholder/unimplemented code found in public architecture surface: ${file}`);
  }
}

const registry = await read("src/lib/tool-platform/publicDesktopTools.ts");
const tests = await read("tests/desktop-tools.spec.ts");
const registrations = [...registry.matchAll(/id:\s*["']([^"']+)["'][\s\S]*?lifecycle:\s*["']([^"']+)["']/g)].map((m) => ({ id: m[1], lifecycle: m[2] }));
if (registrations.length === 0) fail("Public desktop registry contains no registrations.");
for (const { id, lifecycle } of registrations) {
  if (lifecycle !== "public") fail(`Public registry entry ${id} has invalid lifecycle: ${lifecycle}`);
  const route = `/tools/${id}`;
  if (!tests.includes(route)) fail(`Missing E2E route assertion for public tool: ${id}`);
  const block = tests.slice(Math.max(0, tests.indexOf(`"${id}`) - 800), tests.indexOf(`"${id}`) + 2500);
  if (!block.includes("expect(")) fail(`Public tool ${id} has no explicit result assertions in E2E coverage.`);
}

const contracts = await read("src/lib/tool-platform/testContracts.ts");
for (const { id } of registrations) {
  const start = contracts.indexOf(`toolId: "${id}"`);
  if (start < 0) fail(`Missing verification contract for public tool: ${id}`);
  else {
    const block = contracts.slice(start, start + 250);
    for (const check of ["render", "interaction", "output", "error"]) {
      if (!block.includes(`"${check}"`)) fail(`Tool ${id} is missing strict verification check: ${check}`);
    }
  }
}

const duplicateRegistryPattern = /public.*registry/i;
const registryCandidates = await walk("src/lib", (p) => /\.(ts|tsx)$/.test(p));
const registryFiles = [];
for (const file of registryCandidates) {
  const source = await read(file);
  if (duplicateRegistryPattern.test(source) && source.includes("publicToolRegistrations")) registryFiles.push(file);
}
if (registryFiles.length !== 1 || registryFiles[0] !== "src/lib/tool-platform/index.ts" && registryFiles.length > 1) {
  if (registryFiles.length > 1) fail(`Multiple public tool registries detected: ${registryFiles.join(", ")}`);
}

if (failures.length) {
  console.error("STRICT PROJECT CONTRACT: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("STRICT PROJECT CONTRACT: PASS");
