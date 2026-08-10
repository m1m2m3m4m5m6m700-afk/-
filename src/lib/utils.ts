import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function downloadBlob(data: Blob | BlobPart, filename: string, type?: string): void {
  const blob =
    data instanceof Blob ? data : new Blob([data], { type: type ?? "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
export function getPdfjs(): Promise<typeof import("pdfjs-dist")> {
  if (pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = (async () => {
    const pdfjs = await import("pdfjs-dist");
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default as string;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    return pdfjs;
  })();
  return pdfjsPromise;
}

export function audioBufferToWav(
  buffer: AudioBuffer,
  options?: { sampleRate?: number; mono?: boolean },
): ArrayBuffer {
  const targetRate = options?.sampleRate ?? buffer.sampleRate;
  const toMono = options?.mono ?? false;
  const numChannels = toMono ? 1 : buffer.numberOfChannels;
  const numFrames = Math.round(buffer.length * (targetRate / buffer.sampleRate));
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);

  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, targetRate, true);
  view.setUint32(28, targetRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < buffer.numberOfChannels; c++) channels.push(buffer.getChannelData(c));
  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    const srcIdx = (i * buffer.sampleRate) / targetRate;
    const srcI = Math.floor(srcIdx);
    for (let c = 0; c < numChannels; c++) {
      let sample: number;
      if (toMono) {
        let sum = 0;
        for (let ch = 0; ch < channels.length; ch++) sum += channels[ch][srcI] || 0;
        sample = sum / channels.length;
      } else {
        sample = channels[c]?.[srcI] ?? 0;
      }
      const clamped = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
      offset += 2;
    }
  }
  return ab;
}

export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  ctx.close();
  return audioBuffer;
}

let gifWorkerUrl: string | null = null;
export async function getGifEncoder(): Promise<{
  GIF: typeof import("gif.js");
  workerScript: string;
}> {
  const mod = await import("gif.js");
  const GIF = (mod.default ?? mod) as typeof import("gif.js");
  if (!gifWorkerUrl)
    gifWorkerUrl = (await import("gif.js/dist/gif.worker.js?url")).default as string;
  return { GIF, workerScript: gifWorkerUrl };
}

let ffmpegInstance: import("@ffmpeg/ffmpeg").FFmpeg | null = null;
export async function getFfmpeg(): Promise<import("@ffmpeg/ffmpeg").FFmpeg> {
  if (ffmpegInstance && ffmpegInstance.loaded) return ffmpegInstance;
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const ffmpeg = new FFmpeg();
  const coreURL = (await import("@ffmpeg/core?url")).default as string;
  // The raw @ffmpeg/core WASM (~31 MiB) exceeds Cloudflare Workers' 25 MiB
  // per-asset upload limit, so the build ships it gzip-compressed (`.wasm.gz`).
  // Fetch the compressed asset same-origin and decompress it in the browser via
  // DecompressionStream, then hand FFmpeg a blob URL to the real WASM bytes.
  const wasmGzURL = (await import("@ffmpeg/core/wasm?url")).default as string;
  const wasmURL = await decompressWasmGzToBlobUrl(wasmGzURL);
  try {
    await ffmpeg.load({ coreURL, wasmURL });
  } finally {
    // FFmpeg compiles the WASM into memory during load; the blob URL is no
    // longer needed once load resolves (success or failure).
    URL.revokeObjectURL(wasmURL);
  }
  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

/**
 * Fetch a same-origin `.wasm.gz` asset and return a blob: URL pointing to the
 * decompressed WASM. Used by getFfmpeg() because the build compresses the
 * FFmpeg core WASM to satisfy Cloudflare's 25 MiB asset limit.
 * DecompressionStream is available in all modern browsers (Chrome 80+,
 * Firefox 113+, Safari 16.4+).
 */
async function decompressWasmGzToBlobUrl(gzUrl: string): Promise<string> {
  const res = await fetch(gzUrl);
  if (!res.ok || !res.body) {
    throw new Error(`Failed to load FFmpeg WASM (${res.status} ${res.statusText}).`);
  }
  const decompressed = res.body.pipeThrough(new DecompressionStream("gzip"));
  const blob = await new Response(decompressed).blob();
  return URL.createObjectURL(blob);
}

/**
 * Validate that a file is non-empty and (optionally) matches an expected
 * MIME prefix or extension. Throws a user-friendly Error on rejection so the
 * calling tool can surface it directly.
 */
export function assertFileValid(
  file: File,
  opts?: { accept?: string[]; kind?: string; maxBytes?: number },
): void {
  const kind = opts?.kind ?? "file";
  if (!file || file.size === 0) {
    throw new Error(`This ${kind} is empty (0 bytes). Please choose a valid ${kind}.`);
  }
  const maxBytes = opts?.maxBytes;
  if (typeof maxBytes === "number" && file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(
      `This ${kind} is too large (${Math.round(file.size / (1024 * 1024))} MB). The maximum supported size is ${mb} MB.`,
    );
  }
  const accept = opts?.accept;
  if (accept && accept.length) {
    const name = file.name.toLowerCase();
    const type = (file.type || "").toLowerCase();
    const ok = accept.some((a) => {
      if (a.startsWith(".")) return name.endsWith(a);
      if (a.endsWith("/*")) return type.startsWith(a.slice(0, -1));
      return type === a;
    });
    if (!ok) {
      throw new Error(
        `This ${kind} format is not supported. Please use one of: ${accept.join(", ")}.`,
      );
    }
  }
}

/**
 * Map a raw library/WASM/browser error into a concise, non-technical message
 * suitable for end users. Never exposes stack traces, WASM internals, worker
 * errors, or raw FFmpeg output.
 */
export function friendlyError(e: unknown, fallback: string): string {
  if (!(e instanceof Error)) return fallback;
  const raw = e.message || "";
  const lower = raw.toLowerCase();

  // Empty / zero-byte files
  if (lower.includes("empty") && lower.includes("zero")) {
    return "This file is empty (0 bytes). Please choose a valid file.";
  }

  // PDF.js errors
  if (raw.includes("InvalidPDFException") || lower.includes("invalid pdf structure")) {
    return "This PDF could not be processed. It may be damaged, encrypted, or not a real PDF.";
  }
  if (raw.includes("PasswordException") || lower.includes("password")) {
    return "This PDF is password-protected. Please unlock it first and try again.";
  }
  if (lower.includes("formaterror") || lower.includes("pdf format")) {
    return "This PDF is malformed or corrupted. Please try a different file.";
  }

  // WASM / memory traps
  if (
    lower.includes("memory access out of bounds") ||
    lower.includes("unreachable") ||
    lower.includes("wasm") ||
    lower.includes("runtimeerror")
  ) {
    return "This file is too complex to process in your browser. Please try a smaller or simpler file.";
  }

  // Network / import failures for lazy-loaded libs (check before generic FFmpeg)
  if (
    lower.includes("failed to import") ||
    lower.includes("networkerror") ||
    lower.includes("fetch")
  ) {
    return "A required component failed to load. Please check your connection and reload the page.";
  }

  // FFmpeg engine not loaded / terminated
  if (lower.includes("not loaded") && lower.includes("ffmpeg")) {
    return "The processing engine could not start. Please reload the page and try again.";
  }
  if (raw.includes("ERROR_TERMINATED") || lower.includes("terminate")) {
    return "Processing was interrupted. Please try again.";
  }

  // FFmpeg processing failures
  if (raw.includes("FFMPEG_PROCESS_FAILED") || raw.includes("ffmpeg") || raw.includes("FFmpeg")) {
    return "This file could not be processed. It may be corrupted or in an unsupported format.";
  }

  // Web Audio / decode errors
  if (
    lower.includes("decodeaudiodata") ||
    lower.includes("domexception") ||
    lower.includes("encodingerror") ||
    lower.includes("notsupported") ||
    lower.includes("unable to decode")
  ) {
    return "This audio file could not be decoded. It may be corrupted or in an unsupported format.";
  }

  // GIF parser / worker errors
  if (lower.includes("no frames found") || lower.includes("gif")) {
    return "This GIF could not be processed. It may be corrupted or not a real animated GIF.";
  }

  // FileReader
  if (lower.includes("failed to read file")) {
    return "This file could not be read. Please try again with a different file.";
  }

  // Canvas
  if (lower.includes("canvas not supported")) {
    return "Your browser does not support the required canvas features for this tool.";
  }

  // Generic out-of-memory / quota
  if (lower.includes("out of memory") || lower.includes("quota")) {
    return "Your browser ran out of memory. Please try a smaller file.";
  }

  // If the raw message is short and friendly enough, keep it; otherwise mask.
  if (raw.length > 0 && raw.length <= 120 && !/[A-Z_]{3,}/.test(raw)) return raw;
  return fallback;
}
