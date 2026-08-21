import { useEffect, useState } from 'react';
import { convertImage, cropResizeImage, removeBackground, rasterToSvg, resizeImage, watermarkRemove, fillRemoveRegion } from './engine';
import type { LocalToolId } from './engine';

const DEFINITIONS: Record<Exclude<LocalToolId, 'ai-image-generator' | 'image-compressor'>, { title: string; description: string; accept: string }> = {
  'background-remover': { title: 'Background Remover', description: 'Remove simple, uniform image backgrounds locally in your browser.', accept: 'image/png,image/jpeg,image/webp,image/svg+xml' },
  'image-upscaler': { title: 'AI Image Upscaler', description: 'Increase image dimensions with high-quality browser resampling.', accept: 'image/png,image/jpeg,image/webp' },
  'image-converter': { title: 'Image Converter', description: 'Convert images between PNG, JPG, and WebP without uploading them.', accept: 'image/png,image/jpeg,image/webp' },
  'image-to-text': { title: 'Image to Text OCR', description: 'Extract visible text from an image in your browser.', accept: 'image/png,image/jpeg,image/webp' },
  'object-remover': { title: 'Object Remover', description: 'Remove a rectangular object region with local reconstruction.', accept: 'image/png,image/jpeg,image/webp' },
  'crop-resize': { title: 'Crop & Resize', description: 'Crop an image and export it at exact dimensions.', accept: 'image/png,image/jpeg,image/webp' },
  'watermark-remover': { title: 'Watermark Remover', description: 'Cover a selected watermark region locally with edge-color reconstruction.', accept: 'image/png,image/jpeg,image/webp' },
  'raster-to-svg': { title: 'Raster to SVG', description: 'Convert a small raster image to a pixel-based SVG locally.', accept: 'image/png,image/jpeg,image/webp' },
};

type Props = { toolId: Exclude<LocalToolId, 'image-compressor'> };
type Result = { blob: Blob; text?: string; fileName: string };
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

export function ImageToolPage({ toolId }: Props) {
  const isGenerator = toolId === 'ai-image-generator';
  const definition = isGenerator ? { title: 'AI Image Generator', description: 'Generate an image through the configured FLIXO image model endpoint.', accept: '' } : DEFINITIONS[toolId];
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
  const [previewUrl, setPreviewUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    if (!result) { setPreviewUrl(''); setDownloadUrl(''); return; }
    const preview = result.blob.type.startsWith('image/') ? URL.createObjectURL(result.blob) : '';
    const download = URL.createObjectURL(result.blob);
    setPreviewUrl(preview); setDownloadUrl(download);
    return () => { if (preview) URL.revokeObjectURL(preview); URL.revokeObjectURL(download); };
  }, [result]);

  const run = async () => {
    setBusy(true); setError(''); setResult(null);
    try {
      if (isGenerator) {
        if (!prompt.trim()) throw new Error('Enter a prompt first.');
        const body = new FormData(); body.append('capability', 'generate-image'); body.append('prompt', prompt.trim());
        const response = await fetch(import.meta.env.VITE_FLIXO_AI_IMAGE_ENDPOINT || '/api/ai/image', { method: 'POST', body });
        if (!response.ok) throw new Error('AI image endpoint is not configured or returned an error.');
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) throw new Error('AI endpoint did not return an image.');
        setResult({ blob, fileName: 'flixo-ai-image.png' });
        return;
      }
      if (!file) throw new Error('Choose an image first.');
      let blob: Blob;
      let fileName = baseName(file.name);
      if (toolId === 'background-remover') { blob = await removeBackground(file, Number(tolerance) || 42); fileName += '-no-background.png'; }
      else if (toolId === 'image-upscaler') { const factor = Number(scale); if (!Number.isFinite(factor) || factor <= 0 || factor > 4) throw new Error('Scale must be between 0.25 and 4.'); blob = await resizeImage(file, factor); fileName += `-upscaled-${factor}x.png`; }
      else if (toolId === 'image-converter') { blob = await convertImage(file, outputFormat); fileName += outputFormat === 'image/jpeg' ? '.jpg' : outputFormat === 'image/png' ? '.png' : '.webp'; }
      else if (toolId === 'image-to-text') { const tesseract = await ensureTesseract(); const ocr = await tesseract.recognize(file, 'eng+ara'); setResult({ blob: new Blob([ocr.data.text], { type: 'text/plain;charset=utf-8' }), text: ocr.data.text, fileName: `${baseName(file.name)}.txt` }); return; }
      else if (toolId === 'object-remover') { blob = await fillRemoveRegion(file, { x: Number(cropX), y: Number(cropY), width: Number(cropW), height: Number(cropH) }); fileName += '-object-removed.png'; }
      else if (toolId === 'watermark-remover') { blob = await watermarkRemove(file, { x: Number(cropX), y: Number(cropY), width: Number(cropW), height: Number(cropH) }); fileName += '-watermark-removed.png'; }
      else if (toolId === 'crop-resize') { blob = await cropResizeImage(file, { x:Number(cropX), y:Number(cropY), width:Number(cropW), height:Number(cropH) }, { width:Number(outW), height:Number(outH) }); fileName += '-cropped.png'; }
      else { blob = await rasterToSvg(file, Number(columns) || 48); fileName += '.svg'; }
      setResult({ blob, fileName });
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Tool failed.'); }
    finally { setBusy(false); }
  };

  return (
    <main className="image-tool-shell">
      <div className="image-tool-container">
        <header className="image-tool-header"><div><p className="image-tool-eyebrow">FLIXO · IMAGE TOOLS</p><h1>{definition.title}</h1><p className="image-tool-lead">{definition.description}</p></div></header>
        <section className="compressor-grid" aria-label={definition.title}>
          <div className="compressor-card">
            {isGenerator ? <label><span>Prompt</span><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A cinematic sunset over Cairo..." rows={6} /></label> : <>
              <label className="upload-zone" htmlFor="image-tool-file"><span className="upload-title">{file ? file.name : 'Choose an image'}</span><span className="upload-subtitle">{definition.accept.replaceAll('image/','').toUpperCase() || 'IMAGE INPUT'}</span></label>
              <input id="image-tool-file" className="sr-only" type="file" accept={definition.accept} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </>}
            {toolId === 'image-converter' && <label><span>Output format</span><select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as typeof outputFormat)}><option value="image/webp">WebP</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select></label>}
            {toolId === 'image-upscaler' && <label><span>Scale</span><input inputMode="decimal" value={scale} onChange={(e) => setScale(e.target.value)} /></label>}
            {toolId === 'background-remover' && <label><span>Background tolerance</span><input inputMode="numeric" value={tolerance} onChange={(e) => setTolerance(e.target.value)} /></label>}
            {toolId === 'raster-to-svg' && <label><span>SVG columns</span><input inputMode="numeric" value={columns} onChange={(e) => setColumns(e.target.value)} /></label>}
            {['object-remover','watermark-remover','crop-resize'].includes(toolId) && <div className="control-grid"><label><span>X</span><input inputMode="numeric" value={cropX} onChange={(e) => setCropX(e.target.value)} /></label><label><span>Y</span><input inputMode="numeric" value={cropY} onChange={(e) => setCropY(e.target.value)} /></label><label><span>Width</span><input inputMode="numeric" value={cropW} onChange={(e) => setCropW(e.target.value)} /></label><label><span>Height</span><input inputMode="numeric" value={cropH} onChange={(e) => setCropH(e.target.value)} /></label>{toolId === 'crop-resize' && <><label><span>Output width</span><input inputMode="numeric" value={outW} onChange={(e) => setOutW(e.target.value)} /></label><label><span>Output height</span><input inputMode="numeric" value={outH} onChange={(e) => setOutH(e.target.value)} /></label></>}</div>}
            <div className="button-row"><button className="primary-button" disabled={busy || (!file && !isGenerator)} onClick={() => void run()}>{busy ? 'Processing…' : isGenerator ? 'Generate image' : 'Run tool'}</button></div>
            {error && <p role="alert" className="error-box">{error}</p>}
            {toolId === 'image-to-text' && <p className="privacy-note">OCR loads Tesseract.js on demand and processes the selected image in the browser.</p>}
            {isGenerator && <p className="privacy-note">Requires a configured FLIXO image-generation endpoint. No fake local “AI” fallback is used.</p>}
          </div>
          <aside className="result-card" aria-live="polite"><p className="image-tool-eyebrow">RESULT</p>{result ? <>{result.text !== undefined ? <pre style={{whiteSpace:'pre-wrap'}}>{result.text || 'No text detected.'}</pre> : <>{previewUrl && <img src={previewUrl} alt="Tool result" style={{maxWidth:'100%',borderRadius:12}} />}<a className="primary-button" href={downloadUrl} download={result.fileName}>Download {result.fileName}</a></>}</> : <p>No result yet.</p>}</aside>
        </section>
      </div>
    </main>
  );
}
