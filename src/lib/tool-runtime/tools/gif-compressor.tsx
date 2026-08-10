import { useState } from "react";
import { FileImage, Download, RefreshCw, Upload, ShieldCheck, AlertCircle } from "lucide-react";
import {
  assertFileValid,
  downloadBlob,
  formatBytes,
  friendlyError,
  getGifEncoder,
  readFileAsArrayBuffer,
} from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function GifCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; size: number; saved: number } | null>(null);
  const [quality, setQuality] = useState<"high" | "medium" | "low">("medium");

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError("");
    setResult(null);
    try {
      assertFileValid(file, { kind: "GIF", maxBytes: 50 * 1024 * 1024 });
      const { GIF, workerScript } = await getGifEncoder();
      const { parseGIF, decompressFrames } = await import("gifuct-js");
      const buffer = await readFileAsArrayBuffer(file);
      const gif = parseGIF(buffer);
      const frames = decompressFrames(gif, true);
      if (!frames.length) throw new Error("No frames found in GIF.");
      const width = gif.lsd.width,
        height = gif.lsd.height;
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        throw new Error("This GIF has invalid dimensions and could not be processed.");
      }
      const qualityVal = quality === "high" ? 1 : quality === "medium" ? 20 : 40;
      const encoder = new GIF({
        workers: 2,
        quality: qualityVal,
        width,
        height,
        workerScript,
        repeat: 0,
      });
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported.");
      const patchCanvas = document.createElement("canvas");
      patchCanvas.width = width;
      patchCanvas.height = height;
      const patchCtx = patchCanvas.getContext("2d");
      if (!patchCtx) throw new Error("Canvas not supported.");
      for (const frame of frames) {
        const imgData = new ImageData(
          new Uint8ClampedArray(frame.patch),
          frame.dims.width,
          frame.dims.height,
        );
        patchCtx.putImageData(imgData, frame.dims.left, frame.dims.top);
        ctx.drawImage(patchCanvas, 0, 0);
        encoder.addFrame(canvas, { delay: frame.delay || 100, copy: true });
      }
      const blob: Blob = await new Promise((resolve, reject) => {
        encoder.on("finished", resolve);
        encoder.on("abort", reject);
        encoder.render();
      });
      const outName = file.name.replace(/\.gif$/i, "") + "-compressed.gif";
      downloadBlob(blob, outName);
      const saved = file.size - blob.size;
      setResult({ name: outName, size: blob.size, saved });
    } catch (e) {
      setError(friendlyError(e, "Failed to compress GIF. Please upload a valid GIF file."));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-foreground">Upload GIF File</label>
          <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
            <input
              type="file"
              id="gif-comp-upload"
              accept="image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  setError("");
                  setResult(null);
                }
              }}
            />
            <label
              htmlFor="gif-comp-upload"
              className="cursor-pointer flex flex-col items-center gap-1"
            >
              <Upload className="size-6 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {file ? file.name : "Drop a GIF here, or click to browse"}
              </span>
              {file && (
                <span className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</span>
              )}
            </label>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Compression level</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as typeof quality)}
              className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm"
            >
              <option value="high">High (best quality)</option>
              <option value="medium">Medium (balanced)</option>
              <option value="low">Low (smallest size)</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Compressing...
              </>
            ) : (
              <>
                <FileImage className="size-4" />
                Compress GIF
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
                <FileImage className="size-8" />
                <span className="text-sm font-semibold">{result.name}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(result.size)}</span>
                <span className="text-xs">
                  {result.saved > 0
                    ? `Saved ${formatBytes(result.saved)} (${Math.round((result.saved / file!.size) * 100)}% smaller)`
                    : "Re-encoded"}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileImage className="size-8 opacity-40" />
                <span>Your compressed GIF will download here.</span>
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

export const GifCompressorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "gif-compressor",
  slug: "gif-compressor",
  categoryId: "images",
  icon: FileImage,
  component: GifCompressorTool,
  layoutDescription:
    "Re-encode animated GIFs with reduced color palette for a smaller file size, entirely in your browser.",
  layoutDescriptionKey: "tool.gif-compressor.pageDescription",
};
