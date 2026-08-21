import type { ReactElement } from 'react';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
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

function imageToolRoute(path: string, title: string, description: string, component: () => ReactElement) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    head: () => ({ meta: [
      { title: `${title} | FLIXO` },
      { name: 'description', content: description },
      { name: 'robots', content: 'index,follow,max-image-preview:large' },
      { property: 'og:title', content: `${title} | FLIXO` },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
    ] }),
    component,
  });
}

export const enBackgroundRemoverRoute = imageToolRoute('/en/background-remover', 'Background Remover', 'Remove simple image backgrounds locally in your browser.', BackgroundRemoverTool);
export const enAiImageGeneratorRoute = imageToolRoute('/en/ai-image-generator', 'AI Image Generator', 'Generate images through a configured FLIXO image-generation endpoint.', AiImageGeneratorTool);
export const enImageUpscalerRoute = imageToolRoute('/en/image-upscaler', 'Image Upscaler', 'Increase image dimensions with high-quality browser resampling.', ImageUpscalerTool);
export const enImageConverterRoute = imageToolRoute('/en/image-converter', 'Image Converter', 'Convert PNG, JPG, and WebP images in your browser.', ImageConverterTool);
export const enImageToTextRoute = imageToolRoute('/en/image-to-text', 'Image to Text OCR', 'Extract text from images in your browser with OCR.', ImageToTextTool);
export const enObjectRemoverRoute = imageToolRoute('/en/object-remover', 'Object Remover', 'Remove a rectangular object region with local reconstruction.', ObjectRemoverTool);
export const enCropResizeRoute = imageToolRoute('/en/crop-resize', 'Crop & Resize', 'Crop images and export them at exact dimensions.', CropResizeTool);
export const enWatermarkRemoverRoute = imageToolRoute('/en/watermark-remover', 'Watermark Remover', 'Cover a selected watermark region locally.', WatermarkRemoverTool);
export const enRasterToSvgRoute = imageToolRoute('/en/raster-to-svg', 'Raster to SVG', 'Convert a small raster image to pixel-based SVG.', RasterToSvgTool);
export const enPhotoColorizerRoute = imageToolRoute('/en/photo-colorizer', 'Photo Colorizer', 'Colorize photos through a configured AI endpoint.', PhotoColorizerTool);
export const enBackgroundBlurRoute = imageToolRoute('/en/background-blur', 'Background Blur', 'Blur background regions locally.', BackgroundBlurTool);
export const enPassportPhotoMakerRoute = imageToolRoute('/en/passport-photo-maker', 'Passport Photo Maker', 'Create a standard 413×531 portrait crop.', PassportPhotoMakerTool);
export const enWatermarkAdderRoute = imageToolRoute('/en/watermark-adder', 'Watermark Adder', 'Add text watermarks locally.', WatermarkAdderTool);
export const enMemeGeneratorRoute = imageToolRoute('/en/meme-generator', 'Meme Generator', 'Create top-and-bottom captioned memes.', MemeGeneratorTool);
export const enCollageMakerRoute = imageToolRoute('/en/collage-maker', 'Collage Maker', 'Combine multiple images into a collage.', CollageMakerTool);
export const enImageEffectsRoute = imageToolRoute('/en/image-effects', 'Image Effects', 'Apply image adjustments locally.', ImageEffectsTool);
export const enExifCleanerRoute = imageToolRoute('/en/exif-cleaner', 'EXIF Cleaner', 'Strip image metadata by browser re-encoding.', ExifCleanerTool);
export const enSvgOptimizerRoute = imageToolRoute('/en/svg-optimizer', 'SVG Optimizer', 'Minify SVG whitespace and comments locally.', SvgOptimizerTool);
export const enMockupGeneratorRoute = imageToolRoute('/en/mockup-generator', 'Mockup Generator', 'Create a simple device mockup image.', MockupGeneratorTool);
export const enImageToSvgRoute = imageToolRoute('/en/image-to-svg', 'Image to SVG', 'Wrap a raster image in a downloadable SVG.', ImageToSvgTool);
