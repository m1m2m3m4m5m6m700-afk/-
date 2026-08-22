import { readFile } from 'node:fs/promises';

const registry = await readFile('src/config/tools.ts', 'utf8');
const routeMatrix = await readFile('src/routes/localized-tool-routes.tsx', 'utf8').catch(() => '');
if (!routeMatrix) {
  console.error('TOOL_CONTRACT_FAIL route-matrix-file-missing: src/routes/localized-tool-routes.tsx');
  process.exit(1);
}

const ids = [...registry.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
const expectedLanguages = 20;
const expectedTools = 22;
const expectedGenericRoutes = expectedLanguages * expectedTools - 2;
const hasFlatMapMatrix = /SUPPORTED_LANGUAGES\.flatMap\(\(language\)\s*=>/.test(routeMatrix);
const hasSpecialFilter = /SPECIAL_COMPRESSOR_PATHS/.test(routeMatrix) && /filter\(\(tool\)\s*=>\s*!SPECIAL_COMPRESSOR_PATHS/.test(routeMatrix);
const hasInvariant = new RegExp(`expected ${expectedGenericRoutes} generic localized routes`).test(routeMatrix);
const hasSpecialRoutes = routeMatrix.includes("'/en/image-compressor'") && routeMatrix.includes("'/ar/image-compressor'");

if (duplicateIds.length) {
  console.error(`TOOL_CONTRACT_FAIL duplicate-tool-id: ${[...new Set(duplicateIds)].join(', ')}`);
  process.exit(1);
}

if (ids.length !== expectedTools) {
  console.error(`TOOL_CONTRACT_FAIL registry-count expected=${expectedTools} actual=${ids.length}`);
  process.exit(1);
}

if (!hasFlatMapMatrix || !hasSpecialFilter || !hasInvariant || !hasSpecialRoutes) {
  console.error('TOOL_CONTRACT_FAIL localized-route-matrix-structure: expected dynamic 20x22 matrix with two dedicated compressor routes and 438 generic-route invariant');
  process.exit(1);
}

console.log(`TOOL_CONTRACT registryTools=${ids.length} languages=${expectedLanguages} genericLocalizedRoutes=${expectedGenericRoutes} architecture=dynamic-flatMap status=PASS`);
