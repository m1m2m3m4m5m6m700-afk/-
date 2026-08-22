import { readFile } from 'node:fs/promises';

const registry = await readFile('src/config/tools.ts', 'utf8');
let routeMatrix = '';
try {
  routeMatrix = await readFile('src/routes/_localizedImageToolMatrix.tsx', 'utf8');
} catch {
  console.error('TOOL_CONTRACT_FAIL route-matrix-file-missing: src/routes/_localizedImageToolMatrix.tsx');
  process.exit(1);
}

const ids = [...registry.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
const expected = 22;
const routeNodeCount = (routeMatrix.match(/to:\s*['"]\//g) ?? []).length;

if (duplicateIds.length) {
  console.error(`TOOL_CONTRACT_FAIL duplicate-tool-id: ${[...new Set(duplicateIds)].join(', ')}`);
  process.exit(1);
}

if (ids.length !== expected) {
  console.error(`TOOL_CONTRACT_FAIL registry-count expected=${expected} actual=${ids.length}`);
  process.exit(1);
}

if (routeNodeCount === 0) {
  console.error('TOOL_CONTRACT_FAIL localized-route-matrix-empty');
  process.exit(1);
}

console.log(`TOOL_CONTRACT registryTools=${ids.length} localizedRouteNodes=${routeNodeCount} status=PASS`);
