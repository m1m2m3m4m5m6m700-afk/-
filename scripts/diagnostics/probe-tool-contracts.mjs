import { readFile } from 'node:fs/promises';

const registry = await readFile('src/config/tools.ts', 'utf8');
const routeMatrix = await readFile('src/routes/localized-tool-routes.tsx', 'utf8').catch(() => '');
if (!routeMatrix) {
  console.error('TOOL_CONTRACT_FAIL route-matrix-file-missing: src/routes/localized-tool-routes.tsx');
  process.exit(1);
}

const ids = [...registry.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
const expectedTools = 22;
const expectedGenericRoutes = 20 * expectedTools - 2;
const routeNodeCount = (routeMatrix.match(/path:\s*`\//g) ?? []).length;

if (duplicateIds.length) {
  console.error(`TOOL_CONTRACT_FAIL duplicate-tool-id: ${[...new Set(duplicateIds)].join(', ')}`);
  process.exit(1);
}

if (ids.length !== expectedTools) {
  console.error(`TOOL_CONTRACT_FAIL registry-count expected=${expectedTools} actual=${ids.length}`);
  process.exit(1);
}

if (routeNodeCount !== expectedGenericRoutes) {
  console.error(`TOOL_CONTRACT_FAIL localized-route-count expected=${expectedGenericRoutes} actual=${routeNodeCount}`);
  process.exit(1);
}

console.log(`TOOL_CONTRACT registryTools=${ids.length} genericLocalizedRoutes=${routeNodeCount} expected=${expectedGenericRoutes} status=PASS`);
