import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export type ToolConfig = {
  readonly id: string;
  readonly title: string;
  readonly path: string;
  readonly description: string;
  readonly isReady: boolean;
  readonly component: LazyExoticComponent<ComponentType>;
};

const named = <T extends Record<string, ComponentType>>(loader: () => Promise<T>, key: keyof T) => lazy(() => loader().then((module) => ({ default: module[key] })));

export const TOOLS_REGISTRY: readonly ToolConfig[] = Object.freeze([
  { id: 'background-remover', title: 'Background Remover', path: '/en/background-remover', description: 'Remove connected, uniform backgrounds locally with edge-aware flood fill.', isReady: true, component: named(() => import('@/tools/background-remover'), 'BackgroundRemoverTool') },
  { id: 'ai-image-generator', title: 'AI Image Generator', path: '/en/ai-image-generator', description: 'Generate images through a configured FLIXO image-generation endpoint.', isReady: true, component: named(() => import('@/tools/ai-image-generator'), 'AiImageGeneratorTool') },
  { id: 'image-compressor', title: 'Compress Images Online', path: '/en/image-compressor', description: 'Reduce JPG, PNG, and WebP file size in your browser with quality and dimension controls.', isReady: true, component: named(() => import('@/tools/image-compressor'), 'ImageCompressorTool') },
  { id: 'image-upscaler', title: 'Image Upscaler', path: '/en/image-upscaler', description: 'Increase image dimensions with high-quality resampling and controlled sharpening.', isReady: true, component: named(() => import('@/tools/image-upscaler'), 'ImageUpscalerTool') },
  { id: 'image-converter', title: 'Image Converter', path: '/en/image-converter', description: 'Convert PNG, JPG, and WebP images in your browser while preserving dimensions.', isReady: true, component: named(() => import('@/tools/image-converter'), 'ImageConverterTool') },
  { id: 'image-to-text', title: 'Image to Text OCR', path: '/en/image-to-text', description: 'Extract text from images in your browser with OCR preprocessing.', isReady: true, component: named(() => import('@/tools/image-to-text'), 'ImageToTextTool') },
  { id: 'object-remover', title: 'Object Remover', path: '/en/object-remover', description: 'Reconstruct a selected rectangular region from surrounding pixels locally.', isReady: true, component: named(() => import('@/tools/object-remover'), 'ObjectRemoverTool') },
  { id: 'crop-resize', title: 'Crop & Resize', path: '/en/crop-resize', description: 'Crop images and export them at exact dimensions.', isReady: true, component: named(() => import('@/tools/crop-resize'), 'CropResizeTool') },
  { id: 'watermark-remover', title: 'Watermark Remover', path: '/en/watermark-remover', description: 'Reconstruct a selected watermark region locally with edge interpolation.', isReady: true, component: named(() => import('@/tools/watermark-remover'), 'WatermarkRemoverTool') },
  { id: 'raster-to-svg', title: 'Raster to SVG', path: '/en/raster-to-svg', description: 'Convert small raster images to compact pixel-based SVG with run-length grouping.', isReady: true, component: named(() => import('@/tools/raster-to-svg'), 'RasterToSvgTool') },
  { id: 'image-cropper', title: 'Image Cropper', path: '/en/image-cropper', description: 'Crop and resize images for exact dimensions.', isReady: true, component: lazy(() => import('@/tools/image-cropper')) },
  { id: 'image-to-svg', title: 'Image to SVG', path: '/en/image-to-svg', description: 'Convert a raster image into an SVG output that can be downloaded directly.', isReady: true, component: lazy(() => import('@/tools/image-to-svg')) },
  { id: 'image-ocr', title: 'Image OCR', path: '/en/image-ocr', description: 'Extract text from images with OCR.', isReady: true, component: named(() => import('@/tools/image-to-text'), 'ImageToTextTool') },
  { id: 'photo-colorizer', title: 'Photo Colorizer', path: '/en/photo-colorizer', description: 'Colorize photos through a configured AI contract endpoint.', isReady: false, component: lazy(() => import('@/tools/photo-colorizer')) },
  { id: 'background-blur', title: 'Background Blur', path: '/en/background-blur', description: 'Blur background regions locally in your browser.', isReady: true, component: lazy(() => import('@/tools/background-blur')) },
  { id: 'passport-photo-maker', title: 'Passport Photo Maker', path: '/en/passport-photo-maker', description: 'Create standard portrait photo crops locally.', isReady: true, component: lazy(() => import('@/tools/passport-photo-maker')) },
  { id: 'watermark-adder', title: 'Watermark Adder', path: '/en/watermark-adder', description: 'Add text watermarks directly in the browser.', isReady: true, component: lazy(() => import('@/tools/watermark-adder')) },
  { id: 'meme-generator', title: 'Meme Generator', path: '/en/meme-generator', description: 'Create memes with top and bottom text.', isReady: true, component: lazy(() => import('@/tools/meme-generator')) },
  { id: 'collage-maker', title: 'Collage Maker', path: '/en/collage-maker', description: 'Combine multiple images into a collage.', isReady: true, component: lazy(() => import('@/tools/collage-maker')) },
  { id: 'image-effects', title: 'Image Effects', path: '/en/image-effects', description: 'Apply brightness, contrast, saturation, and grayscale locally.', isReady: true, component: lazy(() => import('@/tools/image-effects')) },
  { id: 'exif-cleaner', title: 'EXIF Cleaner', path: '/en/exif-cleaner', description: 'Strip metadata by re-encoding images in the browser.', isReady: true, component: lazy(() => import('@/tools/exif-cleaner')) },
  { id: 'svg-optimizer', title: 'SVG Optimizer', path: '/en/svg-optimizer', description: 'Remove unnecessary SVG comments and whitespace locally.', isReady: true, component: lazy(() => import('@/tools/svg-optimizer')) },
  { id: 'mockup-generator', title: 'Mockup Generator', path: '/en/mockup-generator', description: 'Place images inside a simple device mockup.', isReady: true, component: lazy(() => import('@/tools/mockup-generator')) },
]);

export const getToolConfig = (id: string) => TOOLS_REGISTRY.find((tool) => tool.id === id);
export const getReadyToolConfigs = () => TOOLS_REGISTRY.filter((tool) => tool.isReady);
