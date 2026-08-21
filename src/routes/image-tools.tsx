import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { ImageToolPage } from '../tools/image-toolkit';

function imageToolRoute(path: string, title: string, description: string, toolId: Parameters<typeof ImageToolPage>[0]['toolId']) {
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
    component: () => <ImageToolPage toolId={toolId} />,
  });
}

export const enBackgroundRemoverRoute = imageToolRoute('/en/background-remover', 'Background Remover', 'Remove simple image backgrounds locally in your browser.', 'background-remover');
export const enAiImageGeneratorRoute = imageToolRoute('/en/ai-image-generator', 'AI Image Generator', 'Generate images through a configured FLIXO image-generation endpoint.', 'ai-image-generator');
export const enImageUpscalerRoute = imageToolRoute('/en/image-upscaler', 'AI Image Upscaler', 'Increase image dimensions with high-quality browser resampling.', 'image-upscaler');
export const enImageConverterRoute = imageToolRoute('/en/image-converter', 'Image Converter', 'Convert PNG, JPG, and WebP images in your browser.', 'image-converter');
export const enImageToTextRoute = imageToolRoute('/en/image-to-text', 'Image to Text OCR', 'Extract text from images in your browser with OCR.', 'image-to-text');
export const enObjectRemoverRoute = imageToolRoute('/en/object-remover', 'Object Remover', 'Remove a rectangular object region with local reconstruction.', 'object-remover');
export const enCropResizeRoute = imageToolRoute('/en/crop-resize', 'Crop & Resize', 'Crop images and export them at exact dimensions.', 'crop-resize');
export const enWatermarkRemoverRoute = imageToolRoute('/en/watermark-remover', 'Watermark Remover', 'Cover a selected watermark region locally.', 'watermark-remover');
export const enRasterToSvgRoute = imageToolRoute('/en/raster-to-svg', 'Raster to SVG', 'Convert a small raster image to pixel-based SVG.', 'raster-to-svg');
