import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const lockfile = JSON.parse(await readFile('package-lock.json', 'utf8'));
const lockRoot = lockfile.packages?.[''] ?? {};
const manifestDependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
const lockDependencies = { ...lockRoot.dependencies, ...lockRoot.devDependencies };

const missing = Object.keys(manifestDependencies).filter((name) => !(name in lockDependencies));
const manifestCount = Object.keys(manifestDependencies).length;
const lockCount = Object.keys(lockDependencies).length;

if (missing.length) {
  console.error(`DEPENDENCY_DRIFT missing-lock-entry: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`DEPENDENCY_AUDIT manifest=${manifestCount} lock=${lockCount} status=PASS`);
