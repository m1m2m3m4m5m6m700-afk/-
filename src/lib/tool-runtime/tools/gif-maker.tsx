import { useState } from "react";
import { Film, Download, RefreshCw, Upload, ShieldCheck, AlertCircle, X, Plus } from "lucide-react";
import { downloadBlob, friendlyError, getGifEncoder, formatBytes } from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function GifMakerTool() {
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);
  const [delay, setDelay] = useState(500);
  const [width, setWidth] = useState(480);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ size: number } | null>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setImages((cur) => [...cur, ...next]);
    setError("");
    setResult(null);
  };

  const removeImage = (i: number) => {
    setImages((cur) => {
      URL.revokeObjectURL(cur[i].url);
      return cur.filter((_, idx) => idx !== i);
    });
  };

  const handleProcess = async () => {
    if (images.length < 2) {
      setError("Add at least 2 images to create an animated GIF.");
      return;
    }
    setIsProcessing(true);
    setError("");
    setResult(null);
    try {
      const { GIF, workerScript } = await getGifEncoder();
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height: width,
        workerScript,
        repeat: 0,
      });
      for (const { url } of images) {
        const img = await loadImage(url);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = width;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, width);
        const scale = Math.min(width / img.width, width / img.height);
        const w = img.width * scale,
          h = img.height * scale;
        ctx.drawImage(img, (width - w) / 2, (width - h) / 2, w, h);
        gif.addFrame(canvas, { delay, copy: true });
      }
      const blob: Blob = await new Promise((resolve, reject) => {
        gif.on("finished", resolve);
        gif.on("abort", reject);
        gif.render();
      });
      const outName = "animation.gif";
      downloadBlob(blob, outName);
      setResult({ size: blob.size });
    } catch (e) {
      setError(friendlyError(e, "Failed to create GIF. Please check that all images are valid."));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-foreground">
            Add Images (2 or more)
          </label>
          <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
            <input
              type="file"
              id="gif-maker-upload"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            <label
              htmlFor="gif-maker-upload"
              className="cursor-pointer flex flex-col items-center gap-1"
            >
              <Upload className="size-6 text-primary" />
              <span className="text-xs font-semibold text-foreground">Click to add images</span>
              <span className="text-[11px] text-muted-foreground">{images.length} selected</span>
            </label>
          </div>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((im, i) => (
                <div key={i} className="relative">
                  <img
                    src={im.url}
                    alt=""
                    className="size-16 object-cover rounded-lg border border-border"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 rounded-full bg-destructive text-white p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Frame delay: {delay}ms</label>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Size (px)</label>
              <select
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm"
              >
                <option value={320}>320</option>
                <option value={480}>480</option>
                <option value={640}>640</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={handleProcess}
            disabled={images.length < 2 || isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Rendering...
              </>
            ) : (
              <>
                <Film className="size-4" />
                Create GIF
              </>
            )}
          </button>
        </div>
        <div className="space-y-4 flex flex-col justify-between">
          <div className="h-full rounded-2xl border border-border bg-background/50 p-4 text-sm flex flex-col items-center justify-center text-center gap-3">
            {error ? (
              <div className="flex flex-col items-center gap-2 text-destructive">
                <AlertCircle className="size-8" />
                <span className="text-xs">{error}</span>
              </div>
            ) : result ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600">
                <Film className="size-8" />
                <span className="text-sm font-semibold">animation.gif</span>
                <span className="text-xs text-muted-foreground">{formatBytes(result.size)}</span>
                <span className="text-xs">Downloaded successfully</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Film className="size-8 opacity-40" />
                <span>Your animated GIF will download here.</span>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/10 p-3.5 flex items-center gap-3">
            <ShieldCheck className="size-5 text-emerald-500 shrink-0" />
            <p className="text-xs text-muted-foreground">
              100% Client-side processing. Your files and data remain strictly on your local device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

export const GifMakerRuntime: ReadyToolRuntimeDefinition = {
  toolId: "gif-maker",
  slug: "gif-maker",
  categoryId: "images",
  icon: Film,
  component: GifMakerTool,
  layoutDescription:
    "Combine multiple images into an animated GIF with custom frame delay, entirely in your browser.",
  layoutDescriptionKey: "tool.gif-maker.pageDescription",
};
