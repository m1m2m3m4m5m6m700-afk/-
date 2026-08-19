import { readFile } from "node:fs/promises";

const pkg = JSON.parse(await readFile("package.json", "utf8"));
const lock = JSON.parse(await readFile("package-lock.json", "utf8"));

const failures = [];
if (lock.lockfileVersion !== 3) failures.push(`package-lock.json must use lockfileVersion 3 (found ${lock.lockfileVersion}).`);
if (lock.name !== pkg.name) failures.push(`Lockfile name ${lock.name ?? "<missing>"} does not match package name ${pkg.name}.`);
if (lock.version !== pkg.version) failures.push(`Lockfile version ${lock.version ?? "<missing>"} does not match package version ${pkg.version}.`);
if (!lock.packages?.[""]) failures.push('Lockfile root package entry "packages[\\\"\\\"]" is missing.');

if (failures.length) {
  console.error("LOCKFILE CONTRACT: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("LOCKFILE CONTRACT: PASS");
