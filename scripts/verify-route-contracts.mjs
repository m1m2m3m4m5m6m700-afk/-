import { readFile } from 'node:fs/promises';

const files = ['src/router.tsx', 'src/main.tsx', 'vite.config.ts'];
const source = Object.fromEntries(await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')])));

if (!source['src/router.tsx'].includes("from './routeTree.gen'")) {
  throw new Error('Route contract violation: src/router.tsx must consume only routeTree.gen.ts');
}

if (/createRootRoute|createRoute\(/.test(source['src/main.tsx'])) {
  throw new Error('Router contract violation: src/main.tsx must not construct routes directly');
}

if (!source['vite.config.ts'].includes("virtualRouteConfig: './routes.ts'")) {
  throw new Error('Route contract violation: TanStack Start virtualRouteConfig is missing');
}

if (!source['vite.config.ts'].includes("routeFileIgnorePattern: '(^|\\\\/)-virtual(?:\\\\/|$)'")) {
  throw new Error('Route contract violation: -virtual route files must be ignored by file-route scanning');
}

console.log('Route contracts: PASS');
