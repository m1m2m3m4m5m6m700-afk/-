import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const failures = [];
const warnings = [];

async function walk(dir, predicate = () => true) {
  const out = [];
  const entries = await fs.readdir(path.join(root, dir), { withFileTypes: true });
  for (const entry of entries) {
    const relative = path.join(dir, entry.name);
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".output") continue;
    if (entry.isDirectory()) out.push(...await walk(relative, predicate));
    else if (predicate(entry.name)) out.push(relative);
  }
  return out;
}

const sourceFiles = await walk("src", (name) => /\.(ts|tsx|mjs|js)$/.test(name));
const testFiles = await walk("tests", (name) => /\.(ts|tsx|mjs|js)$/.test(name));
const scriptFiles = await walk("scripts", (name) => /\.(mjs|js|ts)$/.test(name));
const files = [...sourceFiles, ...testFiles, ...scriptFiles];

for (const file of files) {
  const content = await fs.readFile(path.join(root, file), "utf8");

  const deletedLegacyImport = /(?:import\s+[^;]*from\s+|require\s*\(\s*)["'][^"']*(?:megaToolsCatalog|megaToolsEngine|src\/data\/tools)[^"']*["']/.test(content);
  if (deletedLegacyImport) {
    failures.push({ rule: "deleted-legacy-import", file, message: "Removed legacy mega-tool/tool catalog import returned." });
  }

  if (/(?:import\s+[^;]*from\s+|require\s*\(\s*)["'][^"']*@\/data\/tools["']/.test(content)) {
    warnings.push({ rule: "tools-compat-shim", file, message: "Uses the transitional @/data/tools compatibility shim; migrate when this consumer is next touched." });
  }

  if (file.startsWith("src/lib/ai/") && /autoApply\s*[:=]\s*true/.test(content)) {
    failures.push({ rule: "ai-auto-apply", file, message: "AI execution must remain advisory; autoApply=true is forbidden." });
  }
}

const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
const lock = JSON.parse(await fs.readFile(path.join(root, "package-lock.json"), "utf8"));
const rootLock = lock.packages?.[""] ?? {};
for (const section of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
  const manifest = pkg[section] ?? {};
  const locked = rootLock[section] ?? {};
  for (const name of Object.keys(manifest)) {
    if (!(name in locked)) failures.push({ rule: "package-lock-parity", file: "package.json", message: `${section}.${name} missing from package-lock root.` });
  }
  for (const name of Object.keys(locked)) {
    if (!(name in manifest)) failures.push({ rule: "package-lock-parity", file: "package-lock.json", message: `${section}.${name} exists only in package-lock root.` });
  }
}

const workflows = await walk(".github/workflows", (name) => /\.(yml|yaml)$/.test(name));
for (const file of workflows) {
  const content = await fs.readFile(path.join(root, file), "utf8");
  if (content.includes("npm ci") && !content.includes("--no-audit")) {
    warnings.push({ rule: "ci-install-determinism", file, message: "CI npm ci should prefer --no-audit; security audit should run separately." });
  }
}

const rules = [
  "deleted-legacy-import",
  "ai-auto-apply",
  "package-lock-parity",
];

if (warnings.length) {
  console.warn(`REGRESSION PREVENTION: ${warnings.length} advisory warning(s)`);
  for (const warning of warnings) console.warn(`- [${warning.rule}] ${warning.file}: ${warning.message}`);
}

if (failures.length) {
  console.error(`REGRESSION PREVENTION: FAIL (${failures.length} blocking issue(s))`);
  for (const failure of failures) console.error(`- [${failure.rule}] ${failure.file}: ${failure.message}`);
  process.exit(1);
}

console.log(`REGRESSION PREVENTION: PASS (${rules.length} blocking recurrence guards)`);
console.log(`Guarded: ${rules.join(", ")}`);
