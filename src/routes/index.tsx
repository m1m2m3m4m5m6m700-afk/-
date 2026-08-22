import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { HomePage } from './home-page';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  head: () => ({
    meta: [
      { title: 'FLIXO | Fast Private Browser Tools' },
      { name: 'description', content: 'Find fast browser-first tools for images, AI, OCR, conversion, and more. Start instantly with privacy-focused processing.' },
      { name: 'robots', content: 'index,follow,max-image-preview:large' },
    ],
  }),
  component: HomePage,
});
