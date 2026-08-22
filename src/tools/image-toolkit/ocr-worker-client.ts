export type OcrWorkerResult = { text: string };

export async function recognizeWithOcrWorker(blob: Blob, language: string): Promise<OcrWorkerResult> {
  if (typeof Worker === 'undefined') throw new Error('Web Worker is unavailable.');

  return await new Promise<OcrWorkerResult>((resolve, reject) => {
    const worker = new Worker(new URL('./ocr-worker.ts', import.meta.url));
    const cleanup = () => worker.terminate();

    worker.onmessage = (event: MessageEvent<{ ok: boolean; text?: string; error?: string }>) => {
      cleanup();
      if (event.data.ok && typeof event.data.text === 'string') {
        resolve({ text: event.data.text });
      } else {
        reject(new Error(event.data.error || 'OCR worker failed.'));
      }
    };

    worker.onerror = () => {
      cleanup();
      reject(new Error('OCR worker could not start.'));
    };

    worker.postMessage({ blob, language });
  });
}
