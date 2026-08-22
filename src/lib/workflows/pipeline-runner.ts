import { compressImage } from '@/tools/image-compressor/engine';
import { convertImage, cropResizeImage, imageInfo, removeBackground, resizeImage } from '@/tools/image-toolkit/engine';
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

async function effects(blob: Blob, params?: Record<string, string | number | boolean>) {
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
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%)`;
  ctx.drawImage(image, 0, 0);
  return canvasToBlob(canvas, 'image/png');
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

async function processToolStep(toolId: string, inputBlob: Blob, params: Record<string, string | number | boolean> = {}) {
  switch (toolId) {
    case 'background-remover':
      return removeBackground(inputBlob, Number(params.tolerance ?? 42));
    case 'image-upscaler':
      return resizeImage(inputBlob, Number(params.scale ?? 2));
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
      return cropResizeImage(inputBlob, { x, y, width: cropWidth, height: cropHeight }, {
        width: Number(params.width ?? cropWidth),
        height: Number(params.height ?? cropHeight),
      });
    }
    case 'image-compressor': {
      const file = asFile(inputBlob);
      const result = await compressImage(file, {
        quality: Number(params.quality ?? 0.82),
        format: (String(params.format ?? 'image/webp') as 'image/webp' | 'image/jpeg' | 'image/png'),
        maxWidth: Number(params.maxWidth ?? 0) || undefined,
        maxHeight: Number(params.maxHeight ?? 0) || undefined,
        targetSizeKB: Number(params.targetSizeKB ?? 0) || undefined,
      });
      return result.blob;
    }
    case 'image-converter':
      return convertImage(inputBlob, (String(params.format ?? 'image/webp') as 'image/webp' | 'image/jpeg' | 'image/png'));
    case 'image-effects':
      return effects(inputBlob, params);
    default:
      throw new Error(`Tool "${toolId}" is not pipeline-enabled yet.`);
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
