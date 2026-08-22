import { readFile, readdir } from 'node:fs/promises';

const failures = [];
const warnings = [];

const read = async (path) => readFile(path, 'utf8').catch(() => '');
const pushFailure = (message) => failures.push(message);

const router = await read('src/router.tsx');
const vite = await read('vite.config.ts');
const root = await read('src/routes/__root.tsx');
const main = await read('src/main.tsx');
const packageText = await read('package.json');
const lockText = await read('package-lock.json');
const packageJson = packageText ? JSON.parse(packageText) : {};
const lockJson = lockText ? JSON.parse(lockText) : {};

if (!router.includes("from './routeTree.gen'")) pushFailure('router.tsx is not consuming the generated routeTree.gen.ts');
if (!root.includes('createRootRoute') || !root.includes('export const Route')) pushFailure('__root.tsx must expose the canonical Route contract');
if (/createRootRoute|createRoute\(/.test(main)) pushFailure('main.tsx must not construct route definitions');
if (!vite.includes("virtualRouteConfig: './routes.ts'")) pushFailure('virtualRouteConfig is missing from vite.config.ts');
if (!vite.includes('routeFileIgnorePattern')) pushFailure('routeFileIgnorePattern is missing from TanStack Start configuration');
if (!packageJson.scripts?.['verify:routes']) pushFailure('verify:routes script is missing');
if (!packageJson.scripts?.['test:unit']) pushFailure('test:unit script is missing');

const manifest = lockJson.packages?.[''];
if (!manifest) pushFailure('package-lock.json has no root package manifest');
else {
  for (const section of ['dependencies', 'devDependencies']) {
    const expected = packageJson[section] ?? {};
    const locked = manifest[section] ?? {};
    for (const name of Object.keys(expected)) if (!(name in locked)) pushFailure(`lockfile missing ${section} entry: ${name}`);
    for (const name of Object.keys(locked)) if (!(name in expected)) pushFailure(`package.json missing ${section} entry present in lockfile: ${name}`);
    for (const name of Object.keys(expected)) if (name in locked && expected[name] !== locked[name]) pushFailure(`manifest/lock drift in ${section}: ${name} (${expected[name]} != ${locked[name]})`);
  }
}

const allRouteSourceFiles = [];
async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      if (entry.name === '-virtual') continue;
      await collect(path);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      allRouteSourceFiles.push(path);
    }
  }
}
await collect('src/routes');

const routeFactories = new Map();
for (const path of allRouteSourceFiles) {
  const source = await read(path);
  for (const match of source.matchAll(/createRoute\(\{[\s\S]*?path:\s*['"]([^'"]+)['"]/g)) {
    const routePath = match[1];
    const previous = routeFactories.get(routePath);
    if (previous && previous !== path) pushFailure(`duplicate route factory path ${routePath}: ${previous} and ${path}`);
    routeFactories.set(routePath, path);
  }
  for (const match of source.matchAll(/createFileRoute\(['"]([^'"]+)['"]\)/g)) {
    const routePath = match[1];
    const previous = routeFactories.get(routePath);
    if (previous && previous !== path) pushFailure(`duplicate file route path ${routePath}: ${previous} and ${path}`);
    routeFactories.set(routePath, path);
  }
}

const routesSource = await read('routes.ts');
const configuredRoutes = new Map();
for (const match of routesSource.matchAll(/path:\s*['"]([^'"]+)['"][,\s]+file:\s*['"]-virtual\/([^'"]+)['"]/g)) configuredRoutes.set(match[1], match[2]);

function resolveVirtualSource(virtualFile) {
  const virtualPath = `src/routes/-virtual/${virtualFile}`;
  return read(virtualPath).then((source) => {
    if (!source) return null;
    const reexport = source.match(/from\s+['"]\.\.\/([^'"]+)['"]/);
    if (!reexport) return virtualPath;
    const stem = reexport[1].replace(/\.tsx?$|\.js$/, '');
    const candidates = [`src/routes/${stem}.tsx`, `src/routes/${stem}.ts`, `src/routes/${stem}/index.tsx`, `src/routes/${stem}/index.ts`];
    return candidates.find((candidate) => allRouteSourceFiles.includes(candidate)) ?? virtualPath;
  });
}

for (const [configuredPath, virtualFile] of configuredRoutes) {
  const sourcePath = await resolveVirtualSource(virtualFile);
  if (!sourcePath) {
    pushFailure(`virtual route source missing for ${configuredPath}: ${virtualFile}`);
    continue;
  }
  if (sourcePath.startsWith('src/routes/-virtual/')) continue;
  const declaredPaths = [...routeFactories.entries()].filter(([, path]) => path === sourcePath).map(([path]) => path);
  if (declaredPaths.length && !declaredPaths.includes(configuredPath)) pushFailure(`route tree path mismatch: routes.ts says ${configuredPath}, source ${sourcePath} declares ${declaredPaths.join(', ')}`);
}

if (!configuredRoutes.size) warnings.push('No route entries found in routes.ts');

if (failures.length) {
  console.error(JSON.stringify({ stage: 'preflight', status: 'failed', failures, warnings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ stage: 'preflight', status: 'ok', routeFactoryCount: routeFactories.size, configuredRouteCount: configuredRoutes.size, warnings }, null, 2));
