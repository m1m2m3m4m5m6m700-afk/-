import React, { useCallback, useEffect, useRef, useState } from 'react';
import fragmentSource from './glsl/fragment.glsl?raw';
import { SeedGLEngine, type SeedRenderSettings } from './webgl-engine';

export interface SeedState extends SeedRenderSettings {
  blurRadius: number;
  crop: { x: number; y: number; width: number; height: number } | null;
}

const DEFAULT_STATE: SeedState = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  ambiance: 0,
  highlights: 0,
  shadows: 0,
  blurRadius: 0,
  crop: null,
};

function pushHistory(next: SeedState, history: SeedState[], index: number) {
  const nextHistory = history.slice(0, index + 1);
  if (JSON.stringify(nextHistory[nextHistory.length - 1]) !== JSON.stringify(next)) nextHistory.push(next);
  return { history: nextHistory, index: nextHistory.length - 1 };
}

export default function SeedTool() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SeedGLEngine | null>(null);
  const imageUrlRef = useRef<string | null>(null);
  const renderFrameRef = useRef<number | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<SeedState>(DEFAULT_STATE);
  const [history, setHistory] = useState<SeedState[]>([DEFAULT_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [error, setError] = useState('');
  const [isRendering, setIsRendering] = useState(false);

  const scheduleRender = useCallback(() => {
    if (!engineRef.current || !image) return;
    if (renderFrameRef.current !== null) cancelAnimationFrame(renderFrameRef.current);
    setIsRendering(true);
    renderFrameRef.current = requestAnimationFrame(() => {
      renderFrameRef.current = null;
      try {
        engineRef.current?.render(settings);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'GPU rendering failed.');
      } finally {
        setIsRendering(false);
      }
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
      setError('');
      scheduleRender();
    } catch (cause) {
      engineRef.current?.destroy();
      engineRef.current = null;
      setError(cause instanceof Error ? cause.message : 'Unable to start GPU rendering.');
    }
    return () => {
      if (renderFrameRef.current !== null) cancelAnimationFrame(renderFrameRef.current);
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [image]);

  useEffect(() => {
    scheduleRender();
  }, [scheduleRender]);

  useEffect(() => () => {
    if (renderFrameRef.current !== null) cancelAnimationFrame(renderFrameRef.current);
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
  }, []);

  const updateSetting = <K extends keyof SeedState>(key: K, value: SeedState[K]) => {
    const next = { ...settings, [key]: value };
    const result = pushHistory(next, history, historyIndex);
    setSettings(next);
    setHistory(result.history);
    setHistoryIndex(result.index);
  };

  const undo = () => {
    if (historyIndex === 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    setSettings(history[nextIndex]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setSettings(history[nextIndex]);
  };

  const openImage = (file: File) => {
    const url = URL.createObjectURL(file);
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    imageUrlRef.current = url;
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setSettings(DEFAULT_STATE);
      setHistory([DEFAULT_STATE]);
      setHistoryIndex(0);
      setError('');
    };
    img.onerror = () => setError('Unable to decode this image.');
    img.src = url;
  };

  const exportImage = async () => {
    if (!engineRef.current || !image) return;
    try {
      setError('');
      engineRef.current.render(settings);
      const blob = await engineRef.current.exportPng();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'seed-edited.png';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to export the image.');
    }
  };

  return (
    <div className="mx-auto flex min-h-[650px] max-w-7xl flex-col gap-6 p-4 lg:flex-row">
      <section className="relative flex min-h-[520px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        {image ? (
          <canvas ref={canvasRef} className="max-h-[78vh] max-w-full object-contain shadow-2xl" aria-label="Seed preview" />
        ) : (
          <label className="cursor-pointer rounded-xl border-2 border-dashed border-zinc-800 p-12 text-center hover:border-zinc-600">
            <span className="mb-2 block text-zinc-300">اختر صورة للبدء في Seed</span>
            <span className="text-sm text-zinc-500">المعاينة تعمل عبر GPU عندما يدعم المتصفح WebGL</span>
            <input type="file" accept="image/*" className="hidden" onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) openImage(file);
            }} />
          </label>
        )}
        {isRendering && image && <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs text-zinc-300">Rendering…</span>}
      </section>

      <aside className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6 lg:w-96">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Seed</h1>
            <p className="text-xs text-zinc-500">Non-destructive GPU image editor</p>
          </div>
          <label className="cursor-pointer rounded-lg bg-zinc-800 px-3 py-2 text-xs text-white hover:bg-zinc-700">
            Replace
            <input type="file" accept="image/*" className="hidden" onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) openImage(file);
            }} />
          </label>
        </div>

        {(['brightness', 'contrast', 'saturation', 'warmth', 'ambiance', 'highlights', 'shadows'] as const).map((key) => (
          <label key={key} className="mb-5 block">
            <span className="mb-2 flex justify-between text-xs text-zinc-400">
              <span className="capitalize">{key}</span>
              <span>{settings[key]}</span>
            </span>
            <input aria-label={key} type="range" min="-100" max="100" value={settings[key]} onChange={(event) => updateSetting(key, Number(event.target.value))} className="w-full" />
          </label>
        ))}

        {error && <div role="alert" className="mb-4 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">{error}</div>}

        <div className="flex gap-2 border-t border-zinc-800 pt-4">
          <button type="button" onClick={undo} disabled={historyIndex === 0} className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white disabled:opacity-40">Undo</button>
          <button type="button" onClick={redo} disabled={historyIndex >= history.length - 1} className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white disabled:opacity-40">Redo</button>
          <button type="button" onClick={exportImage} disabled={!image} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Export PNG</button>
        </div>
      </aside>
    </div>
  );
}
