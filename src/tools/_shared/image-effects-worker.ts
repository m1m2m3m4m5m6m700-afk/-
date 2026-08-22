export {};

type WorkerMessage = {
  blob: Blob;
  width: number;
  height: number;
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
};

type WorkerScope = {
  onmessage: ((event: MessageEvent<WorkerMessage>) => void | Promise<void>) | null;
  postMessage(message: unknown): void;
};

const scope = self as unknown as WorkerScope;

scope.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  try {
    if (typeof OffscreenCanvas === 'undefined') throw new Error('Image Effects Worker is unavailable.');
    const image = await createImageBitmap(event.data.blob);
    const canvas = new OffscreenCanvas(event.data.width, event.data.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable.');
    context.filter = `brightness(${event.data.brightness}%) contrast(${event.data.contrast}%) saturate(${event.data.saturate}%) grayscale(${event.data.grayscale}%)`;
    context.drawImage(image, 0, 0, event.data.width, event.data.height);
    image.close();
    const output = await canvas.convertToBlob({ type: 'image/png', quality: 0.96 });
    scope.postMessage({ ok: true, blob: output });
  } catch (error) {
    scope.postMessage({ ok: false, error: error instanceof Error ? error.message : 'Image Effects Worker failed.' });
  }
};
