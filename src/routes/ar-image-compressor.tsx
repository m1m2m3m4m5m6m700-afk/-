import { createFileRoute } from '@tanstack/react-router';
import { ArabicImageCompressorPage } from '../tools/image-compressor/locale-pages';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://flixo.app').replace(/\/$/, '');

export const Route = createFileRoute('/ar/image-compressor')({
  head: () => ({
    meta: [
      { title: 'ضغط الصور أونلاين مجانًا | FLIXO' },
      { name: 'description', content: 'اضغط صور JPG وPNG وWebP داخل المتصفح، مع التحكم في الجودة والمقاسات دون رفع الصور إلى خادم FLIXO لمعالجتها.' },
      { name: 'keywords', content: 'ضغط الصور, تصغير حجم الصورة, ضغط JPG, ضغط PNG, ضغط WebP' },
      { name: 'robots', content: 'index,follow,max-image-preview:large' },
      { property: 'og:title', content: 'ضغط الصور أونلاين مجانًا | FLIXO' },
      { property: 'og:description', content: 'قلّل حجم الصور داخل المتصفح مع التحكم في الجودة والمقاسات.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/ar/image-compressor` },
      { property: 'og:locale', content: 'ar_EG' },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [
      { rel: 'canonical', href: `${SITE_URL}/ar/image-compressor` },
      { rel: 'alternate', hrefLang: 'en', href: `${SITE_URL}/en/image-compressor` },
      { rel: 'alternate', hrefLang: 'ar', href: `${SITE_URL}/ar/image-compressor` },
      { rel: 'alternate', hrefLang: 'x-default', href: `${SITE_URL}/en/image-compressor` },
    ],
    scripts: [{
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'FLIXO — ضغط الصور',
        url: `${SITE_URL}/ar/image-compressor`,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        description: 'ضغط صور JPG وPNG وWebP داخل المتصفح.',
        inLanguage: 'ar',
        isAccessibleForFree: true,
      }),
    }],
  }),
  component: ArabicImageCompressorPage,
});
