import type { MegaTool } from "@/data/megaToolsCatalog";

export type MegaToolTextResult = { type: "text"; text: string };
export type MegaToolDownloadResult = { type: "download"; url: string; filename: string };
export type MegaToolVideoResult = { type: "video"; element: HTMLVideoElement; cleanup: () => void };
export type MegaToolResult = MegaToolTextResult | MegaToolDownloadResult | MegaToolVideoResult;

const MAX_DIM: Record<MegaTool["preset"], number> = {
  quick: 640, small: 960, medium: 1280, large: 1600, social: 1080, web: 1440,
  mobile: 1170, print: 2400, hd: 1920, pro: 2560, max: 4096,
};

const IMAGE_QUALITY: Record<MegaTool["preset"], number> = {
  quick: 0.55, small: 0.65, medium: 0.75, large: 0.82, social: 0.78, web: 0.74,
  mobile: 0.72, print: 0.9, hd: 0.86, pro: 0.92, max: 0.95,
};

const SPEED: Record<MegaTool["preset"], number> = {
  quick: 0.75, small: 0.85, medium: 0.95, large: 1.1, social: 1.2, web: 1.35,
  mobile: 1.5, print: 0.8, hd: 1.25, pro: 1.5, max: 2,
};

function baseName(name: string): string { return name.replace(/\.[^.]+$/, ""); }
function downloadResult(blob: Blob, filename: string): MegaToolDownloadResult { return { type: "download", url: URL.createObjectURL(blob), filename }; }

function waitFor(target: EventTarget, event: string, timeoutMs = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    const onEvent = () => { cleanup(); resolve(); };
    const cleanup = () => { window.clearTimeout(timer); target.removeEventListener(event, onEvent); };
    const timer = window.setTimeout(() => { cleanup(); reject(new Error(`Timed out waiting for ${event}.`)); }, timeoutMs);
    target.addEventListener(event, onEvent, { once: true });
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
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas is unavailable in this browser.");
    context.save();
    if (rotated) { context.translate(canvas.width / 2, canvas.height / 2); context.rotate(Math.PI / 2); context.translate(-width / 2, -height / 2); }
    else if (tool.handler === "flip") { context.translate(width, 0); context.scale(-1, 1); }
    const filters: Record<string, string> = {
      grayscale: "grayscale(1)", invert: "invert(1)", brightness: "brightness(1.18)", contrast: "contrast(1.18)", saturation: "saturate(1.28)",
    };
    if (filters[tool.handler]) context.filter = filters[tool.handler]!;
    context.drawImage(bitmap, 0, 0, width, height);
    context.restore();
    let mime: "image/png" | "image/jpeg" | "image/webp" = "image/png";
    let extension = "png";
    if (tool.handler === "compress" || tool.handler === "convert-jpg") { mime = "image/jpeg"; extension = "jpg"; }
    else if (tool.handler === "convert-webp") { mime = "image/webp"; extension = "webp"; }
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, IMAGE_QUALITY[tool.preset]));
    if (!blob) throw new Error("The browser could not encode the image.");
    return downloadResult(blob, `${baseName(file.name)}-${tool.handler}-${tool.preset}.${extension}`);
  } finally { bitmap.close(); }
}

async function loadVideo(file: File): Promise<{ video: HTMLVideoElement; url: string }> {
  if (!file.type.startsWith("video/")) throw new Error("Please select a valid video file.");
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  video.src = url;
  try { await waitFor(video, "loadedmetadata"); return { video, url }; }
  catch (error) { URL.revokeObjectURL(url); throw error; }
}

async function videoTool(file: File, tool: MegaTool): Promise<MegaToolResult> {
  const { video, url } = await loadVideo(file);
  try {
    if (tool.handler === "inspect" || tool.handler === "metadata") {
      return { type: "text", text: `File: ${file.name}\nDuration: ${video.duration.toFixed(2)}s\nResolution: ${video.videoWidth}×${video.videoHeight}\nAspect ratio: ${(video.videoWidth / video.videoHeight).toFixed(3)}` };
    }
    if (tool.handler === "mute" || tool.handler === "speed") {
      video.muted = tool.handler === "mute";
      video.playbackRate = SPEED[tool.preset];
      video.controls = true;
      video.className = "w-full rounded-xl";
      return { type: "video", element: video, cleanup: () => URL.revokeObjectURL(url) };
    }
    const position: Record<string, number> = { poster: 0.5, preview: 0.5, "frame-25": 0.25, "frame-50": 0.5, "frame-75": 0.75 };
    if (position[tool.handler] !== undefined) { video.currentTime = (video.duration || 0) * position[tool.handler]!; await waitFor(video, "seeked"); }
    let width = video.videoWidth || 1;
    let height = video.videoHeight || 1;
    if (tool.handler === "resize") { const scale = Math.min(1, MAX_DIM[tool.preset] / Math.max(width, height)); width = Math.max(1, Math.round(width * scale)); height = Math.max(1, Math.round(height * scale)); }
    const canvas = document.createElement("canvas");
    canvas.width = tool.handler === "rotate" ? height : width;
    canvas.height = tool.handler === "rotate" ? width : height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable in this browser.");
    if (tool.handler === "flip") { context.translate(canvas.width, 0); context.scale(-1, 1); }
    if (tool.handler === "rotate") { context.translate(canvas.width / 2, canvas.height / 2); context.rotate(Math.PI / 2); context.drawImage(video, -width / 2, -height / 2, width, height); }
    else context.drawImage(video, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob) throw new Error("Could not encode the video preview.");
    return downloadResult(blob, `${baseName(file.name)}-${tool.handler}-${tool.preset}.jpg`);
  } finally { if (tool.handler !== "mute" && tool.handler !== "speed") URL.revokeObjectURL(url); }
}

async function decodeAudio(file: File): Promise<AudioBuffer> {
  if (!file.type.startsWith("audio/")) throw new Error("Please select a valid MP3/audio file.");
  const Context = window.AudioContext ?? window.webkitAudioContext;
  if (!Context) throw new Error("Web Audio is unavailable in this browser.");
  const context = new Context();
  try { return await context.decodeAudioData(await file.arrayBuffer()); }
  finally { await context.close(); }
}

function wavBlob(buffer: AudioBuffer): Blob {
  const channels = buffer.numberOfChannels; const frames = buffer.length; const bytes = 44 + frames * channels * 2;
  const view = new DataView(new ArrayBuffer(bytes));
  const write = (offset: number, text: string) => [...text].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  write(0, "RIFF"); view.setUint32(4, bytes - 8, true); write(8, "WAVEfmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true); view.setUint32(28, buffer.sampleRate * channels * 2, true); view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true); write(36, "data"); view.setUint32(40, frames * channels * 2, true);
  let offset = 44;
  for (let frame = 0; frame < frames; frame += 1) for (let channel = 0; channel < channels; channel += 1) {
    const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[frame] ?? 0));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true); offset += 2;
  }
  return new Blob([view], { type: "audio/wav" });
}

async function audioTool(file: File, tool: MegaTool): Promise<MegaToolResult> {
  const buffer = await decodeAudio(file);
  if (tool.handler === "inspect") return { type: "text", text: `File: ${file.name}\nDuration: ${buffer.duration.toFixed(2)}s\nSample rate: ${buffer.sampleRate} Hz\nChannels: ${buffer.numberOfChannels}\nFrames: ${buffer.length}` };
  if (tool.handler === "peak" || tool.handler === "rms") {
    let sumSquares = 0; let peak = 0; let samples = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) for (const value of buffer.getChannelData(channel)) { const magnitude = Math.abs(value); peak = Math.max(peak, magnitude); sumSquares += value * value; samples += 1; }
    return { type: "text", text: tool.handler === "peak" ? `Peak level: ${(peak * 100).toFixed(2)}%` : `RMS level: ${(Math.sqrt(sumSquares / Math.max(1, samples)) * 100).toFixed(2)}%` };
  }
  if (tool.handler === "waveform") {
    const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 240;
    const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas is unavailable in this browser.");
    const data = buffer.getChannelData(0); const bucket = Math.max(1, Math.floor(data.length / canvas.width)); context.beginPath();
    for (let x = 0; x < canvas.width; x += 1) { let peak = 0; const start = x * bucket; const end = Math.min(data.length, start + bucket); for (let i = start; i < end; i += 1) peak = Math.max(peak, Math.abs(data[i] ?? 0)); const y = canvas.height / 2; context.moveTo(x, y - peak * 100); context.lineTo(x, y + peak * 100); }
    context.stroke(); const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png")); if (!blob) throw new Error("Could not create waveform image."); return downloadResult(blob, `${baseName(file.name)}-waveform.png`);
  }
  if (tool.handler === "wav") return downloadResult(wavBlob(buffer), `${baseName(file.name)}-export.wav`);
  const offline = window.OfflineAudioContext ?? window.webkitOfflineAudioContext; if (!offline) throw new Error("Offline audio processing is unavailable.");
  const strength = { quick: 0.15, small: 0.08, medium: 0.05, large: 0.03, social: 0.07, web: 0.04, mobile: 0.1, print: 0.02, hd: 0.025, pro: 0.015, max: 0.01 }[tool.preset];
  const channels = tool.handler === "mono" ? 1 : buffer.numberOfChannels; const length = tool.handler === "trim" ? Math.max(1, Math.floor(buffer.length * (1 - strength))) : buffer.length;
  const context = new offline(channels, length, buffer.sampleRate); const output = context.createBuffer(channels, length, buffer.sampleRate);
  for (let channel = 0; channel < channels; channel += 1) {
    const target = output.getChannelData(channel); const left = buffer.getChannelData(0); const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
    for (let index = 0; index < target.length; index += 1) {
      const sourceIndex = tool.handler === "reverse" ? buffer.length - 1 - index : Math.min(buffer.length - 1, index); let value = channel === 0 ? left[sourceIndex] ?? 0 : right[sourceIndex] ?? 0;
      if (tool.handler === "mono") value = ((left[sourceIndex] ?? 0) + (right[sourceIndex] ?? 0)) / 2;
      if (tool.handler === "normalize") value *= 0.95;
      if (tool.handler === "fade-in") value *= Math.min(1, index / Math.max(1, length * strength));
      if (tool.handler === "fade-out") value *= Math.min(1, (length - index) / Math.max(1, length * strength));
      if (tool.handler === "speed") { const source = Math.min(buffer.length - 1, Math.floor(index * SPEED[tool.preset])); value = left[source] ?? 0; }
      target[index] = value;
    }
  }
  return downloadResult(wavBlob(output), `${baseName(file.name)}-${tool.handler}-${tool.preset}.wav`);
}

async function pdfTool(file: File, tool: MegaTool): Promise<MegaToolResult> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("Please select a valid PDF file.");
  const { PDFDocument, rgb, degrees } = await import("pdf-lib");
  const bytes = await file.arrayBuffer(); const pdf = await PDFDocument.load(bytes); const pages = pdf.getPages();
  if (tool.handler === "inspect") return { type: "text", text: `File: ${file.name}\nPages: ${pages.length}\nTitle: ${pdf.getTitle() || "—"}\nAuthor: ${pdf.getAuthor() || "—"}` };
  if (tool.handler === "extract-text") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const doc = await pdfjs.getDocument({ data: bytes, disableWorker: true }).promise; let text = "";
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) { const page = await doc.getPage(pageNumber); const content = await page.getTextContent(); text += `${content.items.map((item) => ("str" in item ? item.str : "")).join(" ")}\n`; }
    return { type: "text", text: text.trim() || "No selectable text was found in this PDF." };
  }
  if (tool.handler === "rotate") pages.forEach((page) => page.setRotation(degrees((page.getRotation().angle + 90) % 360)));
  if (tool.handler === "page-numbers") pages.forEach((page, index) => { const { width } = page.getSize(); page.drawText(String(index + 1), { x: width / 2 - 4, y: 18, size: 10, color: rgb(0.35, 0.35, 0.35) }); });
  if (tool.handler === "watermark") pages.forEach((page) => { const { width, height } = page.getSize(); page.drawText("FLIXO", { x: width / 2 - 28, y: height / 2, size: 28, rotate: degrees(45), opacity: 0.22, color: rgb(0.25, 0.35, 0.75) }); });
  if (tool.handler === "remove-metadata") { pdf.setTitle(""); pdf.setAuthor(""); pdf.setSubject(""); pdf.setKeywords([]); pdf.setProducer(""); pdf.setCreator(""); }
  if (tool.handler === "duplicate") { const output = await PDFDocument.create(); const sourcePage = Math.max(0, pages.length - 1); const copied = await output.copyPages(pdf, [sourcePage, sourcePage]); copied.forEach((page) => output.addPage(page)); const saved = await output.save(); return downloadResult(new Blob([saved], { type: "application/pdf" }), `${baseName(file.name)}-duplicate-${tool.preset}.pdf`); }
  if (tool.handler === "extract-range" || tool.handler === "split-even") { const output = await PDFDocument.create(); const indices = tool.handler === "split-even" ? pages.map((_, index) => index).filter((index) => index % 2 === 0) : pages.map((_, index) => index).slice(0, Math.max(1, Math.ceil(pages.length / 2))); const copied = await output.copyPages(pdf, indices); copied.forEach((page) => output.addPage(page)); const saved = await output.save(); return downloadResult(new Blob([saved], { type: "application/pdf" }), `${baseName(file.name)}-${tool.handler}-${tool.preset}.pdf`); }
  if (tool.handler === "blank-cover") pdf.insertPage(0, [595, 842]);
  if (tool.handler === "flatten") { try { pdf.getForm().flatten(); } catch { /* PDFs without forms need no flatten operation. */ } }
  if (tool.handler === "poster") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs"); const pdfDocument = await pdfjs.getDocument({ data: bytes, disableWorker: true }).promise; const page = await pdfDocument.getPage(1); const viewport = page.getViewport({ scale: 1.25 });
    const canvas = document.createElement("canvas"); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height); const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas is unavailable in this browser.");
    await page.render({ canvasContext: context, viewport }).promise; const image = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png")); if (!image) throw new Error("Could not render the PDF poster."); return downloadResult(image, `${baseName(file.name)}-poster.png`);
  }
  const saved = await pdf.save(); return downloadResult(new Blob([saved], { type: "application/pdf" }), `${baseName(file.name)}-${tool.handler}-${tool.preset}.pdf`);
}

export async function runMegaTool(tool: MegaTool, file: File): Promise<MegaToolResult> {
  switch (tool.category) {
    case "images": return imageTool(file, tool);
    case "video": return videoTool(file, tool);
    case "audio": return audioTool(file, tool);
    case "pdf": return pdfTool(file, tool);
    default: throw new Error(`Unsupported mega-tool category: ${tool.category}`);
  }
}
