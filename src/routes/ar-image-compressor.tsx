import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { ArabicImageCompressorPage } from '../tools/image-compressor/locale-pages';
import { toolHead } from '../seo/head';

export const arImageCompressorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ar/image-compressor',
  head: () => toolHead({
    title: 'ضغط الصور أونلاين مجانًا | FLIXO',
    description: 'اضغط صور JPG وPNG وWebP أونلاين داخل المتصفح. قلّل حجم الملفات وتحكم في الجودة والمقاسات بدون رفع الصور إلى خادم.',
    pathname: '/ar/image-compressor',
    language: 'ar',
    applicationCategory: 'MultimediaApplication',
  }),
  component: ArabicImageCompressorPage,
});
