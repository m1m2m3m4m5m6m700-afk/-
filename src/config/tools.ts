export type ToolConfig = {
  readonly id: string;
  readonly title: string;
  readonly path: string;
  readonly description: string;
  readonly isReady: boolean;
};

export const TOOLS_REGISTRY: readonly ToolConfig[] = Object.freeze([
  { id: 'background-remover', title: 'Background Remover', path: '/en/background-remover', description: 'Remove connected, uniform backgrounds locally with edge-aware flood fill.', isReady: true },
  { id: 'ai-image-generator', title: 'AI Image Generator', path: '/en/ai-image-generator', description: 'Generate images through a configured FLIXO image-generation endpoint.', isReady: true },
  { id: 'image-compressor', title: 'Compress Images Online', path: '/en/image-compressor', description: 'Reduce JPG, PNG, and WebP file size in your browser with quality and dimension controls.', isReady: true },
  { id: 'image-upscaler', title: 'Image Upscaler', path: '/en/image-upscaler', description: 'Increase image dimensions with high-quality resampling and controlled sharpening.', isReady: true },
  { id: 'image-converter', title: 'Image Converter', path: '/en/image-converter', description: 'Convert PNG, JPG, and WebP images in your browser while preserving dimensions.', isReady: true },
  { id: 'image-to-text', title: 'Image to Text OCR', path: '/en/image-to-text', description: 'Extract text from images in your browser with OCR preprocessing.', isReady: true },
  { id: 'object-remover', title: 'Object Remover', path: '/en/object-remover', description: 'Reconstruct a selected rectangular region from surrounding pixels locally.', isReady: true },
  { id: 'crop-resize', title: 'Crop & Resize', path: '/en/crop-resize', description: 'Crop images and export them at exact dimensions.', isReady: true },
  { id: 'watermark-remover', title: 'Watermark Remover', path: '/en/watermark-remover', description: 'Reconstruct a selected watermark region locally with edge interpolation.', isReady: true },
  { id: 'raster-to-svg', title: 'Raster to SVG', path: '/en/raster-to-svg', description: 'Convert small raster images to compact pixel-based SVG with run-length grouping.', isReady: true },
]);

export const getToolConfig = (id: string) => TOOLS_REGISTRY.find((tool) => tool.id === id);
export const getReadyToolConfigs = () => TOOLS_REGISTRY.filter((tool) => tool.isReady);
