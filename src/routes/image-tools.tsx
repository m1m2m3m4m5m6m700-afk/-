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

function imageToolRoute(path: string, title: string, description: string, component: () => JSX.Element) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    head: () => ({
      meta: [
        { title: `${title} | FLIXO` },
        { name: 'description', content: description },
        { name: 'robots', content: 'index,follow,max-image-preview:large' },
        { property: 'og:title', content: `${title} | FLIXO` },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
      ],
    }),
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
