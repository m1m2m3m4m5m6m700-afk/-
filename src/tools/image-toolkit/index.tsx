import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../i18n/context';
import { convertImage, cropResizeImage, downloadBlob, imageInfo, removeBackground, rasterToSvg, resizeImage, watermarkRemove, fillRemoveRegion } from './engine';
import type { LocalToolId } from './engine';

type LocalToolDefinition = { accept: string };
const DEFINITIONS: Record<Exclude<LocalToolId, 'ai-image-generator' | 'image-compressor'>, LocalToolDefinition> = {
  'background-remover': { accept: 'image/png,image/jpeg,image/webp,image/svg+xml' },
  'image-upscaler': { accept: 'image/png,image/jpeg,image/webp' },
  'image-converter': { accept: 'image/png,image/jpeg,image/webp' },
  'image-to-text': { accept: 'image/png,image/jpeg,image/webp' },
  'object-remover': { accept: 'image/png,image/jpeg,image/webp' },
  'crop-resize': { accept: 'image/png,image/jpeg,image/webp' },
  'watermark-remover': { accept: 'image/png,image/jpeg,image/webp' },
  'raster-to-svg': { accept: 'image/png,image/jpeg,image/webp' },
};

type Props = { toolId: Exclude<LocalToolId, 'image-compressor'> };
type Result = { blob: Blob; text?: string; fileName: string; info?: { width: number; height: number } };
type TesseractModule = { recognize(input: Blob, language: string): Promise<{ data: { text: string } }> };

declare global { interface Window { Tesseract?: TesseractModule } }

async function ensureTesseract(): Promise<TesseractModule> {
  if (window.Tesseract) return window.Tesseract;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@6/dist/tesseract.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('OCR engine could not be loaded.'));
    document.head.appendChild(script);
  });
  if (!window.Tesseract) throw new Error('OCR engine is unavailable.');
  return window.Tesseract;
}

function baseName(name: string) { return name.replace(/\.[^.]+$/, '') || 'flixo-image'; }

function useObjectUrl(blob: Blob | null) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : ''), [blob]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
}

async function preprocessForOcr(file: File): Promise<Blob> {
  const image = await createImageBitmap(file);
  const scale = Math.min(2.5, Math.max(1, 1600 / Math.max(image.width, image.height)));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas is unavailable.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const data = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < data.data.length; index += 4) {
    const luminance = 0.2126 * data.data[index] + 0.7152 * data.data[index + 1] + 0.0722 * data.data[index + 2];
    const boosted = Math.max(0, Math.min(255, (luminance - 128) * 1.45 + 128));
    data.data[index] = boosted;
    data.data[index + 1] = boosted;
    data.data[index + 2] = boosted;
  }
  context.putImageData(data, 0, 0);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not prepare OCR input.')), 'image/png'));
}

export function ImageToolPage({ toolId }: Props) {
  const i18n = useTranslation();
  const ui = i18n.commonToolUi as NonNullable<typeof i18n.commonToolUi>;
  const translated = i18n.tools[toolId as keyof typeof i18n.tools];
  const isGenerator = toolId === 'ai-image-generator';
  const accept = isGenerator ? '' : DEFINITIONS[toolId].accept;

  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/webp');
  const [scale, setScale] = useState('2');
  const [tolerance, setTolerance] = useState('42');
  const [columns, setColumns] = useState('48');
  const [cropX, setCropX] = useState('0');
  const [cropY, setCropY] = useState('0');
  const [cropW, setCropW] = useState('500');
  const [cropH, setCropH] = useState('500');
  const [outW, setOutW] = useState('500');
  const [outH, setOutH] = useState('500');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const previewUrl = useObjectUrl(result?.blob.type.startsWith('image/') ? result.blob : null);
  const downloadUrl = useObjectUrl(result?.blob ?? null);

  const run = async () => {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      if (isGenerator) {
        if (!prompt.trim()) throw new Error(ui.prompt);
        const body = new FormData();
        body.append('capability', 'generate-image');
        body.append('prompt', prompt.trim());
        const response = await fetch(import.meta.env.VITE_FLIXO_AI_IMAGE_ENDPOINT || '/api/ai/image', { method: 'POST', body });
        if (!response.ok) throw new Error(ui.generatorPrivacy);
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) throw new Error(ui.generatorPrivacy);
        const info = await imageInfo(blob);
        setResult({ blob, info, fileName: `flixo-ai-${info.width}x${info.height}.png` });
        return;
      }

      if (!file) throw new Error(ui.chooseImage);
      let blob: Blob;
      let fileName = baseName(file.name);
      let info: Result['info'];

      if (toolId === 'background-remover') {
        blob = await removeBackground(file, Number(tolerance) || 42);
        fileName += '-no-background.png';
      } else if (toolId === 'image-upscaler') {
        const factor = Number(scale);
        if (!Number.isFinite(factor) || factor < 0.25 || factor > 4) throw new Error(ui.scale);
        blob = await resizeImage(file, factor);
        fileName += `-upscaled-${factor}x.png`;
      } else if (toolId === 'image-converter') {
        blob = await convertImage(file, outputFormat);
        fileName += outputFormat === 'image/jpeg' ? '.jpg' : outputFormat === 'image/png' ? '.png' : '.webp';
      } else if (toolId === 'image-to-text') {
        const tesseract = await ensureTesseract();
        const prepared = await preprocessForOcr(file);
        const ocr = await tesseract.recognize(prepared, 'eng+ara');
        setResult({ blob: new Blob([ocr.data.text], { type: 'text/plain;charset=utf-8' }), text: ocr.data.text, fileName: `${baseName(file.name)}.txt` });
        return;
      } else if (toolId === 'object-remover') {
        blob = await fillRemoveRegion(file, { x: Number(cropX), y: Number(cropY), width: Number(cropW), height: Number(cropH) });
        fileName += '-object-removed.png';
      } else if (toolId === 'watermark-remover') {
        blob = await watermarkRemove(file, { x: Number(cropX), y: Number(cropY), width: Number(cropW), height: Number(cropH) });
        fileName += '-watermark-removed.png';
      } else if (toolId === 'crop-resize') {
        blob = await cropResizeImage(file, { x: Number(cropX), y: Number(cropY), width: Number(cropW), height: Number(cropH) }, { width: Number(outW), height: Number(outH) });
        fileName += '-cropped.png';
      } else {
        blob = await rasterToSvg(file, Number(columns) || 48);
        fileName += '.svg';
      }

      if (blob.type.startsWith('image/')) info = await imageInfo(blob);
      setResult({ blob, info, fileName });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : ui.noResult);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="image-tool-shell">
      <div className="image-tool-container">
        <header className="image-tool-header">
          <div>
            <p className="image-tool-eyebrow">FLIXO · {i18n.code.toUpperCase()}</p>
            <h1>{translated.title}</h1>
            <p className="image-tool-lead">{translated.description}</p>
          </div>
        </header>

        <section className="compressor-grid" aria-label={translated.title}>
          <div className="compressor-card">
            {isGenerator ? (
              <label>
                <span>{ui.prompt}</span>
                <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={ui.promptPlaceholder} rows={6} />
              </label>
            ) : (
              <>
                <label className="upload-zone" htmlFor="image-tool-file">
                  <span className="upload-title">{file ? file.name : ui.chooseImage}</span>
                  <span className="upload-subtitle">{accept.replaceAll('image/', '').toUpperCase() || ui.imageInput}</span>
                </label>
                <input id="image-tool-file" className="sr-only" type="file" accept={accept} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
              </>
            )}

            {toolId === 'image-converter' && (
              <label>
                <span>{ui.outputFormat}</span>
                <select aria-label={ui.outputFormat} value={outputFormat} onChange={(event) => setOutputFormat(event.target.value as typeof outputFormat)}>
                  <option value="image/webp">WebP</option>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                </select>
              </label>
            )}
            {toolId === 'image-upscaler' && (
              <label><span>{ui.scale}</span><input inputMode="decimal" aria-label={ui.scale} value={scale} onChange={(event) => setScale(event.target.value)} /></label>
            )}
            {toolId === 'background-remover' && (
              <label><span>{ui.backgroundTolerance}</span><input inputMode="numeric" aria-label={ui.backgroundTolerance} value={tolerance} onChange={(event) => setTolerance(event.target.value)} /></label>
            )}
            {toolId === 'raster-to-svg' && (
              <label><span>{ui.svgColumns}</span><input inputMode="numeric" aria-label={ui.svgColumns} value={columns} onChange={(event) => setColumns(event.target.value)} /></label>
            )}
            {['object-remover', 'watermark-remover', 'crop-resize'].includes(toolId) && (
              <div className="control-grid">
                {([['X', cropX, setCropX], ['Y', cropY, setCropY], [ui.width, cropW, setCropW], [ui.height, cropH, setCropH]] as const).map(([label, value, setter]) => (
                  <label key={label}><span>{label}</span><input inputMode="numeric" aria-label={label} value={value} onChange={(event) => setter(event.target.value)} /></label>
                ))}
                {toolId === 'crop-resize' && <><label><span>{ui.outputWidth}</span><input inputMode="numeric" aria-label={ui.outputWidth} value={outW} onChange={(event) => setOutW(event.target.value)} /></label><label><span>{ui.outputHeight}</span><input inputMode="numeric" aria-label={ui.outputHeight} value={outH} onChange={(event) => setOutH(event.target.value)} /></label></>}
              </div>
            )}

            <div className="button-row">
              <button className="primary-button" disabled={busy || (!file && !isGenerator)} onClick={() => void run()}>
                {busy ? i18n.common.processing : isGenerator ? ui.generateImage : ui.runTool}
              </button>
            </div>
            {error && <p role="alert" className="error-box">{error}</p>}
            {toolId === 'image-to-text' && <p className="privacy-note">{ui.ocrPrivacy}</p>}
            {isGenerator && <p className="privacy-note">{ui.generatorPrivacy}</p>}
          </div>

          <aside className="result-card" aria-live="polite">
            <p className="image-tool-eyebrow">{ui.outputDetails}</p>
            {result ? (
              <>
                {result.text !== undefined ? <pre style={{ whiteSpace: 'pre-wrap' }}>{result.text || ui.noResult}</pre> : previewUrl && <img src={previewUrl} alt={translated.title} style={{ maxWidth: '100%', borderRadius: 12 }} />}
                {result.info && <p className="privacy-note">{ui.outputDetails}: {result.info.width} × {result.info.height}px · {Math.round(result.blob.size / 1024)} KB · {result.blob.type || 'application/octet-stream'}</p>}
                <div className="button-row">
                  <a className="primary-button" href={downloadUrl} download={result.fileName}>{i18n.common.download} {result.fileName}</a>
                  <button className="primary-button" type="button" onClick={() => downloadBlob(result.blob, result.fileName)}>{ui.downloadNow}</button>
                </div>
              </>
            ) : <p>{ui.noResult}</p>}
          </aside>
        </section>
      </div>
    </main>
  );
}
