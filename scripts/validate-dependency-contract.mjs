import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));

const root = lock.packages?.[""];
if (!root) {
  console.error("Dependency contract failed: package-lock.json has no root package entry.");
  process.exit(1);
}

const manifest = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
const locked = { ...(root.dependencies ?? {}), ...(root.devDependencies ?? {}) };
const errors = [];

for (const [name, range] of Object.entries(manifest)) {
  if (locked[name] !== range) {
    errors.push(`${name}: package.json=${range} lockfile=${locked[name] ?? "<missing>"}`);
  }
}

for (const name of Object.keys(locked)) {
  if (!(name in manifest)) {
    errors.push(`${name}: present in lockfile root but missing from package.json`);
  }
}

const requiredPackages = ["@playwright/test"];
for (const name of requiredPackages) {
  if (!lock.packages?.[`node_modules/${name}`]) {
    errors.push(`${name}: package entry is missing from package-lock.json`);
  }
}

if (errors.length) {
  console.error("Dependency contract FAILED:");
  for (const error of errors) console.error(`- ${error}`);
  console.error("Run npm install --package-lock-only locally, review the generated lockfile, then commit both manifest and lockfile together.");
  process.exit(1);
}

console.log(`Dependency contract passed: ${Object.keys(manifest).length} root packages are synchronized.`);
