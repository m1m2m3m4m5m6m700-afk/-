import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { EnglishImageCompressorPage } from '../tools/image-compressor/locale-pages';
import { toolHead } from '../seo/head';

export const enImageCompressorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/en/image-compressor',
  head: () => toolHead({
    title: 'Compress Images Online Free | FLIXO',
    description: 'Compress JPG, PNG, and WebP images online in your browser. Reduce file size, control quality, and resize images without uploading them to a server.',
    pathname: '/en/image-compressor',
    language: 'en',
    applicationCategory: 'MultimediaApplication',
  }),
  component: EnglishImageCompressorPage,
});
