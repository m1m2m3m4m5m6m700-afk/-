import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { ImageCompressor } from '../tools/image-compressor';

export const enImageCompressorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/en/image-compressor',
  head: () => ({
    meta: [
      { title: 'Compress Images Online Free | FLIXO' },
      { name: 'description', content: 'Compress JPG, PNG, and WebP images online in your browser. Reduce file size, control quality, and resize images without uploading them to a server.' },
      { name: 'robots', content: 'index,follow,max-image-preview:large' },
      { property: 'og:title', content: 'Compress Images Online Free | FLIXO' },
      { property: 'og:description', content: 'Reduce image file size in your browser with quality and dimension controls.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [
      { rel: 'alternate', hrefLang: 'en', href: '/en/image-compressor' },
      { rel: 'alternate', hrefLang: 'ar', href: '/ar/image-compressor' },
      { rel: 'alternate', hrefLang: 'x-default', href: '/en/image-compressor' },
    ],
    scripts: [{
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'FLIXO Image Compressor',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        description: 'Compress JPG, PNG, and WebP images online in your browser.',
        inLanguage: 'en',
      }),
    }],
  }),
  component: () => <ImageCompressor locale="en" />,
});
