const MAX_DIM = {
  quick: 640,
  small: 960,
  medium: 1280,
  large: 1600,
  social: 1080,
  web: 1440,
  mobile: 1170,
  print: 2400,
  hd: 1920,
  pro: 2560,
  max: 4096,
};

const IMAGE_QUALITY = { quick: 0.55, small: 0.65, medium: 0.75, large: 0.82, social: 0.78, web: 0.74, mobile: 0.72, print: 0.9, hd: 0.86, pro: 0.92, max: 0.95 };

function extension(name) {
  return name.includes(".") ? name.slice(name.lastIndexOf(".") + 1) : "bin";
}

function downloadResult(blob, filename, type = "download") {
  return { type, url: URL.createObjectURL(blob), filename };
}

async function imageResult(file, handler, preset) {
  if (!file.type.startsWith("image/")) throw new Error("Please select an image file.");
  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;
  const max = MAX_DIM[preset];
  if (handler === "resize" || handler === "compress" || handler.startsWith("convert-")) {
    const scale = Math.min(1, max / Math.max(width, height));
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }
  const angle = handler === "rotate" ? 90 : 0;
  const outW = angle ? height : width;
  const outH = angle ? width : height;
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");
  ctx.save();
  if (angle) {
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-width / 2, -height / 2);
  } else if (handler === "flip") {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  const filters = {
    grayscale: "grayscale(1)",
    invert: "invert(1)",
    brightness: `brightness(${preset === "max" ? 1.45 : preset === "pro" ? 1.25 : 1.12})`,
    contrast: `contrast(${preset === "max" ? 1.45 : preset === "pro" ? 1.25 : 1.12})`,
    saturation: `saturate(${preset === "max" ? 1.65 : preset === "pro" ? 1.4 : 1.2})`,
  };
  if (filters[handler]) ctx.filter = filters[handler];
  ctx.drawImage(bitmap, 0, 0, width, height);
  ctx.restore();
  bitmap.close?.();
  if (["brightness", "contrast", "saturation", "grayscale", "invert"].includes(handler)) {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (handler === "brightness") {
      const amount = preset === "max" ? 24 : preset === "pro" ? 16 : 8;
      for (let i = 0; i < image.data.length; i += 4) {
        image.data[i] = Math.min(255, image.data[i] + amount);
        image.data[i + 1] = Math.min(255, image.data[i + 1] + amount);
        image.data[i + 2] = Math.min(255, image.data[i + 2] + amount);
      }
      ctx.putImageData(image, 0, 0);
    }
  }
  let mime = "image/png";
  let ext = "png";
  if (handler === "convert-jpg" || handler === "compress") { mime = "image/jpeg"; ext = "jpg"; }
  if (handler === "convert-webp") { mime = "image/webp"; ext = "webp"; }
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, IMAGE_QUALITY[preset]));
  if (!blob) throw new Error("The browser could not encode the image.");
  return downloadResult(blob, `${file.name.replace(/\.[^.]+$/, "")}-${handler}-${preset}.${ext}`);
}

function waitEvent(target, event, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { cleanup(); reject(new Error(`Media timeout while waiting for ${event}.`)); }, timeout);
    const cleanup = () => { clearTimeout(timer); target.removeEventListener(event, onEvent); };
    const onEvent = () => { cleanup(); resolve(); };
    target.addEventListener(event, onEvent, { once: true });
  });
}

async function loadVideo(file) {
  if (!file.type.startsWith("video/")) throw new Error("Please select a video file.");
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  const url = URL.createObjectURL(file);
  video.src = url;
  try {
    await waitEvent(video, "loadedmetadata");
    return { video, url };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

async function videoFrame(file, handler, preset) {
  const { video, url } = await loadVideo(file);
  try {
    if (handler === "inspect") {
      return { type: "text", text: `Duration: ${video.duration.toFixed(2)}s\nResolution: ${video.videoWidth}×${video.videoHeight}\nAspect: ${(video.videoWidth / video.videoHeight).toFixed(3)}\nSource: ${file.name}` };
    }
    if (handler === "speed" || handler === "mute") {
      video.playbackRate = { quick: .75, small: .85, medium: .95, large: 1.1, social: 1.2, web: 1.35, mobile: 1.5, print: .8, hd: 1.25, pro: 1.5, max: 2 }[preset];
      video.muted = handler === "mute";
      video.controls = true;
      video.className = "w-full rounded-xl";
      return { type: "video", element: video, keepUrl: true, cleanup: () => URL.revokeObjectURL(url) };
    }
    const points = { "frame-25": .25, "frame-50": .5, "frame-75": .75, poster: .5 };
    if (points[handler] !== undefined) video.currentTime = Math.max(0, video.duration * points[handler]);
    await waitEvent(video, "seeked");
    let width = video.videoWidth;
    let height = video.videoHeight;
    const max = MAX_DIM[preset];
    if (handler === "resize" || handler === "aspect") {
      const scale = Math.min(1, max / Math.max(width, height));
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable.");
    if (handler === "flip") { ctx.translate(width, 0); ctx.scale(-1, 1); }
    if (handler === "rotate") { canvas.width = height; canvas.height = width; ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(Math.PI / 2); ctx.drawImage(video, -width / 2, -height / 2, width, height); }
    else ctx.drawImage(video, 0, 0, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", .88));
    if (!blob) throw new Error("Could not create the video frame.");
    return downloadResult(blob, `${file.name.replace(/\.[^.]+$/, "")}-${handler}-${preset}.jpg`);
  } finally {
    if (handler !== "speed" && handler !== "mute") { video.removeAttribute("src"); URL.revokeObjectURL(url); }
  }
}

async function decodeAudio(file) {
  if (!file.type.startsWith("audio/")) throw new Error("Please select an MP3/audio file.");
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) throw new Error("Web Audio API is unavailable in this browser.");
  const ctx = new AudioCtx();
  try { return await ctx.decodeAudioData(await file.arrayBuffer()); } finally { await ctx.close(); }
}

function audioBufferClone(source, length, sampleRate = source.sampleRate, channels = source.numberOfChannels) {
  const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!Ctx) throw new Error("Offline audio processing is unavailable.");
  return new Ctx(channels, length, sampleRate).createBuffer(channels, length, sampleRate);
}

function wavBlob(buffer) {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const frames = buffer.length;
  const bytes = 44 + frames * channels * 2;
  const view = new DataView(new ArrayBuffer(bytes));
  const write = (offset, text) => [...text].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  write(0, "RIFF"); view.setUint32(4, bytes - 8, true); write(8, "WAVE"); write(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * channels * 2, true); view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true); write(36, "data"); view.setUint32(40, frames * channels * 2, true);
  let p = 44;
  for (let i = 0; i < frames; i++) for (let c = 0; c < channels; c++) { const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i])); view.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7fff, true); p += 2; }
  return new Blob([view], { type: "audio/wav" });
}

async function audioResult(file, handler, preset) {
  const buffer = await decodeAudio(file);
  if (handler === "inspect") return { type: "text", text: `Duration: ${buffer.duration.toFixed(2)}s\nSample rate: ${buffer.sampleRate} Hz\nChannels: ${buffer.numberOfChannels}\nFrames: ${buffer.length}\nSource: ${file.name}` };
  let target = buffer;
  if (handler === "peak" || handler === "rms") {
    let sum = 0, peak = 0, count = 0;
    for (let c = 0; c < buffer.numberOfChannels; c++) for (const value of buffer.getChannelData(c)) { const a = Math.abs(value); peak = Math.max(peak, a); sum += value * value; count++; }
    const rms = Math.sqrt(sum / Math.max(1, count));
    return { type: "text", text: handler === "peak" ? `Peak: ${(peak * 100).toFixed(2)}%` : `RMS: ${(rms * 100).toFixed(2)}%` };
  }
  if (handler === "waveform") {
    const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 260; const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable.");
    const data = buffer.getChannelData(0); ctx.beginPath(); ctx.moveTo(0, canvas.height / 2); const step = Math.max(1, Math.floor(data.length / canvas.width));
    for (let x = 0; x < canvas.width; x++) { let peak = 0; const end = Math.min(data.length, (x + 1) * step); for (let i = x * step; i < end; i++) peak = Math.max(peak, Math.abs(data[i])); ctx.lineTo(x, canvas.height / 2 - peak * 100); ctx.lineTo(x, canvas.height / 2 + peak * 100); }
    ctx.stroke(); const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png")); if (!blob) throw new Error("Could not encode waveform."); return downloadResult(blob, `${file.name.replace(/\.[^.]+$/, "")}-waveform.png`);
  }
  if (handler === "wav") return downloadResult(wavBlob(buffer), `${file.name.replace(/\.[^.]+$/, "")}-export.wav`);
  const factor = { quick: .15, small: .08, medium: .05, large: .03, social: .07, web: .04, mobile: .1, print: .02, hd: .025, pro: .015, max: .01 }[preset] ?? .05;
  const targetChannels = handler === "mono" ? 1 : buffer.numberOfChannels;
  const targetLength = handler === "trim" ? Math.max(1, Math.floor(buffer.length * (1 - factor))) : handler === "speed" ? Math.max(1, Math.floor(buffer.length / (0.75 + factor))) : buffer.length;
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!Offline) throw new Error("Offline audio processing is unavailable.");
  const offline = new Offline(targetChannels, targetLength, buffer.sampleRate);
  const source = offline.createBufferSource();
  const b = offline.createBuffer(targetChannels, targetLength, buffer.sampleRate);
  for (let c = 0; c < targetChannels; c++) { const dst = b.getChannelData(c); const left = buffer.getChannelData(0); const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left; for (let i = 0; i < dst.length; i++) { const srcIndex = handler === "reverse" ? buffer.length - 1 - i : handler === "speed" ? Math.min(buffer.length - 1, Math.floor(i * (buffer.length / dst.length))) : i; let value = c === 0 ? left[srcIndex] : right[srcIndex]; if (handler === "mono") value = (left[srcIndex] + right[srcIndex]) / 2; if (handler === "normalize") value *= 0.95; if (handler === "fade-in") value *= Math.min(1, i / Math.max(1, dst.length * factor)); if (handler === "fade-out") value *= Math.min(1, (dst.length - i) / Math.max(1, dst.length * factor)); dst[i] = value; } }
  source.buffer = b; source.connect(offline.destination); source.start(); const rendered = await offline.startRendering(); return downloadResult(wavBlob(rendered), `${file.name.replace(/\.[^.]+$/, "")}-${handler}-${preset}.wav`);
}

async function pdfResult(file, handler, preset) {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("Please select a PDF file.");
  const { PDFDocument, rgb, degrees } = await import("pdf-lib");
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pages = pdf.getPages();
  if (handler === "inspect") return { type: "text", text: `Pages: ${pages.length}\nTitle: ${pdf.getTitle() || "—"}\nAuthor: ${pdf.getAuthor() || "—"}\nSource: ${file.name}` };
  if (handler === "remove-metadata") { pdf.setTitle(""); pdf.setAuthor(""); pdf.setSubject(""); pdf.setKeywords([]); pdf.setProducer(""); pdf.setCreator(""); }
  if (handler === "rotate") pages.forEach((page) => page.setRotation(degrees((page.getRotation().angle + 90) % 360)));
  if (handler === "page-numbers") pages.forEach((page, i) => { const { width } = page.getSize(); page.drawText(String(i + 1), { x: width / 2 - 6, y: 18, size: 10, color: rgb(.35, .35, .35) }); });
  if (handler === "watermark") pages.forEach((page) => { const { width, height } = page.getSize(); page.drawText("FLIXO", { x: width / 2 - 35, y: height / 2, size: 34, opacity: .16, rotate: degrees(35), color: rgb(.3, .3, .3) }); });
  if (handler === "duplicate") { const last = pages[pages.length - 1]; const copy = await pdf.copyPages(pdf, [pages.length - 1]); if (copy[0]) pdf.addPage(copy[0]); }
  if (handler === "blank-cover") { pdf.insertPage(0); }
  if (handler === "extract-range" || handler === "split-even") {
    const size = Math.max(1, Math.floor(pages.length * ({ quick: .25, small: .3, medium: .4, large: .5, social: .33, web: .6, mobile: .2, print: .75, hd: .8, pro: .9, max: 1 }[preset] ?? .5)));
    const wanted = Array.from({ length: size }, (_, i) => i);
    const out = await PDFDocument.create(); const copied = await out.copyPages(pdf, wanted); copied.forEach((p) => out.addPage(p)); return downloadResult(new Blob([await out.save()], { type: "application/pdf" }), `${file.name.replace(/\.pdf$/i, "")}-${handler}-${preset}.pdf`);
  }
  if (handler === "poster") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const doc = await pdfjs.getDocument({ data: bytes, disableWorker: true }).promise; const page = await doc.getPage(1); const viewport = page.getViewport({ scale: 1.6 }); const canvas = document.createElement("canvas"); canvas.width = viewport.width; canvas.height = viewport.height; const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable."); await page.render({ canvasContext: ctx, viewport }).promise; const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png")); if (!blob) throw new Error("Could not render PDF page."); return downloadResult(blob, `${file.name.replace(/\.pdf$/i, "")}-page-1.png`);
  }
  if (handler === "extract-text") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs"); const doc = await pdfjs.getDocument({ data: bytes, disableWorker: true }).promise; let text = ""; for (let i = 1; i <= doc.numPages; i++) { const page = await doc.getPage(i); const content = await page.getTextContent(); text += `\n--- Page ${i} ---\n` + content.items.map((item) => item.str || "").join(" "); } return { type: "text", text: text.trim() || "No searchable text was found." };
  }
  if (handler === "flatten") { try { pdf.getForm().flatten(); } catch { /* no forms */ } }
  const output = await pdf.save();
  return downloadResult(new Blob([output], { type: "application/pdf" }), `${file.name.replace(/\.pdf$/i, "")}-${handler}-${preset}.pdf`);
}

export const MEGA_HANDLER_IDS = Object.freeze(["resize","compress","convert-png","convert-jpg","convert-webp","rotate","flip","grayscale","invert","brightness","contrast","saturation","inspect","poster","frame-25","frame-50","frame-75","mute","speed","contact-sheet","aspect","waveform","peak","rms","normalize","trim","fade-in","fade-out","mono","reverse","wav","extract-text","page-numbers","watermark","remove-metadata","duplicate","extract-range","split-even","blank-cover","flatten"]);

export async function runMegaTool(tool, file) {
  if (!file) throw new Error("Choose a file first.");
  if (tool.category === "images") return imageResult(file, tool.handler, tool.preset);
  if (tool.category === "video") return videoFrame(file, tool.handler, tool.preset);
  if (tool.category === "audio") return audioResult(file, tool.handler, tool.preset);
  if (tool.category === "pdf") return pdfResult(file, tool.handler, tool.preset);
  throw new Error("Unsupported mega-tool category.");
}
