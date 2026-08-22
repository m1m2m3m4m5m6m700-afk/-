declare const importScripts: (...urls: string[]) => void;

type TesseractApi = {
  recognize(input: Blob, language: string): Promise<{ data: { text: string } }>;
};

type WorkerScope = DedicatedWorkerGlobalScope & {
  Tesseract?: TesseractApi;
};

const scope = self as unknown as WorkerScope;

importScripts('https://cdn.jsdelivr.net/npm/tesseract.js@6/dist/tesseract.min.js');

scope.onmessage = async (event: MessageEvent<{ blob: Blob; language: string }>) => {
  try {
    if (!scope.Tesseract) throw new Error('OCR engine is unavailable.');
    const result = await scope.Tesseract.recognize(event.data.blob, event.data.language);
    scope.postMessage({ ok: true, text: result.data.text });
  } catch (error) {
    scope.postMessage({
      ok: false,
      error: error instanceof Error ? error.message : 'OCR worker failed.',
    });
  }
};
