import { useEffect, useRef, useState } from "react";
import { Images, Download, RefreshCw, Upload, ShieldCheck, AlertCircle } from "lucide-react";
import { downloadBlob, friendlyError, getGifEncoder } from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function ImageToGifTool() {
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);
  const imagesRef = useRef(images);
  const [delay, setDelay] = useState(300);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ size: number } | null>(null);

  // Keep the ref in sync with the latest image list (for unmount cleanup) and
  // revoke all object URLs when the component unmounts so the blob URLs created
  // for previewing source images are freed (no memory leak across tool visits).
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((entry) => URL.revokeObjectURL(entry.url));
    };
  }, []);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setImages((cur) => [...cur, ...next]);
    setError("");
    setResult(null);
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
      const size = 480;
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: size,
        height: size,
        workerScript,
        repeat: 0,
      });
      for (const { url } of images) {
        const img = await new Promise<HTMLImageElement>((res, rej) => {
          const i = new Image();
          i.onload = () => res(i);
          i.onerror = () => rej(new Error("Image load failed"));
          i.src = url;
        });
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        const scale = Math.min(size / img.width, size / img.height);
        const w = img.width * scale,
          h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        gif.addFrame(canvas, { delay, copy: true });
      }
      const blob: Blob = await new Promise((resolve, reject) => {
        gif.on("finished", resolve);
        gif.on("abort", reject);
        gif.render();
      });
      downloadBlob(blob, "image-to-gif.gif");
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
              id="img2gif-upload"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            <label
              htmlFor="img2gif-upload"
              className="cursor-pointer flex flex-col items-center gap-1"
            >
              <Upload className="size-6 text-primary" />
              <span className="text-xs font-semibold text-foreground">Click to add images</span>
              <span className="text-[11px] text-muted-foreground">{images.length} selected</span>
            </label>
          </div>
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
                <Images className="size-4" />
                Convert to GIF
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
                <Images className="size-8" />
                <span className="text-sm font-semibold">image-to-gif.gif</span>
                <span className="text-xs text-muted-foreground">
                  {result.size.toLocaleString()} bytes
                </span>
                <span className="text-xs">Downloaded successfully</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Images className="size-8 opacity-40" />
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

export const ImageToGifRuntime: ReadyToolRuntimeDefinition = {
  toolId: "image-to-gif",
  slug: "image-to-gif",
  categoryId: "images",
  icon: Images,
  component: ImageToGifTool,
  layoutDescription:
    "Turn a sequence of images into an animated GIF with custom frame timing, entirely in your browser.",
  layoutDescriptionKey: "tool.image-to-gif.pageDescription",
};
