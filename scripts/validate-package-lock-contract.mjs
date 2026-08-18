import { readFile } from "node:fs/promises";

const pkg = JSON.parse(await readFile("package.json", "utf8"));
const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
const root = lock.packages?.[""];
const failures = [];

if (!root) {
  failures.push('package-lock.json is missing packages[""] root entry.');
}

for (const section of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
  const expected = pkg[section] ?? {};
  const actual = root?.[section] ?? {};
  const names = new Set([...Object.keys(expected), ...Object.keys(actual)]);

  for (const name of [...names].sort()) {
    const manifestValue = expected[name] ?? null;
    const lockValue = actual[name] ?? null;
    if (manifestValue !== lockValue) {
      failures.push(`${section}.${name}: package.json=${JSON.stringify(manifestValue)} package-lock=${JSON.stringify(lockValue)}`);
    }
  }
}

if (failures.length) {
  console.error("PACKAGE/LOCK CONTRACT: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("PACKAGE/LOCK CONTRACT: PASS");
