import { readFile, readdir } from 'node:fs/promises';

const failures = [];
const warnings = [];

const read = async (path) => readFile(path, 'utf8').catch(() => '');
const pushFailure = (message) => failures.push(message);

const router = await read('src/router.tsx');
const vite = await read('vite.config.ts');
const root = await read('src/routes/__root.tsx');
const main = await read('src/main.tsx');
const packageJson = JSON.parse(await read('package.json') || '{}');

if (!router.includes("from './routeTree.gen'")) pushFailure('router.tsx is not consuming the generated routeTree.gen.ts');
if (!root.includes('createRootRoute') || !root.includes('export const Route')) pushFailure('__root.tsx must expose the canonical Route contract');
if (/createRootRoute|createRoute\(/.test(main)) pushFailure('main.tsx must not construct route definitions');
if (!vite.includes("virtualRouteConfig: './routes.ts'")) pushFailure('virtualRouteConfig is missing from vite.config.ts');
if (!vite.includes('routeFileIgnorePattern')) pushFailure('routeFileIgnorePattern is missing from TanStack Start configuration');
if (!packageJson.scripts?.['verify:routes']) pushFailure('verify:routes script is missing');
if (!packageJson.scripts?.['test:unit']) pushFailure('test:unit script is missing');

const routeFiles = await readdir('src/routes', { withFileTypes: true }).catch(() => []);
const routeSourceFiles = routeFiles.filter((entry) => entry.isFile() && entry.name.endsWith('.tsx') && entry.name !== 'routeTree.gen.ts');
const routePaths = new Map();

for (const entry of routeSourceFiles) {
  const path = `src/routes/${entry.name}`;
  const source = await read(path);
  const matches = [...source.matchAll(/createFileRoute\(['"]([^'"]+)['"]\)/g)];
  for (const match of matches) {
    const routePath = match[1];
    const previous = routePaths.get(routePath);
    if (previous) pushFailure(`duplicate createFileRoute path ${routePath}: ${previous} and ${path}`);
    routePaths.set(routePath, path);
  }
}

if (!routePaths.size) warnings.push('No createFileRoute declarations were found in src/routes; virtual route mode may be in use for all routes.');

if (failures.length) {
  console.error(JSON.stringify({ stage: 'preflight', status: 'failed', failures, warnings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ stage: 'preflight', status: 'ok', routeCount: routePaths.size, warnings }, null, 2));
