import React, { useCallback, useEffect, useRef, useState } from 'react';
import fragmentSource from './glsl/fragment.glsl?raw';
import { SeedGLEngine, type SeedRenderSettings } from './webgl-engine';
import { DEFAULT_ADVANCED, renderAdvanced, type AdvancedSeedSettings } from './advanced-engine';

export interface SeedState extends SeedRenderSettings {
  blurRadius: number;
  crop: { x: number; y: number; width: number; height: number } | null;
}

type Snapshot = { basic: SeedState; advanced: AdvancedSeedSettings };

const DEFAULT_STATE: SeedState = {
  brightness: 0, contrast: 0, saturation: 0, warmth: 0,
  ambiance: 0, highlights: 0, shadows: 0, blurRadius: 0, crop: null,
};

const cloneAdvanced = (value: AdvancedSeedSettings): AdvancedSeedSettings => ({
  ...value,
  curves: value.curves.map((point) => ({ ...point })),
  brush: value.brush.map((stroke) => ({ ...stroke })),
});

const cloneSnapshot = (snapshot: Snapshot): Snapshot => ({ basic: { ...snapshot.basic }, advanced: cloneAdvanced(snapshot.advanced) });

function pushHistory(next: Snapshot, history: Snapshot[], index: number) {
  const last = history[index];
  const serialized = JSON.stringify({ basic: next.basic, advanced: { ...next.advanced, doubleExposure: null } });
  const lastSerialized = last ? JSON.stringify({ basic: last.basic, advanced: { ...last.advanced, doubleExposure: null } }) : '';
  if (serialized === lastSerialized) return { history, index };
  const nextHistory = history.slice(0, index + 1).map(cloneSnapshot);
  nextHistory.push(cloneSnapshot(next));
  return { history: nextHistory, index: nextHistory.length - 1 };
}

export default function SeedTool() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SeedGLEngine | null>(null);
  const imageUrlRef = useRef<string | null>(null);
  const doubleExposureUrlRef = useRef<string | null>(null);
  const renderFrameRef = useRef<number | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<SeedState>(DEFAULT_STATE);
  const [advanced, setAdvanced] = useState<AdvancedSeedSettings>(DEFAULT_ADVANCED);
  const [history, setHistory] = useState<Snapshot[]>([{ basic: DEFAULT_STATE, advanced: DEFAULT_ADVANCED }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [error, setError] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(true);

  const scheduleRender = useCallback(() => {
    if (!engineRef.current || !image) return;
    if (renderFrameRef.current !== null) cancelAnimationFrame(renderFrameRef.current);
    setIsRendering(true);
    renderFrameRef.current = requestAnimationFrame(() => {
      renderFrameRef.current = null;
      try { engineRef.current?.render(settings); }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'GPU rendering failed.'); }
      finally { setIsRendering(false); }
    });
  }, [image, settings]);

  useEffect(() => {
    if (!canvasRef.current || !image) return;
    try {
      engineRef.current?.destroy();
      const engine = new SeedGLEngine(canvasRef.current, fragmentSource);
      canvasRef.current.width = image.naturalWidth;
      canvasRef.current.height = image.naturalHeight;
      engine.setImage(image);
      engineRef.current = engine;
    } catch (cause) {
      engineRef.current?.destroy(); engineRef.current = null;
      const message = cause instanceof Error ? cause.message : 'Unable to start GPU rendering.';
      queueMicrotask(() => setError(message));
    }
    return () => {
      if (renderFrameRef.current !== null) cancelAnimationFrame(renderFrameRef.current);
      engineRef.current?.destroy(); engineRef.current = null;
    };
  }, [image]);

  useEffect(() => { scheduleRender(); }, [scheduleRender]);

  useEffect(() => () => {
    if (renderFrameRef.current !== null) cancelAnimationFrame(renderFrameRef.current);
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    if (doubleExposureUrlRef.current) URL.revokeObjectURL(doubleExposureUrlRef.current);
  }, []);

  const commit = (nextBasic: SeedState, nextAdvanced: AdvancedSeedSettings) => {
    const next = { basic: nextBasic, advanced: nextAdvanced };
    const result = pushHistory(next, history, historyIndex);
    setSettings(nextBasic); setAdvanced(nextAdvanced); setHistory(result.history); setHistoryIndex(result.index);
  };

  const updateSetting = <K extends keyof SeedState>(key: K, value: SeedState[K]) => commit({ ...settings, [key]: value }, advanced);

  const updateAdvanced = <K extends keyof AdvancedSeedSettings>(key: K, value: AdvancedSeedSettings[K]) => commit(settings, { ...advanced, [key]: value });

  const undo = () => {
    if (historyIndex === 0) return;
    const next = cloneSnapshot(history[historyIndex - 1]);
    setHistoryIndex(historyIndex - 1); setSettings(next.basic); setAdvanced(next.advanced);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const next = cloneSnapshot(history[historyIndex + 1]);
    setHistoryIndex(historyIndex + 1); setSettings(next.basic); setAdvanced(next.advanced);
  };

  const openImage = (file: File) => {
    const url = URL.createObjectURL(file);
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    imageUrlRef.current = url;
    const img = new Image();
    img.onload = () => {
      setImage(img); setSettings(DEFAULT_STATE); setAdvanced(cloneAdvanced(DEFAULT_ADVANCED));
      setHistory([{ basic: DEFAULT_STATE, advanced: cloneAdvanced(DEFAULT_ADVANCED) }]); setHistoryIndex(0); setError('');
    };
    img.onerror = () => setError('Unable to decode this image.');
    img.src = url;
  };

  const openDoubleExposure = (file: File) => {
    const url = URL.createObjectURL(file);
    if (doubleExposureUrlRef.current) URL.revokeObjectURL(doubleExposureUrlRef.current);
    doubleExposureUrlRef.current = url;
    const layer = new Image();
    layer.onload = () => updateAdvanced('doubleExposure', layer);
    layer.onerror = () => setError('Unable to decode the exposure layer.');
    layer.src = url;
  };

  const addBrushPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!image || advanced.brushStrength === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * image.naturalWidth;
    const y = ((event.clientY - rect.top) / rect.height) * image.naturalHeight;
    updateAdvanced('brush', [...advanced.brush, { x, y, radius: Math.max(12, image.naturalWidth / 30), opacity: 0.8 }]);
  };

  const exportImage = async () => {
    if (!image) return;
    try {
      setError('');
      const output = document.createElement('canvas');
      output.width = image.naturalWidth; output.height = image.naturalHeight;
      const ctx = output.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Unable to create export context.');
      ctx.drawImage(image, 0, 0);
      const filterParts = [
        `brightness(${100 + settings.brightness}%)`,
        `contrast(${100 + settings.contrast}%)`,
        `saturate(${100 + settings.saturation}%)`,
        settings.blurRadius > 0 ? `blur(${settings.blurRadius}px)` : '',
      ].filter(Boolean);
      if (filterParts.length) {
        const source = document.createElement('canvas'); source.width = output.width; source.height = output.height;
        const sctx = source.getContext('2d'); if (!sctx) throw new Error('Unable to create export staging canvas.');
        sctx.filter = filterParts.join(' '); sctx.drawImage(output, 0, 0);
        ctx.clearRect(0, 0, output.width, output.height); ctx.drawImage(source, 0, 0);
      }
      if (settings.warmth !== 0) { ctx.save(); ctx.globalAlpha = Math.abs(settings.warmth) / 400; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = settings.warmth > 0 ? '#ffa500' : '#0096ff'; ctx.fillRect(0, 0, output.width, output.height); ctx.restore(); }
      renderAdvanced(ctx, advanced);
      const blob = await new Promise<Blob | null>((resolve) => output.toBlob(resolve, 'image/png'));
      if (!blob || blob.size < 32) throw new Error('Export produced an invalid image.');
      const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'seed-edited.png'; anchor.click(); URL.revokeObjectURL(url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to export the image.'); }
  };

  return (
    <div className="mx-auto flex min-h-[650px] max-w-7xl flex-col gap-6 p-4 lg:flex-row">
      <section className="relative flex min-h-[520px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        {image ? (
          <canvas ref={canvasRef} onPointerDown={addBrushPoint} className="max-h-[78vh] max-w-full touch-none object-contain shadow-2xl" aria-label="Seed preview" />
        ) : (
          <label className="cursor-pointer rounded-xl border-2 border-dashed border-zinc-800 p-12 text-center hover:border-zinc-600">
            <span className="mb-2 block text-zinc-300">اختر صورة للبدء في Seed</span><span className="text-sm text-zinc-500">GPU preview + professional non-destructive export</span>
            <input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) openImage(file); }} />
          </label>
        )}
        {isRendering && image && <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs text-zinc-300">Rendering…</span>}
      </section>

      <aside className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:w-[420px]">
        <div className="mb-4 flex items-center justify-between"><div><h1 className="text-xl font-bold text-white">Seed</h1><p className="text-xs text-zinc-500">GPU color editor + advanced export pipeline</p></div><label className="cursor-pointer rounded-lg bg-zinc-800 px-3 py-2 text-xs text-white">Replace<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) openImage(f); }} /></label></div>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <h2 className="mb-3 text-sm font-semibold text-zinc-200">Tune</h2>
          {(['brightness', 'contrast', 'saturation', 'warmth', 'ambiance', 'highlights', 'shadows'] as const).map((key) => <label key={key} className="mb-4 block"><span className="mb-1 flex justify-between text-xs text-zinc-400"><span className="capitalize">{key}</span><span>{settings[key]}</span></span><input aria-label={key} type="range" min="-100" max="100" value={settings[key]} onChange={(e) => updateSetting(key, Number(e.target.value))} className="w-full" /></label>)}

          <button type="button" className="mb-3 w-full rounded-lg bg-zinc-800 px-3 py-2 text-left text-sm font-semibold text-white" onClick={() => setAdvancedOpen(!advancedOpen)}>Advanced {advancedOpen ? '−' : '+'}</button>
          {advancedOpen && <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
            <label className="block text-xs text-zinc-400">Curves strength <input aria-label="Curves" type="range" min="-100" max="100" value={Math.round((advanced.curves[2].y - 0.5) * 200)} onChange={(e) => { const v = Number(e.target.value) / 200; updateAdvanced('curves', [{ x: 0, y: 0 }, { x: 0.25, y: Math.max(0, 0.25 + v) }, { x: 0.5, y: Math.max(0, Math.min(1, 0.5 + v)) }, { x: 0.75, y: Math.max(0, Math.min(1, 0.75 + v)) }, { x: 1, y: 1 }]); }} className="mt-2 w-full" /></label>
            <label className="block text-xs text-zinc-400">Selective / Brush strength<input aria-label="Brush strength" type="range" min="-100" max="100" value={advanced.brushStrength} onChange={(e) => updateAdvanced('brushStrength', Number(e.target.value))} className="mt-2 w-full" /></label>
            <p className="text-[11px] text-zinc-500">Click the preview to paint a local adjustment.</p>
            <label className="block text-xs text-zinc-400">Perspective X<input aria-label="Perspective X" type="range" min="-25" max="25" value={advanced.perspectiveX} onChange={(e) => updateAdvanced('perspectiveX', Number(e.target.value))} className="mt-2 w-full" /></label>
            <label className="block text-xs text-zinc-400">Perspective Y<input aria-label="Perspective Y" type="range" min="-25" max="25" value={advanced.perspectiveY} onChange={(e) => updateAdvanced('perspectiveY', Number(e.target.value))} className="mt-2 w-full" /></label>
            <label className="block text-xs text-zinc-400">Lens Blur<input aria-label="Lens Blur" type="range" min="0" max="40" value={advanced.lensBlur} onChange={(e) => updateAdvanced('lensBlur', Number(e.target.value))} className="mt-2 w-full" /></label>
            <label className="block text-xs text-zinc-400">Bokeh / focus shift<input aria-label="Bokeh" type="range" min="-100" max="100" value={advanced.bokeh} onChange={(e) => updateAdvanced('bokeh', Number(e.target.value))} className="mt-2 w-full" /></label>
            <label className="block text-xs text-zinc-400">Healing X<input aria-label="Healing X" type="number" min="0" defaultValue="0" onChange={(e) => updateAdvanced('heal', { x: Number(e.target.value), y: advanced.heal?.y ?? 0, width: advanced.heal?.width ?? 32, height: advanced.heal?.height ?? 32 })} className="mt-2 w-full rounded bg-zinc-900 p-2 text-white" /></label>
            <label className="block text-xs text-zinc-400">Healing Y<input aria-label="Healing Y" type="number" min="0" defaultValue="0" onChange={(e) => updateAdvanced('heal', { x: advanced.heal?.x ?? 0, y: Number(e.target.value), width: advanced.heal?.width ?? 32, height: advanced.heal?.height ?? 32 })} className="mt-2 w-full rounded bg-zinc-900 p-2 text-white" /></label>
            <label className="block text-xs text-zinc-400">Double Exposure<input aria-label="Double Exposure file" type="file" accept="image/*" className="mt-2 w-full text-xs text-zinc-400" onChange={(e) => { const f = e.target.files?.[0]; if (f) openDoubleExposure(f); }} /></label>
            <label className="block text-xs text-zinc-400">Exposure opacity<input aria-label="Exposure opacity" type="range" min="0" max="100" value={advanced.doubleExposureOpacity} onChange={(e) => updateAdvanced('doubleExposureOpacity', Number(e.target.value))} className="mt-2 w-full" /></label>
          </div>}
        </div>

        {error && <div role="alert" className="my-4 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">{error}</div>}
        <div className="mt-4 flex gap-2 border-t border-zinc-800 pt-4"><button type="button" onClick={undo} disabled={historyIndex === 0} className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white disabled:opacity-40">Undo</button><button type="button" onClick={redo} disabled={historyIndex >= history.length - 1} className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white disabled:opacity-40">Redo</button><button type="button" onClick={exportImage} disabled={!image} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Export PNG</button></div>
      </aside>
    </div>
  );
}
