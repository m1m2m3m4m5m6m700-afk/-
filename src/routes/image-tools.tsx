import type { ReactElement } from 'react';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { getToolLocale } from '../lib/i18n/locales';
import { BackgroundRemoverTool } from '../tools/background-remover';
import { AiImageGeneratorTool } from '../tools/ai-image-generator';
import { ImageUpscalerTool } from '../tools/image-upscaler';
import { ImageConverterTool } from '../tools/image-converter';
import { ImageToTextTool } from '../tools/image-to-text';
import { ObjectRemoverTool } from '../tools/object-remover';
import { CropResizeTool } from '../tools/crop-resize';
import { WatermarkRemoverTool } from '../tools/watermark-remover';
import { RasterToSvgTool } from '../tools/raster-to-svg';
import PhotoColorizerTool from '../tools/photo-colorizer';
import BackgroundBlurTool from '../tools/background-blur';
import PassportPhotoMakerTool from '../tools/passport-photo-maker';
import WatermarkAdderTool from '../tools/watermark-adder';
import MemeGeneratorTool from '../tools/meme-generator';
import CollageMakerTool from '../tools/collage-maker';
import ImageEffectsTool from '../tools/image-effects';
import ExifCleanerTool from '../tools/exif-cleaner';
import SvgOptimizerTool from '../tools/svg-optimizer';
import MockupGeneratorTool from '../tools/mockup-generator';
import ImageToSvgTool from '../tools/image-to-svg';
import ImageCropperTool from '../tools/image-cropper';
import ImageOcrTool from '../tools/image-ocr';
import SeedTool from '../tools/seed';
import PixTool from '../tools/pix';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://flixo.app').replace(/\/$/, '');

function imageToolRoute(path: string, id: string, component: () => ReactElement) {
  const copy = getToolLocale(id, 'en');
  const arabicPath = path.replace('/en/', '/ar/');
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
        { property: 'og:locale', content: 'en_US' },
      ],
      links: [
        { rel: 'canonical', href: `${SITE_URL}${path}` },
        { rel: 'alternate', hrefLang: 'en', href: `${SITE_URL}${path}` },
        { rel: 'alternate', hrefLang: 'ar', href: `${SITE_URL}${arabicPath}` },
        { rel: 'alternate', hrefLang: 'x-default', href: `${SITE_URL}${path}` },
      ],
    }),
    component,
  });
}

export const enBackgroundRemoverRoute = imageToolRoute('/en/background-remover', 'background-remover', BackgroundRemoverTool);
export const enAiImageGeneratorRoute = imageToolRoute('/en/ai-image-generator', 'ai-image-generator', AiImageGeneratorTool);
export const enImageUpscalerRoute = imageToolRoute('/en/image-upscaler', 'image-upscaler', ImageUpscalerTool);
export const enImageConverterRoute = imageToolRoute('/en/image-converter', 'image-converter', ImageConverterTool);
export const enImageToTextRoute = imageToolRoute('/en/image-to-text', 'image-to-text', ImageToTextTool);
export const enObjectRemoverRoute = imageToolRoute('/en/object-remover', 'object-remover', ObjectRemoverTool);
export const enCropResizeRoute = imageToolRoute('/en/crop-resize', 'crop-resize', CropResizeTool);
export const enWatermarkRemoverRoute = imageToolRoute('/en/watermark-remover', 'watermark-remover', WatermarkRemoverTool);
export const enRasterToSvgRoute = imageToolRoute('/en/raster-to-svg', 'raster-to-svg', RasterToSvgTool);
export const enImageCropperRoute = imageToolRoute('/en/image-cropper', 'image-cropper', ImageCropperTool);
export const enImageOcrRoute = imageToolRoute('/en/image-ocr', 'image-ocr', ImageOcrTool);
export const enPhotoColorizerRoute = imageToolRoute('/en/photo-colorizer', 'photo-colorizer', PhotoColorizerTool);
export const enBackgroundBlurRoute = imageToolRoute('/en/background-blur', 'background-blur', BackgroundBlurTool);
export const enPassportPhotoMakerRoute = imageToolRoute('/en/passport-photo-maker', 'passport-photo-maker', PassportPhotoMakerTool);
export const enWatermarkAdderRoute = imageToolRoute('/en/watermark-adder', 'watermark-adder', WatermarkAdderTool);
export const enMemeGeneratorRoute = imageToolRoute('/en/meme-generator', 'meme-generator', MemeGeneratorTool);
export const enCollageMakerRoute = imageToolRoute('/en/collage-maker', 'collage-maker', CollageMakerTool);
export const enImageEffectsRoute = imageToolRoute('/en/image-effects', 'image-effects', ImageEffectsTool);
export const enExifCleanerRoute = imageToolRoute('/en/exif-cleaner', 'exif-cleaner', ExifCleanerTool);
export const enSvgOptimizerRoute = imageToolRoute('/en/svg-optimizer', 'svg-optimizer', SvgOptimizerTool);
export const enMockupGeneratorRoute = imageToolRoute('/en/mockup-generator', 'mockup-generator', MockupGeneratorTool);
export const enImageToSvgRoute = imageToolRoute('/en/image-to-svg', 'image-to-svg', ImageToSvgTool);
export const enSeedRoute = imageToolRoute('/en/seed', 'seed', SeedTool);
export const enPixRoute = imageToolRoute('/en/pix', 'pix', PixTool);
