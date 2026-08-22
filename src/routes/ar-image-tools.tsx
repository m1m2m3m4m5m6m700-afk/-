import type { ReactElement } from 'react';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import {
  BackgroundRemoverTool,
  AiImageGeneratorTool,
  ImageUpscalerTool,
  ImageConverterTool,
  ImageToTextTool,
  ObjectRemoverTool,
  CropResizeTool,
  WatermarkRemoverTool,
  RasterToSvgTool,
  PhotoColorizerTool,
  BackgroundBlurTool,
  PassportPhotoMakerTool,
  WatermarkAdderTool,
  MemeGeneratorTool,
  CollageMakerTool,
  ImageEffectsTool,
  ExifCleanerTool,
  SvgOptimizerTool,
  MockupGeneratorTool,
  ImageToSvgTool,
  ImageCropperTool,
  ImageOcrTool,
  SeedTool,
  PixTool,
} from './image-tools-components';
import { getToolLocale, TOOL_I18N } from '../lib/i18n/locales';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://flixo.app').replace(/\/$/, '');

function arabicToolRoute(path: string, id: string, component: () => ReactElement) {
  const copy = getToolLocale(id, 'ar');
  const englishPath = path.replace('/ar/', '/en/');
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    head: () => ({
      meta: [
        { title: `${copy.title} | FLIXO` },
        { name: 'description', content: copy.description },
        { name: 'keywords', content: copy.keywords.join(', ') },
        { name: 'robots', content: 'index,follow,max-image-preview:large' },
        { property: 'og:title', content: `${copy.title} | FLIXO` },
        { property: 'og:description', content: copy.description },
        { property: 'og:locale', content: 'ar_EG' },
      ],
      links: [
        { rel: 'canonical', href: `${SITE_URL}${path}` },
        { rel: 'alternate', hrefLang: 'ar', href: `${SITE_URL}${path}` },
        { rel: 'alternate', hrefLang: 'en', href: `${SITE_URL}${englishPath}` },
        { rel: 'alternate', hrefLang: 'x-default', href: `${SITE_URL}${englishPath}` },
      ],
    }),
    component,
  });
}

export const arBackgroundRemoverRoute = arabicToolRoute('/ar/background-remover', 'background-remover', BackgroundRemoverTool);
export const arAiImageGeneratorRoute = arabicToolRoute('/ar/ai-image-generator', 'ai-image-generator', AiImageGeneratorTool);
export const arImageUpscalerRoute = arabicToolRoute('/ar/image-upscaler', 'image-upscaler', ImageUpscalerTool);
export const arImageConverterRoute = arabicToolRoute('/ar/image-converter', 'image-converter', ImageConverterTool);
export const arImageToTextRoute = arabicToolRoute('/ar/image-to-text', 'image-to-text', ImageToTextTool);
export const arObjectRemoverRoute = arabicToolRoute('/ar/object-remover', 'object-remover', ObjectRemoverTool);
export const arCropResizeRoute = arabicToolRoute('/ar/crop-resize', 'crop-resize', CropResizeTool);
export const arWatermarkRemoverRoute = arabicToolRoute('/ar/watermark-remover', 'watermark-remover', WatermarkRemoverTool);
export const arRasterToSvgRoute = arabicToolRoute('/ar/raster-to-svg', 'raster-to-svg', RasterToSvgTool);
export const arImageCropperRoute = arabicToolRoute('/ar/image-cropper', 'image-cropper', ImageCropperTool);
export const arImageOcrRoute = arabicToolRoute('/ar/image-ocr', 'image-ocr', ImageOcrTool);
export const arPhotoColorizerRoute = arabicToolRoute('/ar/photo-colorizer', 'photo-colorizer', PhotoColorizerTool);
export const arBackgroundBlurRoute = arabicToolRoute('/ar/background-blur', 'background-blur', BackgroundBlurTool);
export const arPassportPhotoMakerRoute = arabicToolRoute('/ar/passport-photo-maker', 'passport-photo-maker', PassportPhotoMakerTool);
export const arWatermarkAdderRoute = arabicToolRoute('/ar/watermark-adder', 'watermark-adder', WatermarkAdderTool);
export const arMemeGeneratorRoute = arabicToolRoute('/ar/meme-generator', 'meme-generator', MemeGeneratorTool);
export const arCollageMakerRoute = arabicToolRoute('/ar/collage-maker', 'collage-maker', CollageMakerTool);
export const arImageEffectsRoute = arabicToolRoute('/ar/image-effects', 'image-effects', ImageEffectsTool);
export const arExifCleanerRoute = arabicToolRoute('/ar/exif-cleaner', 'exif-cleaner', ExifCleanerTool);
export const arSvgOptimizerRoute = arabicToolRoute('/ar/svg-optimizer', 'svg-optimizer', SvgOptimizerTool);
export const arMockupGeneratorRoute = arabicToolRoute('/ar/mockup-generator', 'mockup-generator', MockupGeneratorTool);
export const arImageToSvgRoute = arabicToolRoute('/ar/image-to-svg', 'image-to-svg', ImageToSvgTool);
export const arSeedRoute = arabicToolRoute('/ar/seed', 'seed', SeedTool);
export const arPixRoute = arabicToolRoute('/ar/pix', 'pix', PixTool);

void TOOL_I18N;
