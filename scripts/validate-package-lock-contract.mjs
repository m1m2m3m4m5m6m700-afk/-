import { readFile } from "node:fs/promises";

const pkg = JSON.parse(await readFile("package.json", "utf8"));
const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
const root = lock.packages?.[""];
const failures = [];
const advisories = [];

if (!root) {
  failures.push('package-lock.json is missing packages[""] root entry.');
}

for (const section of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
  const expected = pkg[section] ?? {};
  const actual = root?.[section] ?? {};

  for (const name of Object.keys(expected).sort()) {
    if (!(name in actual)) {
      failures.push(`${section}.${name}: dependency is declared by package.json but missing from package-lock root.`);
      continue;
    }

    const packageNode = lock.packages?.[`node_modules/${name}`];
    if (!packageNode?.version) {
      failures.push(`${section}.${name}: lockfile has no resolved node_modules/${name} version.`);
    }

    if (actual[name] !== expected[name]) {
      advisories.push(`${section}.${name}: manifest range ${JSON.stringify(expected[name])} differs from lock root declaration ${JSON.stringify(actual[name])}; npm ci remains the authoritative semver resolver.`);
    }
  }

  for (const name of Object.keys(actual).sort()) {
    if (!(name in expected)) {
      failures.push(`${section}.${name}: dependency exists in package-lock root but not package.json.`);
    }
  }
}

if (failures.length) {
  console.error("PACKAGE/LOCK CONTRACT: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

for (const advisory of advisories.slice(0, 20)) console.warn(`PACKAGE/LOCK CONTRACT: advisory - ${advisory}`);
console.log(`PACKAGE/LOCK CONTRACT: PASS (${advisories.length} range advisories)`);
