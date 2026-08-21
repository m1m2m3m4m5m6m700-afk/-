export type CompressionFormat = 'image/jpeg' | 'image/webp' | 'image/png';

export type CompressionOptions = {
  quality: number;
  format: CompressionFormat;
  maxWidth?: number;
  maxHeight?: number;
};

export type CompressionResult = {
  blob: Blob;
  width: number;
  height: number;
  mimeType: CompressionFormat;
};

const SUPPORTED_INPUTS = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
]);

function getTargetSize(width: number, height: number, maxWidth?: number, maxHeight?: number) {
  const widthLimit = maxWidth && maxWidth > 0 ? maxWidth : width;
  const heightLimit = maxHeight && maxHeight > 0 ? maxHeight : height;
  const scale = Math.min(1, widthLimit / width, heightLimit / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function compressImage(file: File, options: CompressionOptions): Promise<CompressionResult> {
  if (!SUPPORTED_INPUTS.has(file.type)) {
    throw new Error('Unsupported image format');
  }

  const bitmap = await createImageBitmap(file);
  try {
    const size = getTargetSize(bitmap.width, bitmap.height, options.maxWidth, options.maxHeight);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable');

    context.drawImage(bitmap, 0, 0, size.width, size.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Image encoding failed'))),
        options.format,
        Math.min(1, Math.max(0.1, options.quality)),
      );
    });

    return { blob, width: size.width, height: size.height, mimeType: options.format };
  } finally {
    bitmap.close();
  }
}
