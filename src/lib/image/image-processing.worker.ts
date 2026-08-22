type WorkerOperation =
  | { mode: 'draw'; outputType?: string; quality?: number }
  | { mode: 'background-blur'; radius?: number }
  | { mode: 'effects'; brightness: number; contrast: number; saturate: number; grayscale: number };

type WorkerRequest = { buffer: ArrayBuffer; type: string; operation: WorkerOperation };

function outputType(requested: string | undefined, inputType: string) {
  if (requested) return requested;
  return inputType === 'image/jpeg' || inputType === 'image/webp' || inputType === 'image/png' ? inputType : 'image/png';
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  try {
    if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') {
      throw new Error('OffscreenCanvas is unavailable.');
    }
    const { buffer, type, operation } = event.data;
    const bitmap = await createImageBitmap(new Blob([buffer], { type }));
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Worker canvas is unavailable.');

    if (operation.mode === 'background-blur') {
      const radius = Math.max(2, operation.radius ?? 16);
      context.filter = `blur(${radius}px)`;
      context.drawImage(bitmap, 0, 0);
      context.filter = 'none';
      const inset = Math.round(Math.min(bitmap.width, bitmap.height) * 0.18);
      context.drawImage(bitmap, inset, inset, bitmap.width - inset * 2, bitmap.height - inset * 2);
    } else if (operation.mode === 'effects') {
      context.filter = `brightness(${operation.brightness}%) contrast(${operation.contrast}%) saturate(${operation.saturate}%) grayscale(${operation.grayscale}%)`;
      context.drawImage(bitmap, 0, 0);
      context.filter = 'none';
    } else {
      context.drawImage(bitmap, 0, 0);
    }

    bitmap.close();
    const blob = await canvas.convertToBlob({ type: outputType(operation.mode === 'draw' ? operation.outputType : undefined, type), quality: operation.mode === 'draw' ? operation.quality : 0.96 });
    const result = await blob.arrayBuffer();
    self.postMessage({ ok: true, buffer: result, type: blob.type }, [result]);
  } catch (error) {
    self.postMessage({ ok: false, error: error instanceof Error ? error.message : 'Worker processing failed.' });
  }
};
