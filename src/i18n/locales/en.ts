import type { TranslationSchema } from '../schema';

export const locale = {
  code: 'en', dir: 'ltr',
  common: { processing: 'Local browser processing', download: 'Download', clear: 'Clear', upload: 'Upload file', privacy: 'Files are processed locally in your browser when this tool supports local processing.', notFoundTitle: 'Page not found', notFoundDescription: 'The requested language or tool page does not exist.' },
  glossary: { clientSideProcessing: 'Local browser processing' },
  tools: {
    'image-compressor': { title: 'Image Compressor', description: 'Compress images with local browser processing.' },
    'background-remover': { title: 'Background Remover', description: 'Remove image backgrounds with local browser processing.' },
    'image-upscaler': { title: 'Image Upscaler', description: 'Upscale images with local browser processing.' },
    'image-converter': { title: 'Image Converter', description: 'Convert image formats with local browser processing.' },
    'ai-image-generator': { title: 'AI Image Generator', description: 'Generate images with a configured AI service.' },
    'object-remover': { title: 'Object Remover', description: 'Remove selected objects from images.' },
    'watermark-remover': { title: 'Watermark Remover', description: 'Remove selected watermarks from images.' },
    'image-cropper': { title: 'Image Cropper', description: 'Crop images to precise dimensions.' },
    'image-to-svg': { title: 'Image to SVG', description: 'Convert raster images to SVG.' },
    'image-ocr': { title: 'Image OCR', description: 'Extract text from images with OCR.' },
    'photo-colorizer': { title: 'Photo Colorizer', description: 'Colorize photos with a configured AI service.' },
    'background-blur': { title: 'Background Blur', description: 'Blur image backgrounds.' },
    'passport-photo-maker': { title: 'Passport Photo Maker', description: 'Create standard passport photo crops.' },
    'watermark-adder': { title: 'Watermark Adder', description: 'Add a watermark to an image.' },
    'meme-generator': { title: 'Meme Generator', description: 'Create captioned memes.' },
    'collage-maker': { title: 'Collage Maker', description: 'Combine images into a collage.' },
    'image-effects': { title: 'Image Effects', description: 'Apply common image effects.' },
    'exif-cleaner': { title: 'EXIF Cleaner', description: 'Remove EXIF metadata from images.' },
    'svg-optimizer': { title: 'SVG Optimizer', description: 'Optimize SVG markup.' },
    'mockup-generator': { title: 'Mockup Generator', description: 'Create simple image mockups.' },
    seed: { title: 'Seed', description: 'Apply browser-based GPU image adjustments.' },
    pix: { title: 'Pix Studio', description: 'Edit images in a browser-based studio.' },
  },
} satisfies TranslationSchema;

export default locale;
