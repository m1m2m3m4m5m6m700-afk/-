import { createRouter } from '@tanstack/react-router';
import { indexRoute } from './routes/index';
import { localizedToolRoutes } from './routes/localized-tool-routes';
import { rootRoute } from './routes/__root';

const routeTree = rootRoute.addChildren([
  indexRoute,
  ...localizedToolRoutes,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  notFoundMode: 'root',
});

declare module '@tanstack/react-router' {
  interface Register { router: typeof router; }
}
