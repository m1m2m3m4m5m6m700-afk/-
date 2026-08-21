import { createRouter } from '@tanstack/react-router';
import { arImageCompressorRoute } from './routes/ar-image-compressor';
import { calculatorRoute } from './routes/calculator';
import { enImageCompressorRoute } from './routes/en-image-compressor';
import { indexRoute } from './routes/index';
import { rootRoute } from './routes/__root';

const routeTree = rootRoute.addChildren([
  indexRoute,
  enImageCompressorRoute,
  arImageCompressorRoute,
  calculatorRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
