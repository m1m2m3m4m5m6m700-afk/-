import { createRouter } from '@tanstack/react-router';
import { indexRoute } from './routes/index';
import { arImageCompressorRoute } from './routes/ar-image-compressor';
import { enImageCompressorRoute } from './routes/en-image-compressor';
import { localizedToolRoutes } from './routes/localized-tool-routes';
import { rootRoute } from './routes/__root';

const routeTree = rootRoute.addChildren([
  indexRoute,
  enImageCompressorRoute,
  arImageCompressorRoute,
  ...localizedToolRoutes,
]);

const actualLocalizedRouteCount = localizedToolRoutes.length + 2;
if (actualLocalizedRouteCount !== 20 * 22) {
  throw new Error(`Expected 440 localized tool routes, got ${actualLocalizedRouteCount}.`);
}

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  notFoundMode: 'root',
});

declare module '@tanstack/react-router' {
  interface Register { router: typeof router; }
}
