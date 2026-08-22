export type WorkerImageOperation =
  | { mode: 'draw'; outputType?: string; quality?: number }
  | { mode: 'background-blur'; radius?: number }
  | { mode: 'effects'; brightness: number; contrast: number; saturate: number; grayscale: number };

export async function runImageWorker(file: File | Blob, operation: WorkerImageOperation): Promise<Blob> {
  if (typeof Worker === 'undefined' || typeof createImageBitmap === 'undefined') {
    throw new Error('Image worker is unavailable.');
  }

  const buffer = await file.arrayBuffer();
  const worker = new Worker(new URL('./image-processing.worker.ts', import.meta.url), { type: 'module' });

  try {
    return await new Promise<Blob>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        worker.terminate();
        reject(new Error('Image worker timed out.'));
      }, 30_000);

      worker.onmessage = (event: MessageEvent<{ ok: true; buffer: ArrayBuffer; type: string } | { ok: false; error: string }>) => {
        window.clearTimeout(timeout);
        if (!event.data.ok) {
          reject(new Error(event.data.error));
          return;
        }
        resolve(new Blob([event.data.buffer], { type: event.data.type }));
      };
      worker.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error('Image worker failed.'));
      };
      worker.postMessage({ buffer, type: file.type, operation }, [buffer]);
    });
  } finally {
    worker.terminate();
  }
}
