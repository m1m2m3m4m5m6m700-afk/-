import type { MegaTool, MegaToolPreset } from "@/data/megaToolsCatalog";

export type MegaToolTextResult = { type: "text"; text: string };
export type MegaToolDownloadResult = { type: "download"; url: string; filename: string };
export type MegaToolVideoResult = { type: "video"; element: HTMLVideoElement; cleanup: () => void };
export type MegaToolResult = MegaToolTextResult | MegaToolDownloadResult | MegaToolVideoResult;

const MAX_DIM: Record<MegaToolPreset, number> = {
  quick: 640, small: 960, medium: 1280, large: 1600, social: 1080, web: 1440,
  mobile: 1170, print: 2400, hd: 1920, pro: 2560, max: 4096,
};
const IMAGE_QUALITY: Record<MegaToolPreset, number> = {
  quick: 0.55, small: 0.65, medium: 0.75, large: 0.82, social: 0.78, web: 0.74,
  mobile: 0.72, print: 0.9, hd: 0.86, pro: 0.92, max: 0.95,
};
const AUDIO_STRENGTH: Record<MegaToolPreset, number> = {
  quick: 0.15, small: 0.08, medium: 0.05, large: 0.03, social: 0.07, web: 0.04,
  mobile: 0.1, print: 0.02, hd: 0.025, pro: 0.015, max: 0.01,
};
const SPEED: Record<MegaToolPreset, number> = {
  quick: 0.75, small: 0.85, medium: 0.95, large: 1.1, social: 1.2, web: 1.35,
  mobile: 1.5, print: 0.8, hd: 1.25, pro: 1.5, max: 2,
};

function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}
function downloadResult(blob: Blob, filename: string): MegaToolDownloadResult {
  return { type: "download", url: URL.createObjectURL(blob), filename };
}
function blobFromBytes(bytes: Uint8Array, type: string): Blob {
  const owned = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(owned).set(bytes);
  return new Blob([owned], { type });
}
function waitForEvent(target: EventTarget, event: string, timeoutMs = 20000): Promise<void> {
  return new Promise((resolve, reject) => {
    let timer: number | undefined;
    const cleanup = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      target.removeEventListener(event, onEvent);
    };
    const onEvent = () => {
      cleanup();
      resolve();
    };
    target.addEventListener(event, onEvent, { once: true });
    timer = window.setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for ${event}.`));
    }, timeoutMs);
  });
}

async function imageTool(file: File, tool: MegaTool): Promise<MegaToolResult> {
  if (!file.type.startsWith("image/")) throw new Error("Please select a valid image file.");
  const bitmap = await createImageBitmap(file);
  try {
    let width = bitmap.width;
    let height = bitmap.height;
    if (["resize", "compress", "convert-png", "convert-jpg", "convert-webp"].includes(tool.handler)) {
      const scale = Math.min(1, MAX_DIM[tool.preset] / Math.max(width, height));
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }
    const rotated = tool.handler === "rotate";
    const canvas = document.createElement("canvas");
    canvas.width = rotated ? height : width;
    canvas.height = rotated ? width : height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable in this browser.");
    context.save();
    if (rotated) {
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(Math.PI / 2);
      context.translate(-width / 2, -height / 2);
    } else if (tool.handler === "flip") {
      context.translate(width, 0);
      context.scale(-1, 1);
    }
    const filters: Record<string, string> = {
      grayscale: "grayscale(1)",
      invert: "invert(1)",
      brightness: "brightness(1.18)",
      contrast: "contrast(1.18)",
      saturation: "saturate(1.28)",
    };
    const filter = filters[tool.handler];
    if (filter) context.filter = filter;
    context.drawImage(bitmap, 0, 0, width, height);
    context.restore();

    let mime: "image/png" | "image/jpeg" | "image/webp" = "image/png";
    let extension = "png";
    if (tool.handler === "compress" || tool.handler === "convert-jpg") {
      mime = "image/jpeg";
      extension = "jpg";
    } else if (tool.handler === "convert-webp") {
      mime = "image/webp";
      extension = "webp";
    }
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, IMAGE_QUALITY[tool.preset]));
    if (!blob) throw new Error("The browser could not encode the image.");
    return downloadResult(blob, `${baseName(file.name)}-${tool.handler}-${tool.preset}.${extension}`);
  } finally {
    bitmap.close();
  }
}

async function loadVideo(file: File): Promise<{ video: HTMLVideoElement; url: string }> {
  if (!file.type.startsWith("video/")) throw new Error("Please select a valid video file.");
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;

  const metadataReady = new Promise<void>((resolve, reject) => {
    let timer: number | undefined;
    const cleanup = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("error", onError);
    };
    const onLoaded = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("The browser could not read video metadata."));
    };
    video.addEventListener("loadedmetadata", onLoaded, { once: true });
    video.addEventListener("error", onError, { once: true });
    timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for video metadata."));
    }, 20000);
    video.src = url;
    video.load();
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onLoaded();
  });

  try {
    await metadataReady;
    return { video, url };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

async function seekVideo(video: HTMLVideoElement, seconds: number): Promise<void> {
  const position = Number.isFinite(video.duration)
    ? Math.max(0, Math.min(video.duration, seconds))
    : 0;
  if (Math.abs(video.currentTime - position) < 0.001) return;
  const seekPromise = waitForEvent(video, "seeked", 15000);
  video.currentTime = position;
  await seekPromise;
}

async function videoTool(file: File, tool: MegaTool): Promise<MegaToolResult> {
  const { video, url } = await loadVideo(file);
  try {
    if (tool.handler === "inspect" || tool.handler === "metadata") {
      return {
        type: "text",
        text: `File: ${file.name}\nDuration: ${Number.isFinite(video.duration) ? video.duration.toFixed(2) : "—"}s\nResolution: ${video.videoWidth}×${video.videoHeight}\nAspect ratio: ${video.videoHeight ? (video.videoWidth / video.videoHeight).toFixed(3) : "—"}`,
      };
    }
    if (tool.handler === "mute" || tool.handler === "speed") {
      video.muted = tool.handler === "mute";
      video.playbackRate = SPEED[tool.preset];
      video.controls = true;
      video.className = "w-full rounded-xl";
      return {
        type: "video",
        element: video,
        cleanup: () => {
          video.pause();
          video.removeAttribute("src");
          video.load();
          URL.revokeObjectURL(url);
        },
      };
    }

    const point = tool.handler === "frame-25" ? 0.25 : tool.handler === "frame-75" ? 0.75 : 0.5;
    if (["poster", "frame-25", "frame-50", "frame-75"].includes(tool.handler)) {
      await seekVideo(video, video.duration * point);
    }

    if (tool.handler === "contact-sheet") {
      const width = Math.min(video.videoWidth || 1, MAX_DIM[tool.preset]);
      const ratio = video.videoHeight && video.videoWidth ? video.videoHeight / video.videoWidth : 0.5625;
      const height = Math.max(1, Math.round(width * ratio));
      const canvas = document.createElement("canvas");
      canvas.width = width * 2;
      canvas.height = height * 2;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable in this browser.");
      for (const [index, fraction] of [0.2, 0.4, 0.6, 0.8].entries()) {
        await seekVideo(video, video.duration * fraction);
        context.drawImage(video, (index % 2) * width, Math.floor(index / 2) * height, width, height);
      }
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
      if (!blob) throw new Error("Could not create the contact sheet.");
      return downloadResult(blob, `${baseName(file.name)}-contact-sheet-${tool.preset}.jpg`);
    }

    let width = video.videoWidth || 1;
    let height = video.videoHeight || 1;
    if (tool.handler === "resize") {
      const scale = Math.min(1, MAX_DIM[tool.preset] / Math.max(width, height));
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }
    const rotated = tool.handler === "rotate";
    const canvas = document.createElement("canvas");
    canvas.width = rotated ? height : width;
    canvas.height = rotated ? width : height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable in this browser.");
    context.save();
    if (rotated) {
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(Math.PI / 2);
      context.drawImage(video, -width / 2, -height / 2, width, height);
    } else {
      if (tool.handler === "flip") {
        context.translate(width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, width, height);
    }
    context.restore();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob) throw new Error("Could not encode the video preview.");
    return downloadResult(blob, `${baseName(file.name)}-${tool.handler}-${tool.preset}.jpg`);
  } finally {
    if (tool.handler !== "mute" && tool.handler !== "speed") {
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
    }
  }
}

async function decodeAudio(file: File): Promise<AudioBuffer> {
  if (!file.type.startsWith("audio/")) throw new Error("Please select a valid MP3/audio file.");
  const context = new AudioContext();
  try {
    return await context.decodeAudioData(await file.arrayBuffer());
  } finally {
    await context.close();
  }
}

function wavBlob(buffer: AudioBuffer): Blob {
  const channels = buffer.numberOfChannels;
  const frames = buffer.length;
  const bytes = 44 + frames * channels * 2;
  const view = new DataView(new ArrayBuffer(bytes));
  const write = (offset: number, text: string) => [...text].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  write(0, "RIFF");
  view.setUint32(4, bytes - 8, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, frames * channels * 2, true);
  let offset = 44;
  for (let frame = 0; frame < frames; frame += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[frame] ?? 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([view.buffer], { type: "audio/wav" });
}

async function audioTool(file: File, tool: MegaTool): Promise<MegaToolResult> {
  const buffer = await decodeAudio(file);
  if (tool.handler === "inspect") {
    return { type: "text", text: `File: ${file.name}\nDuration: ${buffer.duration.toFixed(2)}s\nSample rate: ${buffer.sampleRate} Hz\nChannels: ${buffer.numberOfChannels}\nFrames: ${buffer.length}` };
  }
  if (tool.handler === "peak" || tool.handler === "rms") {
    let peak = 0;
    let sum = 0;
    let count = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      for (const value of buffer.getChannelData(channel)) {
        peak = Math.max(peak, Math.abs(value));
        sum += value * value;
        count += 1;
      }
    }
    return { type: "text", text: tool.handler === "peak" ? `Peak level: ${(peak * 100).toFixed(2)}%` : `RMS level: ${(Math.sqrt(sum / Math.max(1, count)) * 100).toFixed(2)}%` };
  }
  if (tool.handler === "waveform") {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 240;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable in this browser.");
    const data = buffer.getChannelData(0);
    const bucket = Math.max(1, Math.floor(data.length / canvas.width));
    context.beginPath();
    for (let x = 0; x < canvas.width; x += 1) {
      let peak = 0;
      const start = x * bucket;
      const end = Math.min(data.length, start + bucket);
      for (let i = start; i < end; i += 1) peak = Math.max(peak, Math.abs(data[i] ?? 0));
      const y = canvas.height / 2;
      context.moveTo(x, y - peak * 100);
      context.lineTo(x, y + peak * 100);
    }
    context.stroke();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Could not create waveform image.");
    return downloadResult(blob, `${baseName(file.name)}-waveform.png`);
  }
  if (tool.handler === "wav") return downloadResult(wavBlob(buffer), `${baseName(file.name)}-export.wav`);

  const strength = AUDIO_STRENGTH[tool.preset];
  const channels = tool.handler === "mono" ? 1 : buffer.numberOfChannels;
  const length = tool.handler === "trim" ? Math.max(1, Math.floor(buffer.length * (1 - strength))) : buffer.length;
  const context = new AudioContext();
  try {
    const output = context.createBuffer(channels, length, buffer.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
    for (let channel = 0; channel < channels; channel += 1) {
      const target = output.getChannelData(channel);
      for (let index = 0; index < target.length; index += 1) {
        const sourceIndex = tool.handler === "reverse"
          ? buffer.length - 1 - index
          : tool.handler === "speed"
            ? Math.min(buffer.length - 1, Math.floor(index * SPEED[tool.preset]))
            : Math.min(buffer.length - 1, index);
        let value = channel === 0 ? left[sourceIndex] ?? 0 : right[sourceIndex] ?? 0;
        if (tool.handler === "mono") value = ((left[sourceIndex] ?? 0) + (right[sourceIndex] ?? 0)) / 2;
        if (tool.handler === "normalize") value *= 0.95;
        if (tool.handler === "fade-in") value *= Math.min(1, index / Math.max(1, length * strength));
        if (tool.handler === "fade-out") value *= Math.min(1, (length - index) / Math.max(1, length * strength));
        target[index] = value;
      }
    }
    return downloadResult(wavBlob(output), `${baseName(file.name)}-${tool.handler}-${tool.preset}.wav`);
  } finally {
    await context.close();
  }
}

async function renderPdfPoster(bytes: ArrayBuffer): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(viewport.width));
  canvas.height = Math.max(1, Math.ceil(viewport.height));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable in this browser.");
  await page.render({ canvasContext: context, viewport }).promise;
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not render PDF poster.");
  return blob;
}

async function pdfTool(file: File, tool: MegaTool): Promise<MegaToolResult> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("Please select a valid PDF file.");
  const { PDFDocument, rgb, degrees, StandardFonts } = await import("pdf-lib");
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pages = pdf.getPages();

  if (tool.handler === "inspect") {
    return { type: "text", text: `File: ${file.name}\nPages: ${pages.length}\nTitle: ${pdf.getTitle() || "—"}\nAuthor: ${pdf.getAuthor() || "—"}` };
  }
  if (tool.handler === "extract-text") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
    let text = "";
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      text += `${content.items.map((item) => ("str" in item ? item.str : "")).join(" ")}\n`;
    }
    return { type: "text", text: text.trim() || "No selectable text was found in this PDF." };
  }
  if (tool.handler === "rotate") pages.forEach((page) => page.setRotation(degrees((page.getRotation().angle + 90) % 360)));
  if (tool.handler === "page-numbers") {
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    pages.forEach((page, index) => page.drawText(`${index + 1}`, { x: 36, y: 24, size: 9, font, color: rgb(0.35, 0.35, 0.35) }));
  }
  if (tool.handler === "watermark") pages.forEach((page) => page.drawText("Flixo", { x: 36, y: page.getHeight() / 2, size: 28, color: rgb(0.75, 0.75, 0.75), opacity: 0.4 }));
  if (tool.handler === "remove-metadata") {
    pdf.setTitle(""); pdf.setAuthor(""); pdf.setSubject(""); pdf.setKeywords([]); pdf.setProducer(""); pdf.setCreator("");
  }
  if (tool.handler === "duplicate") {
    const source = pages[pages.length - 1];
    if (source) {
      const copy = await pdf.copyPages(pdf, [pages.length - 1]);
      const newPdf = await PDFDocument.create();
      newPdf.addPage(copy[0]);
      const out = await newPdf.save();
      return downloadResult(blobFromBytes(out, "application/pdf"), `${baseName(file.name)}-duplicate-${tool.preset}.pdf`);
    }
  }
  if (tool.handler === "extract-range") {
    const output = await PDFDocument.create();
    const count = Math.max(1, Math.ceil(pages.length / 2));
    const copies = await output.copyPages(pdf, Array.from({ length: count }, (_, index) => index));
    copies.forEach((page) => output.addPage(page));
    const out = await output.save();
    return downloadResult(blobFromBytes(out, "application/pdf"), `${baseName(file.name)}-extract-range-${tool.preset}.pdf`);
  }
  if (tool.handler === "split-even") {
    const output = await PDFDocument.create();
    const indices = pages.map((_, index) => index).filter((index) => (index + 1) % 2 === 0);
    const copies = await output.copyPages(pdf, indices.length ? indices : [0]);
    copies.forEach((page) => output.addPage(page));
    const out = await output.save();
    return downloadResult(blobFromBytes(out, "application/pdf"), `${baseName(file.name)}-split-even-${tool.preset}.pdf`);
  }
  if (tool.handler === "blank-cover") {
    const output = await PDFDocument.create();
    output.addPage([595.28, 841.89]);
    const copies = await output.copyPages(pdf, pages.map((_, index) => index));
    copies.forEach((page) => output.addPage(page));
    const out = await output.save();
    return downloadResult(blobFromBytes(out, "application/pdf"), `${baseName(file.name)}-blank-cover-${tool.preset}.pdf`);
  }
  if (tool.handler === "poster") {
    const poster = await renderPdfPoster(bytes);
    return downloadResult(poster, `${baseName(file.name)}-poster-${tool.preset}.png`);
  }
  if (tool.handler === "flatten") pages.forEach((page) => page.scaleContent(1, 1));

  const out = await pdf.save();
  return downloadResult(blobFromBytes(out, "application/pdf"), `${baseName(file.name)}-${tool.handler}-${tool.preset}.pdf`);
}

export async function runMegaTool(tool: MegaTool, file: File): Promise<MegaToolResult> {
  switch (tool.category) {
    case "images": return imageTool(file, tool);
    case "video": return videoTool(file, tool);
    case "audio": return audioTool(file, tool);
    case "pdf": return pdfTool(file, tool);
    default: return assertNever(tool.category);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported mega-tool category: ${String(value)}`);
}
