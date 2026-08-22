export const INDEXABLE_ROUTES = [
  '/',
  '/en/image-compressor',
  '/ar/image-compressor',
  '/en/background-remover',
  '/en/ai-image-generator',
  '/en/image-upscaler',
  '/en/image-converter',
  '/en/image-to-text',
  '/en/object-remover',
  '/en/crop-resize',
  '/en/watermark-remover',
  '/en/raster-to-svg',
  '/en/image-cropper',
  '/en/image-ocr',
  '/en/photo-colorizer',
  '/en/background-blur',
  '/en/passport-photo-maker',
  '/en/watermark-adder',
  '/en/meme-generator',
  '/en/collage-maker',
  '/en/image-effects',
  '/en/exif-cleaner',
  '/en/svg-optimizer',
  '/en/mockup-generator',
  '/en/image-to-svg',
  '/en/seed',
  '/en/pix',
] as const;

export function localeForPath(pathname: string): 'en' | 'ar' {
  return pathname.startsWith('/ar/') || pathname === '/ar' ? 'ar' : 'en';
}
