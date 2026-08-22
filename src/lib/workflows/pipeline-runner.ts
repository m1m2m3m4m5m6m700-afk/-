import { compressImage } from '@/tools/image-compressor/engine';
import { MAX_OUTPUT_PIXELS, convertImage, cropResizeImage, imageInfo, removeBackground, resizeImage } from '@/tools/image-toolkit/engine';
import type { ExecutionPlan } from '@/lib/ai/planner';

export interface PipelineProgress {
  currentStepIndex: number;
  totalSteps: number;
  currentToolId: string;
  outputBlob?: Blob;
}

function asFile(blob: Blob, name = 'flixo-pipeline-input.png') {
  return new File([blob], name, { type: blob.type || 'image/png' });
}

type PipelineParams = Record<string, string | number | boolean | undefined>;

async function effects(blob: Blob, params?: PipelineParams) {
  const image = await imageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable.');
  const brightness = Number(params?.brightness ?? 100);
  const contrast = Number(params?.contrast ?? 100);
  const saturate = Number(params?.saturate ?? 100);
  const grayscale = Number(params?.grayscale ?? 0);
  try {
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%)`;
    ctx.drawImage(image, 0, 0);
    return canvasToBlob(canvas, 'image/png');
  } finally {
    if ('close' in image && typeof image.close === 'function') image.close();
  }
}

async function imageBitmap(blob: Blob) {
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality = 0.94) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Image encoding failed.')), type, quality));
}

async function processToolStep(toolId: string, inputBlob: Blob, params: PipelineParams = {}) {
  switch (toolId) {
    case 'background-remover':
      return removeBackground(inputBlob, Number(params.tolerance ?? 42));
    case 'image-upscaler': {
      const info = await imageInfo(inputBlob);
      const scale = Number(params.scale ?? 2);
      const pixels = Math.round(info.width * scale) * Math.round(info.height * scale);
      if (!Number.isFinite(pixels) || pixels > MAX_OUTPUT_PIXELS) throw new Error('The requested upscale is too large for safe browser processing. Reduce the scale or image dimensions and try again.');
      return resizeImage(inputBlob, scale);
    }
    case 'image-cropper': {
      const info = await imageInfo(inputBlob);
      const ratio = String(params.aspectRatio ?? '1:1').split(':').map(Number);
      const targetRatio = ratio.length === 2 && ratio[1] > 0 ? ratio[0] / ratio[1] : 1;
      const sourceRatio = info.width / info.height;
      let cropWidth = info.width;
      let cropHeight = info.height;
      if (sourceRatio > targetRatio) cropWidth = Math.max(1, Math.round(info.height * targetRatio));
      else cropHeight = Math.max(1, Math.round(info.width / targetRatio));
      const x = Math.round((info.width - cropWidth) / 2);
      const y = Math.round((info.height - cropHeight) / 2);
      const outWidth = Number(params.width ?? cropWidth);
      const outHeight = Number(params.height ?? cropHeight);
      if (!Number.isFinite(outWidth) || !Number.isFinite(outHeight) || outWidth * outHeight > MAX_OUTPUT_PIXELS) throw new Error('The requested crop output is too large for safe browser processing.');
      return cropResizeImage(inputBlob, { x, y, width: cropWidth, height: cropHeight }, { width: outWidth, height: outHeight });
    }
    case 'image-compressor': {
      const file = asFile(inputBlob);
      const result = await compressImage(file, {
        quality: Number(params.quality ?? 0.82),
        format: String(params.format ?? 'image/webp') as 'image/webp' | 'image/jpeg' | 'image/png',
        maxWidth: Number(params.maxWidth ?? 0) || undefined,
        maxHeight: Number(params.maxHeight ?? 0) || undefined,
        targetSizeKB: Number(params.targetSizeKB ?? 0) || undefined,
      });
      return result.blob;
    }
    case 'image-converter':
      return convertImage(inputBlob, String(params.format ?? 'image/webp') as 'image/webp' | 'image/jpeg' | 'image/png');
    case 'image-effects':
      return effects(inputBlob, params);
    default:
      throw new Error(`Tool \"${toolId}\" is not pipeline-enabled yet.`);
  }
}

export async function runWorkflowPipeline(initialFile: File, plan: ExecutionPlan, onProgress: (progress: PipelineProgress) => void): Promise<Blob> {
  if (plan.steps.length === 0 || plan.steps.length > 4) throw new Error('FLIXO plans must contain 1 to 4 steps.');
  let currentBlob: Blob = initialFile;
  for (let i = 0; i < plan.steps.length; i += 1) {
    const step = plan.steps[i];
    onProgress({ currentStepIndex: i + 1, totalSteps: plan.steps.length, currentToolId: step.toolId });
    currentBlob = await processToolStep(step.toolId, currentBlob, step.params);
    onProgress({ currentStepIndex: i + 1, totalSteps: plan.steps.length, currentToolId: step.toolId, outputBlob: currentBlob });
  }
  return currentBlob;
}
