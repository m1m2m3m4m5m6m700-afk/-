import { createRouter } from '@tanstack/react-router';
import { arImageCompressorRoute } from './routes/ar-image-compressor';
import { enImageCompressorRoute } from './routes/en-image-compressor';
import {
  enAiImageGeneratorRoute,
  enBackgroundBlurRoute,
  enBackgroundRemoverRoute,
  enCollageMakerRoute,
  enCropResizeRoute,
  enExifCleanerRoute,
  enImageConverterRoute,
  enImageEffectsRoute,
  enImageToSvgRoute,
  enImageToTextRoute,
  enImageUpscalerRoute,
  enMemeGeneratorRoute,
  enMockupGeneratorRoute,
  enObjectRemoverRoute,
  enPassportPhotoMakerRoute,
  enPhotoColorizerRoute,
  enRasterToSvgRoute,
  enSvgOptimizerRoute,
  enWatermarkAdderRoute,
  enWatermarkRemoverRoute,
} from './routes/image-tools';
import { indexRoute } from './routes/index';
import { rootRoute } from './routes/__root';

const routeTree = rootRoute.addChildren([
  indexRoute,
  enImageCompressorRoute,
  arImageCompressorRoute,
  enBackgroundRemoverRoute,
  enAiImageGeneratorRoute,
  enImageUpscalerRoute,
  enImageConverterRoute,
  enImageToTextRoute,
  enObjectRemoverRoute,
  enCropResizeRoute,
  enWatermarkRemoverRoute,
  enRasterToSvgRoute,
  enPhotoColorizerRoute,
  enBackgroundBlurRoute,
  enPassportPhotoMakerRoute,
  enWatermarkAdderRoute,
  enMemeGeneratorRoute,
  enCollageMakerRoute,
  enImageEffectsRoute,
  enExifCleanerRoute,
  enSvgOptimizerRoute,
  enMockupGeneratorRoute,
  enImageToSvgRoute,
]);

export const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register { router: typeof router; }
}
