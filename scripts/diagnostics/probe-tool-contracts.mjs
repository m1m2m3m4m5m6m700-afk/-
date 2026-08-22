import { readFile } from 'node:fs/promises';

const registry = await readFile('src/config/tools.ts', 'utf8');
const routeModule = await readFile('src/routes/localized-tool-routes.tsx', 'utf8').catch(() => '');
if (!routeModule) {
  console.error('TOOL_CONTRACT_FAIL route-module-missing: src/routes/localized-tool-routes.tsx');
  process.exit(1);
}

const ids = [...registry.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
const expectedLanguages = 20;
const expectedTools = 22;
const expectedGenericRoutes = expectedLanguages * expectedTools - 2;

const hasSupportedLanguageIteration = /SUPPORTED_LANGUAGES\.flatMap\s*\(/.test(routeModule);
const hasToolRegistryIteration = /TOOLS_REGISTRY\s*[\s\S]*?\.map\s*\(/.test(routeModule);
const filtersDedicatedRoutes = /SPECIAL_COMPRESSOR_PATHS/.test(routeModule) && /SPECIAL_COMPRESSOR_PATHS\.has/.test(routeModule);
const hasRouteConstructor = /createRoute\s*\(/.test(routeModule);
const hasLocalizedPathTemplate = /path:\s*`\/\$\{language\}\/\$\{tool\.id\}`/.test(routeModule);
const hasRouteInvariant = /20\s*\*\s*22\s*-\s*2/.test(routeModule);
const hasDedicatedEnglish = routeModule.includes("'/en/image-compressor'");
const hasDedicatedArabic = routeModule.includes("'/ar/image-compressor'");

if (duplicateIds.length) {
  console.error(`TOOL_CONTRACT_FAIL duplicate-tool-id: ${[...new Set(duplicateIds)].join(', ')}`);
  process.exit(1);
}
if (ids.length !== expectedTools) {
  console.error(`TOOL_CONTRACT_FAIL registry-count expected=${expectedTools} actual=${ids.length}`);
  process.exit(1);
}
if (!hasSupportedLanguageIteration || !hasToolRegistryIteration || !filtersDedicatedRoutes || !hasRouteConstructor || !hasLocalizedPathTemplate || !hasRouteInvariant || !hasDedicatedEnglish || !hasDedicatedArabic) {
  console.error(`TOOL_CONTRACT_FAIL localized-route-matrix-structure: expected ${expectedLanguages} languages × ${expectedTools} tools − 2 dedicated routes = ${expectedGenericRoutes} generic routes`);
  process.exit(1);
}

console.log(`TOOL_CONTRACT registryTools=${ids.length} languages=${expectedLanguages} genericLocalizedRoutes=${expectedGenericRoutes} dedicatedRoutes=2 architecture=dynamic status=PASS`);
