import { readFile } from 'node:fs/promises';

const files = ['src/router.tsx', 'src/main.tsx', 'vite.config.ts', 'src/routes/__root.tsx', 'src/routes/index.tsx', 'src/routes/-virtual/root.tsx', 'src/routes/-virtual/index.tsx'];
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

if (!source['vite.config.ts'].includes("image-tools\\.tsx")) {
  throw new Error('Route contract violation: route-factory helper modules must be ignored by file-route scanning');
}

for (const file of ['src/routes/__root.tsx', 'src/routes/index.tsx']) {
  if (!/export const Route\s*=/.test(source[file])) {
    throw new Error(`Route contract violation: ${file} must export the standard Route symbol`);
  }
}

if (!source['src/routes/-virtual/root.tsx'].includes('export { Route }')) {
  throw new Error('Route contract violation: virtual root must re-export Route');
}
if (!source['src/routes/-virtual/index.tsx'].includes('export { Route }')) {
  throw new Error('Route contract violation: virtual index must re-export Route');
}

console.log('Route contracts: PASS');
