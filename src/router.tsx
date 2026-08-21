import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './routes/__root';

export const router = createRouter({
  routeTree: rootRoute,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
