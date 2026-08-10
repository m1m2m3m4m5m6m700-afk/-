import {
  Upload,
  Image as ImageIcon,
  Download,
  RotateCcw,
  Sparkles,
  Loader2,
  Sliders,
  AlertCircle,
  Eye,
  Columns,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export function BackgroundRemover() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tolerance, setTolerance] = useState<number>(30);
  const [feather, setFeather] = useState<number>(2);
  const [viewMode, setViewMode] = useState<"side" | "result" | "original">("result");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [originalUrl, processedUrl]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    setError(null);
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setProcessedUrl(null);
    processBackgroundRemoval(url, tolerance, feather);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processBackgroundRemoval = useCallback(
    (srcUrl: string, currentTol: number, currentFeather: number) => {
      setLoading(true);
      setError(null);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) {
            setError("Unable to initialize canvas renderer.");
            setLoading(false);
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          const width = canvas.width;
          const height = canvas.height;

          const cornerIndices = [
            0,
            (width - 1) * 4,
            (height - 1) * width * 4,
            ((height - 1) * width + (width - 1)) * 4,
          ];

          let bgR = 0,
            bgG = 0,
            bgB = 0;
          cornerIndices.forEach((idx) => {
            bgR += data[idx];
            bgG += data[idx + 1];
            bgB += data[idx + 2];
          });
          bgR = Math.round(bgR / 4);
          bgG = Math.round(bgG / 4);
          bgB = Math.round(bgB / 4);

          const tolSq = (currentTol * 2.55) ** 2;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const diffR = r - bgR;
            const diffG = g - bgG;
            const diffB = b - bgB;
            const distSq = diffR * diffR + diffG * diffG + diffB * diffB;

            if (distSq <= tolSq) {
              const ratio = Math.sqrt(distSq) / (currentTol * 2.55);
              if (currentFeather > 0 && ratio > 0.7) {
                const alpha = Math.round(((ratio - 0.7) / 0.3) * 255);
                data[i + 3] = Math.min(data[i + 3], alpha);
              } else {
                data[i + 3] = 0;
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const resultUrl = URL.createObjectURL(blob);
              setProcessedUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return resultUrl;
              });
            } else {
              setError("Failed to export processed PNG.");
            }
            setLoading(false);
          }, "image/png");
        } catch (err) {
          console.error(err);
          setError("An unexpected error occurred during processing.");
          setLoading(false);
        }
      };

      img.onerror = () => {
        setError("Failed to load image for processing.");
        setLoading(false);
      };

      img.src = srcUrl;
    },
    [],
  );

  const handleReProcess = () => {
    if (originalUrl) {
      processBackgroundRemoval(originalUrl, tolerance, feather);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `no-bg-${imageFile?.name.replace(/\.[^/.]+$/, "") || "image"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="rounded-3xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur md:p-6">
      {!originalUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 min-h-72",
            isDragging
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-border/80 bg-background/50 hover:border-primary/50 hover:bg-card/90",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <Upload className="size-6" />
          </span>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            Drop your image here, or <span className="text-primary underline">browse</span>
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Supports PNG, JPG, or WebP (up to 20MB). Client-side private processing.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                View Mode:
              </span>
              <div className="flex rounded-xl border border-border bg-surface p-1">
                <button
                  type="button"
                  aria-pressed={viewMode === "result"}
                  aria-label="Show cutout result view"
                  onClick={() => setViewMode("result")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    viewMode === "result"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Sparkles className="size-3.5" />
                  Cutout
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === "side"}
                  aria-label="Show compare view"
                  onClick={() => setViewMode("side")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    viewMode === "side"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Columns className="size-3.5" />
                  Compare
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === "original"}
                  aria-label="Show original image view"
                  onClick={() => setViewMode("original")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    viewMode === "original"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Eye className="size-3.5" />
                  Original
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="rounded-xl text-xs"
              >
                <RotateCcw className="me-1.5 size-3.5" />
                Reset
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!processedUrl || loading}
                size="sm"
                className="rounded-xl shadow-xs text-xs"
              >
                <Download className="me-1.5 size-3.5" />
                Download PNG
              </Button>
            </div>
          </div>

          <div className="relative min-h-80 flex items-center justify-center rounded-2xl border border-border/80 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] p-4 overflow-hidden">
            {loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/70 backdrop-blur-xs">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="mt-2 text-xs font-medium text-foreground">
                  Removing background pixels...
                </p>
              </div>
            )}

            {viewMode === "side" ? (
              <div className="grid w-full gap-4 sm:grid-cols-2">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Original</span>
                  <div className="relative max-h-80 overflow-hidden rounded-xl border border-border bg-card p-1">
                    <img
                      src={originalUrl}
                      alt="Original"
                      className="max-h-72 object-contain rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-primary">Transparent Result</span>
                  <div className="relative max-h-80 overflow-hidden rounded-xl border border-border bg-card p-1">
                    {processedUrl ? (
                      <img
                        src={processedUrl}
                        alt="Cutout"
                        className="max-h-72 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="grid size-72 place-items-center text-xs text-muted-foreground">
                        Processing...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : viewMode === "original" ? (
              <img
                src={originalUrl}
                alt="Original"
                className="max-h-96 object-contain rounded-xl shadow-md"
              />
            ) : (
              processedUrl && (
                <img
                  src={processedUrl}
                  alt="Transparent Result"
                  className="max-h-96 object-contain rounded-xl shadow-md animate-rise"
                />
              )
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-surface/40 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="size-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Refine Removal Sensitivity
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">Color Tolerance</span>
                  <span className="font-mono text-foreground">{tolerance}%</span>
                </div>
                <Slider
                  value={[tolerance]}
                  min={5}
                  max={80}
                  step={1}
                  onValueChange={(val) => setTolerance(val[0])}
                  onValueCommit={() => handleReProcess()}
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">Edge Softness (Feather)</span>
                  <span className="font-mono text-foreground">{feather}px</span>
                </div>
                <Slider
                  value={[feather]}
                  min={0}
                  max={8}
                  step={1}
                  onValueChange={(val) => setFeather(val[0])}
                  onValueCommit={() => handleReProcess()}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
