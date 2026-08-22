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
  enImageCropperRoute,
  enImageEffectsRoute,
  enImageOcrRoute,
  enImageToSvgRoute,
  enImageToTextRoute,
  enImageUpscalerRoute,
  enMemeGeneratorRoute,
  enMockupGeneratorRoute,
  enObjectRemoverRoute,
  enPassportPhotoMakerRoute,
  enPhotoColorizerRoute,
  enPixRoute,
  enRasterToSvgRoute,
  enSeedRoute,
  enSvgOptimizerRoute,
  enWatermarkAdderRoute,
  enWatermarkRemoverRoute,
} from './routes/image-tools';
import { enQuickFlowRoute } from './routes/en-quickflow';
import { indexRoute } from './routes/index';
import { rootRoute } from './routes/__root';

const routeTree = rootRoute.addChildren([
  indexRoute,
  enImageCompressorRoute,
  arImageCompressorRoute,
  enQuickFlowRoute,
  enBackgroundRemoverRoute,
  enAiImageGeneratorRoute,
  enImageUpscalerRoute,
  enImageConverterRoute,
  enImageToTextRoute,
  enObjectRemoverRoute,
  enCropResizeRoute,
  enWatermarkRemoverRoute,
  enRasterToSvgRoute,
  enImageCropperRoute,
  enImageOcrRoute,
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
  enSeedRoute,
  enPixRoute,
]);

export const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register { router: typeof router; }
}
