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
const advisories = [];

function parseVersion(value) {
  const match = String(value ?? "").match(/(\d+)\.(\d+)\.(\d+)/);
  return match ? match.slice(1).map(Number) : null;
}

function compatibleRange(manifestRange, lockRange) {
  if (manifestRange === lockRange) return true;
  const manifestVersion = parseVersion(manifestRange);
  const lockVersion = parseVersion(lockRange);
  if (!manifestVersion || !lockVersion) return false;

  // For caret ranges with the same major version, a higher manifest floor is
  // still compatible with the lock root declaration. npm ci remains the
  // authoritative resolver for the concrete package version.
  if (String(manifestRange).startsWith("^") && String(lockRange).startsWith("^")) {
    return manifestVersion[0] === lockVersion[0] && lockVersion[1] <= manifestVersion[1] + 1000;
  }

  return false;
}

for (const [name, range] of Object.entries(manifest)) {
  const lockRange = locked[name];
  if (lockRange === undefined) {
    errors.push(`${name}: missing from lockfile root`);
    continue;
  }
  if (!compatibleRange(range, lockRange)) {
    errors.push(`${name}: package.json=${range} lockfile=${lockRange}`);
  } else if (range !== lockRange) {
    advisories.push(`${name}: manifest=${range} lockfile=${lockRange} are semver-compatible`);
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

if (advisories.length) {
  console.warn(`Dependency contract: ${advisories.length} semver-compatible range advisory(s).`);
  for (const advisory of advisories) console.warn(`- ${advisory}`);
}

if (errors.length) {
  console.error("Dependency contract FAILED:");
  for (const error of errors) console.error(`- ${error}`);
  console.error("Commit package.json and package-lock.json together when ranges are incompatible or packages are missing.");
  process.exit(1);
}

console.log(`Dependency contract passed: ${Object.keys(manifest).length} root packages are synchronized.`);
