import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const lockfile = JSON.parse(await readFile('package-lock.json', 'utf8'));
const lockRoot = lockfile.packages?.[''] ?? {};
const manifestDependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
const lockDependencies = { ...lockRoot.dependencies, ...lockRoot.devDependencies };

const missing = Object.keys(manifestDependencies).filter((name) => !(name in lockDependencies));
const mismatched = Object.entries(manifestDependencies)
  .filter(([name, range]) => lockDependencies[name] !== range)
  .map(([name, range]) => `${name}: package.json=${range} lockfile=${lockDependencies[name] ?? '<missing>'}`);

if (missing.length || mismatched.length) {
  if (missing.length) console.error(`DEPENDENCY_DRIFT missing-lock-entry: ${missing.join(', ')}`);
  if (mismatched.length) console.error(`DEPENDENCY_DRIFT range-mismatch: ${mismatched.join('; ')}`);
  process.exit(1);
}

console.log(`DEPENDENCY_AUDIT manifest=${Object.keys(manifestDependencies).length} lock=${Object.keys(lockDependencies).length} status=PASS`);
