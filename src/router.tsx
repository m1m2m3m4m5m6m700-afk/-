import { createRouter } from '@tanstack/react-router';
import { arImageCompressorRoute } from './routes/ar-image-compressor';
import { arIndexRoute } from './routes/ar-index';
import {
  arAiImageGeneratorRoute, arBackgroundBlurRoute, arBackgroundRemoverRoute, arCollageMakerRoute,
  arCropResizeRoute, arExifCleanerRoute, arImageConverterRoute, arImageCropperRoute, arImageEffectsRoute,
  arImageOcrRoute, arImageToSvgRoute, arImageToTextRoute, arImageUpscalerRoute, arMemeGeneratorRoute,
  arMockupGeneratorRoute, arObjectRemoverRoute, arPassportPhotoMakerRoute, arPhotoColorizerRoute, arPixRoute,
  arRasterToSvgRoute, arSeedRoute, arSvgOptimizerRoute, arWatermarkAdderRoute, arWatermarkRemoverRoute,
} from './routes/ar-image-tools';
import { arQuickFlowRoute } from './routes/ar-quickflow';
import { arUseCaseRoute } from './routes/ar-use-case';
import { enImageCompressorRoute } from './routes/en-image-compressor';
import {
  enAiImageGeneratorRoute, enBackgroundBlurRoute, enBackgroundRemoverRoute, enCollageMakerRoute,
  enCropResizeRoute, enExifCleanerRoute, enImageConverterRoute, enImageCropperRoute, enImageEffectsRoute,
  enImageOcrRoute, enImageToSvgRoute, enImageToTextRoute, enImageUpscalerRoute, enMemeGeneratorRoute,
  enMockupGeneratorRoute, enObjectRemoverRoute, enPassportPhotoMakerRoute, enPhotoColorizerRoute, enPixRoute,
  enRasterToSvgRoute, enSeedRoute, enSvgOptimizerRoute, enWatermarkAdderRoute, enWatermarkRemoverRoute,
} from './routes/image-tools';
import { enQuickFlowRoute } from './routes/en-quickflow';
import { enUseCaseRoute } from './routes/en-use-case';
import { indexRoute } from './routes/index';
import { rootRoute } from './routes/__root';

const routeTree = rootRoute.addChildren([
  indexRoute, arIndexRoute,
  enImageCompressorRoute, arImageCompressorRoute,
  enQuickFlowRoute, arQuickFlowRoute,
  enUseCaseRoute, arUseCaseRoute,
  enBackgroundRemoverRoute, arBackgroundRemoverRoute,
  enAiImageGeneratorRoute, arAiImageGeneratorRoute,
  enImageUpscalerRoute, arImageUpscalerRoute,
  enImageConverterRoute, arImageConverterRoute,
  enImageToTextRoute, arImageToTextRoute,
  enObjectRemoverRoute, arObjectRemoverRoute,
  enCropResizeRoute, arCropResizeRoute,
  enWatermarkRemoverRoute, arWatermarkRemoverRoute,
  enRasterToSvgRoute, arRasterToSvgRoute,
  enImageCropperRoute, arImageCropperRoute,
  enImageOcrRoute, arImageOcrRoute,
  enPhotoColorizerRoute, arPhotoColorizerRoute,
  enBackgroundBlurRoute, arBackgroundBlurRoute,
  enPassportPhotoMakerRoute, arPassportPhotoMakerRoute,
  enWatermarkAdderRoute, arWatermarkAdderRoute,
  enMemeGeneratorRoute, arMemeGeneratorRoute,
  enCollageMakerRoute, arCollageMakerRoute,
  enImageEffectsRoute, arImageEffectsRoute,
  enExifCleanerRoute, arExifCleanerRoute,
  enSvgOptimizerRoute, arSvgOptimizerRoute,
  enMockupGeneratorRoute, arMockupGeneratorRoute,
  enImageToSvgRoute, arImageToSvgRoute,
  enSeedRoute, arSeedRoute,
  enPixRoute, arPixRoute,
]);

export const router = createRouter({ routeTree, defaultPreload: 'intent' });

export function getRouter() {
  return router;
}

declare module '@tanstack/react-router' {
  interface Register { router: typeof router; }
}
