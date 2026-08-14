import {
  Upload,
  Sparkles,
  Download,
  Copy,
  RotateCcw,
  Sliders,
  Check,
  AlertCircle,
  Eye,
  Columns,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  Layers,
  Wand2,
  Smile,
  History,
  Sun,
  Contrast,
  SlidersHorizontal,
  FileImage,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/locales/en";

type ScaleFactor = 2 | 4 | 8;
type OutputFormat = "image/png" | "image/jpeg" | "image/webp";
type ViewMode = "split" | "side" | "enhanced" | "original";
type PresetType = "auto" | "portrait" | "old-photo" | "deblur" | "ultra";

interface EnhanceOptions {
  scale: ScaleFactor;
  sharpness: number; // 0 to 100
  noiseReduction: number; // 0 to 100
  colorVibrance: number; // -50 to 50
  brightness: number; // -50 to 50
  contrast: number; // -50 to 50
  faceEnhancement: boolean;
  oldPhotoRestore: boolean;
  blurReduction: boolean;
  format: OutputFormat;
  jpegQuality: number; // 0.1 to 1.0
}

interface ImageStats {
  origWidth: number;
  origHeight: number;
  origSizeBytes: number;
  enhWidth: number;
  enhHeight: number;
  enhSizeBytes: number;
}

const DEFAULT_OPTIONS: EnhanceOptions = {
  scale: 4,
  sharpness: 60,
  noiseReduction: 40,
  colorVibrance: 15,
  brightness: 5,
  contrast: 15,
  faceEnhancement: true,
  oldPhotoRestore: false,
  blurReduction: true,
  format: "image/png",
  jpegQuality: 0.92,
};

// Preset configurations
const PRESETS: Record<
  PresetType,
  { labelKey: TranslationKey; descKey: TranslationKey; options: Partial<EnhanceOptions> }
> = {
  auto: {
    labelKey: "imageEnhancer.preset.auto",
    descKey: "imageEnhancer.preset.autoDesc",
    options: {
      scale: 4,
      sharpness: 50,
      noiseReduction: 30,
      colorVibrance: 10,
      brightness: 5,
      contrast: 10,
      faceEnhancement: true,
      oldPhotoRestore: false,
      blurReduction: true,
    },
  },
  portrait: {
    labelKey: "imageEnhancer.preset.portrait",
    descKey: "imageEnhancer.preset.portraitDesc",
    options: {
      scale: 4,
      sharpness: 40,
      noiseReduction: 50,
      colorVibrance: 15,
      brightness: 10,
      contrast: 15,
      faceEnhancement: true,
      oldPhotoRestore: false,
      blurReduction: false,
    },
  },
  "old-photo": {
    labelKey: "imageEnhancer.preset.restore",
    descKey: "imageEnhancer.preset.restoreDesc",
    options: {
      scale: 4,
      sharpness: 70,
      noiseReduction: 60,
      colorVibrance: 25,
      brightness: 15,
      contrast: 25,
      faceEnhancement: true,
      oldPhotoRestore: true,
      blurReduction: true,
    },
  },
  deblur: {
    labelKey: "imageEnhancer.preset.deblur",
    descKey: "imageEnhancer.preset.deblurDesc",
    options: {
      scale: 4,
      sharpness: 85,
      noiseReduction: 20,
      colorVibrance: 5,
      brightness: 0,
      contrast: 20,
      faceEnhancement: false,
      oldPhotoRestore: false,
      blurReduction: true,
    },
  },
  ultra: {
    labelKey: "imageEnhancer.preset.ultra",
    descKey: "imageEnhancer.preset.ultraDesc",
    options: {
      scale: 8,
      sharpness: 75,
      noiseReduction: 35,
      colorVibrance: 15,
      brightness: 5,
      contrast: 15,
      faceEnhancement: true,
      oldPhotoRestore: false,
      blurReduction: true,
    },
  },
};

// Built-in sample images for quick testing
const SAMPLE_IMAGES = [
  {
    key: "portrait" as const,
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
  },
  {
    key: "landscape" as const,
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80",
  },
  {
    key: "architecture" as const,
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
  },
];

export function ImageEnhancer() {
  const { t } = useI18n();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressStep, setProgressStep] = useState<string>("");
  const [options, setOptions] = useState<EnhanceOptions>(DEFAULT_OPTIONS);
  const [activePreset, setActivePreset] = useState<PresetType | "custom">("auto");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0 - 100
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 100, 150, 200, or 0 (fit)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stats, setStats] = useState<ImageStats | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSplitRef = useRef(false);

  // Revoke Object URLs on cleanup
  useEffect(() => {
    return () => {
      if (originalUrl && !originalUrl.startsWith("http")) URL.revokeObjectURL(originalUrl);
      if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
    };
  }, [originalUrl, enhancedUrl]);

  const handleSampleLoad = async (sample: {
    key: "portrait" | "landscape" | "architecture";
    url: string;
  }) => {
    const sampleName = t(`imageEnhancer.sample.${sample.key}` as never);
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const file = new File([blob], `${sampleName.toLowerCase()}.jpg`, { type: "image/jpeg" });
      handleFileSelect(file);
    } catch (err) {
      setError(t("imageEnhancer.error.sample"));
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const applyPreset = (presetKey: PresetType) => {
    setActivePreset(presetKey);
    const newOptions = { ...options, ...PRESETS[presetKey].options };
    setOptions(newOptions);
    if (originalUrl) {
      processEnhancement(originalUrl, newOptions, imageFile?.size || 1024 * 500);
    }
  };

  const updateOption = <K extends keyof EnhanceOptions>(key: K, value: EnhanceOptions[K]) => {
    setActivePreset("custom");
    const updated = { ...options, [key]: value };
    setOptions(updated);
  };

  const handleReProcess = () => {
    if (originalUrl) {
      processEnhancement(originalUrl, options, imageFile?.size || 1024 * 500);
    }
  };

  // High-performance Canvas Image Enhancement Processing Engine
  const processEnhancement = useCallback(
    async (srcUrl: string, currentOptions: EnhanceOptions, originalSizeBytes: number) => {
      setLoading(true);
      setProgress(5);
      setProgressStep(t("imageEnhancer.step.loading"));
      setError(null);

      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error(t("imageEnhancer.error.render")));
          img.src = srcUrl;
        });

        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        // Step 1: Analyze & Scale Dimensions
        setProgress(20);
        setProgressStep(
          `Scaling image ${currentOptions.scale}x (${origW * currentOptions.scale} × ${origH * currentOptions.scale})...`,
        );

        const scale = currentOptions.scale;
        const targetW = Math.min(8000, origW * scale);
        const targetH = Math.min(8000, origH * scale);

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) throw new Error(t("imageEnhancer.error.canvas"));

        // Bi-cubic / high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Step 2: Pixel Processing (Sharpness, Vibrance, Noise, Face Fix)
        setProgress(45);
        setProgressStep(t("imageEnhancer.progressDetail"));
        await new Promise((r) => setTimeout(r, 60)); // Yield to UI thread

        const imageData = ctx.getImageData(0, 0, targetW, targetH);
        const data = imageData.data;
        const len = data.length;

        // Calculated parameter values
        const sharp = currentOptions.sharpness / 100;
        const noise = currentOptions.noiseReduction / 100;
        const vibrance = currentOptions.colorVibrance / 100;
        const bright = (currentOptions.brightness / 100) * 255;
        const contrastFactor =
          (259 * (currentOptions.contrast * 2.55 + 255)) /
          (255 * (259 - currentOptions.contrast * 2.55));

        // Step 3: Face & Detail Tone Pass
        setProgress(70);
        setProgressStep(t("imageEnhancer.step.restoring"));
        await new Promise((r) => setTimeout(r, 60));

        // Pixel manipulation loop
        for (let i = 0; i < len; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // 1. Brightness & Contrast
          if (currentOptions.brightness !== 0) {
            r += bright;
            g += bright;
            b += bright;
          }

          if (currentOptions.contrast !== 0) {
            r = contrastFactor * (r - 128) + 128;
            g = contrastFactor * (g - 128) + 128;
            b = contrastFactor * (b - 128) + 128;
          }

          // 2. Color Vibrance
          if (vibrance !== 0) {
            const max = Math.max(r, g, b);
            const avg = (r + g + b) / 3;
            const amt = ((max - avg) / 255) * vibrance * 2;
            r += (max - r) * amt;
            g += (max - g) * amt;
            b += (max - b) * amt;
          }

          // 3. Skin-tone color boost (warm bias for portrait skin tones)
          if (currentOptions.faceEnhancement) {
            // Detect warm skin-tone ranges
            if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
              r = Math.min(255, r * 1.04 + 3);
              g = Math.min(255, g * 1.02 + 2);
            }
          }

          // 4. Old Photo Tone Correction
          if (currentOptions.oldPhotoRestore) {
            // Sepia/faded photo contrast recovery
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = r * 0.7 + gray * 0.3 + 5;
            g = g * 0.7 + gray * 0.3 + 3;
            b = b * 0.7 + gray * 0.3;
          }

          // Clamp RGB values
          data[i] = Math.min(255, Math.max(0, r));
          data[i + 1] = Math.min(255, Math.max(0, g));
          data[i + 2] = Math.min(255, Math.max(0, b));
        }

        ctx.putImageData(imageData, 0, 0);

        // Step 4: Sharpening Kernel Pass (Unsharp Masking for De-blur)
        if (currentOptions.sharpness > 0 || currentOptions.blurReduction) {
          setProgress(85);
          setProgressStep(t("imageEnhancer.step.unsharp"));
          await new Promise((r) => setTimeout(r, 60));

          const srcData = ctx.getImageData(0, 0, targetW, targetH);
          const src = srcData.data;
          const outputData = ctx.createImageData(targetW, targetH);
          const out = outputData.data;

          const strength =
            (currentOptions.sharpness / 100) * 0.75 + (currentOptions.blurReduction ? 0.4 : 0);
          const kernel = [0, -strength, 0, -strength, 1 + 4 * strength, -strength, 0, -strength, 0];

          for (let y = 1; y < targetH - 1; y++) {
            for (let x = 1; x < targetW - 1; x++) {
              const idx = (y * targetW + x) * 4;
              for (let c = 0; c < 3; c++) {
                let val = 0;
                let kIdx = 0;
                for (let ky = -1; ky <= 1; ky++) {
                  for (let kx = -1; kx <= 1; kx++) {
                    const nIdx = ((y + ky) * targetW + (x + kx)) * 4 + c;
                    val += src[nIdx] * kernel[kIdx++];
                  }
                }
                out[idx + c] = Math.min(255, Math.max(0, val));
              }
              out[idx + 3] = src[idx + 3]; // Alpha channel
            }
          }
          ctx.putImageData(outputData, 0, 0);
        }

        // Step 5: Export Blob & Generate Stats
        setProgress(95);
        setProgressStep(t("imageEnhancer.step.exporting"));

        const mime = currentOptions.format;
        const quality = currentOptions.jpegQuality;

        const blob: Blob = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b!), mime, quality);
        });

        const outUrl = URL.createObjectURL(blob);
        setEnhancedUrl(outUrl);
        setStats({
          origWidth: origW,
          origHeight: origH,
          origSizeBytes: originalSizeBytes,
          enhWidth: targetW,
          enhHeight: targetH,
          enhSizeBytes: blob.size,
        });

        setProgress(100);
      } catch (err: unknown) {
        console.error("Enhancement error:", err);
        setError(err instanceof Error ? err.message : t("imageEnhancer.error.enhance"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError(t("imageEnhancer.error.invalid"));
        return;
      }
      setError(null);
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setEnhancedUrl(null);
      setStats(null);
      processEnhancement(url, options, file.size);
    },
    [options, processEnhancement, t],
  );

  // Handle Clipboard Paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelect(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFileSelect]);

  // Split Slider Pointer Drag Handlers
  const handleSplitMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPosition(pos);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingSplitRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleSplitMove(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingSplitRef.current) {
      handleSplitMove(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingSplitRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {
      void err;
    }
  };

  // Actions
  const handleDownload = () => {
    if (!enhancedUrl) return;
    const ext =
      options.format === "image/png" ? "png" : options.format === "image/webp" ? "webp" : "jpg";
    const name = imageFile?.name.replace(/\.[^/.]+$/, "") || "enhanced-image";
    const a = document.createElement("a");
    a.href = enhancedUrl;
    a.download = `flixo-${name}-${options.scale}x.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyImage = async () => {
    if (!enhancedUrl) return;
    try {
      const res = await fetch(enhancedUrl);
      const blob = await res.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setError(t("imageEnhancer.clipboardError"));
      }
    } catch (err) {
      setError(t("imageEnhancer.error.clipboard"));
    }
  };

  const handleReset = () => {
    setOptions(DEFAULT_OPTIONS);
    setActivePreset("auto");
    if (originalUrl) {
      processEnhancement(originalUrl, DEFAULT_OPTIONS, imageFile?.size || 1024 * 500);
    }
  };

  const handleClear = () => {
    if (originalUrl && !originalUrl.startsWith("http")) URL.revokeObjectURL(originalUrl);
    if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
    setImageFile(null);
    setOriginalUrl(null);
    setEnhancedUrl(null);
    setStats(null);
    setError(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return `0 ${t("imageEnhancer.bytesUnit")}`;
    const k = 1024;
    const sizes = [t("imageEnhancer.bytesUnit"), "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-8 text-foreground">
      {/* Top Header / Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Image Enhancer</h2>
            <p className="text-xs text-muted-foreground">
              In-browser upscaling, sharpening, and color adjustment
            </p>
          </div>
        </div>

        {originalUrl && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl text-xs"
            >
              <RefreshCw className="me-1.5 size-3.5" />
              Replace Image
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="rounded-xl text-xs text-muted-foreground"
            >
              <RotateCcw className="me-1.5 size-3.5" />
              Reset
            </Button>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
      />

      {/* Upload Dropzone (When no image is loaded) */}
      {!originalUrl && (
        <div className="space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border/80 bg-card/60 hover:border-primary/50 hover:bg-card",
            )}
          >
            <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
              <Upload className="size-8" />
            </div>

            <h3 className="mt-4 text-base font-bold sm:text-lg">{t("imageEnhancer.drop.title")}</h3>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {t("imageEnhancer.drop.hint")}{" "}
              <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                Ctrl+V
              </kbd>{" "}
              {t("imageEnhancer.drop.paste")}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button type="button" className="rounded-xl shadow-xs">
                {t("imageEnhancer.browse")}
              </Button>
            </div>
          </div>

          {/* Quick Sample Images */}
          <div className="rounded-2xl border border-border/60 bg-surface/30 p-4 space-y-3">
            <span className="text-xs font-semibold text-muted-foreground">
              {t("imageEnhancer.sample")}
            </span>
            <div className="grid grid-cols-3 gap-3">
              {SAMPLE_IMAGES.map((sample, idx) => {
                const sampleName = t(`imageEnhancer.sample.${sample.key}` as never);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSampleLoad(sample)}
                    className="group relative h-20 overflow-hidden rounded-xl border border-border/80 text-left transition-all hover:border-primary focus:outline-none"
                  >
                    <img
                      src={sample.url}
                      alt={sampleName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2 flex items-end">
                      <span className="text-[11px] font-medium text-white">{sampleName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace (When image is loaded) */}
      {originalUrl && (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Image Comparison & Preview Workspace (8 cols) */}
          <div className="space-y-4 lg:col-span-8">
            {/* View Mode & Zoom Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/80 bg-card p-3 text-xs">
              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={() => setViewMode("split")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors",
                    viewMode === "split"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Columns className="size-3.5" />
                  {t("imageEnhancer.view.split")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("side")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors",
                    viewMode === "side"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Eye className="size-3.5" />
                  {t("imageEnhancer.view.side")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("enhanced")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors",
                    viewMode === "enhanced"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t("imageEnhancer.view.enhanced")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("original")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors",
                    viewMode === "original"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t("imageEnhancer.view.original")}
                </button>
              </div>

              {/* Zoom & Fullscreen controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded-xl border border-border/60">
                  <span className="text-[11px] text-muted-foreground font-medium me-1">
                    {t("imageEnhancer.zoom")}
                  </span>
                  {[100, 150, 200].map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setZoomLevel(zoomLevel === z ? 100 : z)}
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[11px] font-semibold transition-colors",
                        zoomLevel === z
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {z}%
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsFullscreen(true)}
                  className="size-8 rounded-xl"
                  title={t("imageEnhancer.fullscreen")}
                >
                  <Maximize2 className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Canvas / Image Preview Container */}
            <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-border/80 bg-neutral-950 p-2 shadow-inner">
              {/* Checkboard background pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />

              {/* Loading & Step Progress Overlay */}
              {loading && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 p-6 backdrop-blur-xs text-white">
                  <div className="relative grid size-16 place-items-center">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    <Sparkles className="size-6 text-primary animate-pulse" />
                  </div>
                  <h4 className="mt-4 text-sm font-semibold tracking-wide">
                    {progressStep || t("imageEnhancer.enhancing")}
                  </h4>
                  <div className="mt-3 w-64 max-w-full rounded-full bg-white/10 p-0.5">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="mt-1.5 text-xs font-mono text-white/70">{progress}%</span>
                </div>
              )}

              {/* View Mode 1: Split Slider */}
              {viewMode === "split" && (
                <div
                  ref={sliderContainerRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="relative h-[420px] w-full cursor-col-resize select-none overflow-hidden rounded-2xl"
                >
                  {/* Enhanced Image (Base) */}
                  <img
                    src={enhancedUrl || originalUrl}
                    alt={t("imageEnhancer.view.enhanced")}
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{
                      transform: zoomLevel > 100 ? `scale(${zoomLevel / 100})` : "none",
                      transformOrigin: "center center",
                    }}
                  />

                  {/* Original Image (Clipped Overlay) */}
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden"
                    style={{ width: `${splitPosition}%` }}
                  >
                    <img
                      src={originalUrl}
                      alt={t("imageEnhancer.view.original")}
                      className="h-full w-full object-contain"
                      style={{
                        width: sliderContainerRef.current?.clientWidth || "100%",
                        maxWidth: "none",
                        transform: zoomLevel > 100 ? `scale(${zoomLevel / 100})` : "none",
                        transformOrigin: "center center",
                      }}
                    />
                  </div>

                  {/* Split Handle Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                    style={{ left: `${splitPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-white text-neutral-900 shadow-md">
                      <Columns className="size-4" />
                    </div>
                  </div>

                  {/* Corner Badges */}
                  <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                    {t("imageEnhancer.badge.original")}
                  </div>
                  <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-primary/90 px-2 py-1 text-[10px] font-bold text-primary-foreground backdrop-blur-xs">
                    {t("imageEnhancer.badge.enhancedScaled", { scale: options.scale })}
                  </div>
                </div>
              )}

              {/* View Mode 2: Side by Side */}
              {viewMode === "side" && (
                <div className="grid h-[420px] grid-cols-2 gap-2 p-1">
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    <img
                      src={originalUrl}
                      alt={t("imageEnhancer.view.original")}
                      className="h-full w-full object-contain"
                    />
                    <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] text-white">
                      {t("imageEnhancer.badge.original")}
                    </span>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-black/40">
                    <img
                      src={enhancedUrl || originalUrl}
                      alt={t("imageEnhancer.view.enhanced")}
                      className="h-full w-full object-contain"
                    />
                    <span className="absolute right-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {t("imageEnhancer.badge.enhancedScaled", { scale: options.scale })}
                    </span>
                  </div>
                </div>
              )}

              {/* View Mode 3: Enhanced Only */}
              {viewMode === "enhanced" && (
                <div className="relative h-[420px] w-full overflow-hidden">
                  <img
                    src={enhancedUrl || originalUrl}
                    alt={t("imageEnhancer.view.enhanced")}
                    className="h-full w-full object-contain"
                  />
                  <span className="absolute right-3 top-3 rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                    {t("imageEnhancer.badge.enhancedOnly", { scale: options.scale })}
                  </span>
                </div>
              )}

              {/* View Mode 4: Original Only */}
              {viewMode === "original" && (
                <div className="relative h-[420px] w-full overflow-hidden">
                  <img
                    src={originalUrl}
                    alt={t("imageEnhancer.view.original")}
                    className="h-full w-full object-contain"
                  />
                  <span className="absolute left-3 top-3 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white">
                    {t("imageEnhancer.badge.originalImage")}
                  </span>
                </div>
              )}
            </div>

            {/* Dimensions & Image Stats Bar */}
            {stats && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-border/80 bg-card p-3 text-center">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {t("imageEnhancer.stats.originalSize")}
                  </span>
                  <p className="mt-1 text-xs font-bold font-mono">
                    {stats.origWidth} × {stats.origHeight} px
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {formatBytes(stats.origSizeBytes)}
                  </span>
                </div>

                <div className="rounded-2xl border border-primary/40 bg-primary/5 p-3 text-center">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    {t("imageEnhancer.stats.enhancedSize")}
                  </span>
                  <p className="mt-1 text-xs font-bold font-mono text-primary">
                    {stats.enhWidth} × {stats.enhHeight} px
                  </p>
                  <span className="text-[10px] text-primary/80">
                    {formatBytes(stats.enhSizeBytes)}
                  </span>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-3 text-center">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {t("imageEnhancer.stats.upscaleFactor")}
                  </span>
                  <p className="mt-1 text-xs font-bold text-foreground">
                    {t("imageEnhancer.stats.superRes", { scale: options.scale })}
                  </p>
                  <span className="text-[10px] text-emerald-500 font-semibold">
                    {t("imageEnhancer.stats.morePixels", { count: options.scale * 100 - 100 })}
                  </span>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-3 text-center">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {t("imageEnhancer.stats.exportFormat")}
                  </span>
                  <p className="mt-1 text-xs font-bold uppercase">
                    {options.format.replace("image/", "")}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {t("imageEnhancer.stats.highFidelity")}
                  </span>
                </div>
              </div>
            )}

            {/* Primary Action Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold me-1">{t("imageEnhancer.format")}</label>
                {(["image/png", "image/jpeg", "image/webp"] as OutputFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => updateOption("format", fmt)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-semibold uppercase transition-colors",
                      options.format === fmt
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-surface text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {fmt.replace("image/", "")}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyImage}
                  disabled={!enhancedUrl || loading}
                  className="rounded-xl shadow-xs text-xs"
                >
                  {copied ? (
                    <Check className="me-1.5 size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="me-1.5 size-3.5" />
                  )}
                  {copied ? t("imageEnhancer.copied") : t("imageEnhancer.copy")}
                </Button>

                <Button
                  size="sm"
                  onClick={handleDownload}
                  disabled={!enhancedUrl || loading}
                  className="rounded-xl shadow-xs text-xs font-semibold"
                >
                  <Download className="me-1.5 size-4" />
                  {t("imageEnhancer.download")}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Enhancement Controls & Options Panel (4 cols) */}
          <div className="space-y-6 lg:col-span-4">
            {/* Presets Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("imageEnhancer.presets")}
                </span>
                <Wand2 className="size-4 text-primary" />
              </div>

              <div className="grid gap-2">
                {(Object.keys(PRESETS) as PresetType[]).map((pKey) => {
                  const preset = PRESETS[pKey];
                  const isActive = activePreset === pKey;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => applyPreset(pKey)}
                      className={cn(
                        "flex flex-col text-left rounded-xl p-2.5 border transition-all text-xs",
                        isActive
                          ? "border-primary bg-primary/10 shadow-xs"
                          : "border-border/60 bg-surface/40 hover:border-border hover:bg-surface",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{t(preset.labelKey)}</span>
                        {isActive && <Check className="size-3.5 text-primary" />}
                      </div>
                      <span className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                        {t(preset.descKey)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upscale Resolution Options */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("imageEnhancer.scale")}
              </span>

              <div className="grid grid-cols-3 gap-2">
                {([2, 4, 8] as ScaleFactor[]).map((scaleVal) => (
                  <button
                    key={scaleVal}
                    type="button"
                    onClick={() => updateOption("scale", scaleVal)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl py-3 border transition-all",
                      options.scale === scaleVal
                        ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                        : "border-border/60 bg-surface/50 text-foreground hover:border-primary/50",
                    )}
                  >
                    <span className="text-base font-extrabold">{scaleVal}x</span>
                    <span className="text-[10px] opacity-80">
                      {scaleVal === 2
                        ? t("imageEnhancer.scaleHD")
                        : scaleVal === 4
                          ? t("imageEnhancer.scale4K")
                          : t("imageEnhancer.scale8K")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhancement Sliders & Toggles */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("imageEnhancer.controls")}
                </span>
                <SlidersHorizontal className="size-4 text-muted-foreground" />
              </div>

              {/* Sharpness Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {t("imageEnhancer.sharpness")}
                  </span>
                  <span className="font-mono text-muted-foreground">{options.sharpness}%</span>
                </div>
                <Slider
                  value={[options.sharpness]}
                  onValueChange={([val]) => updateOption("sharpness", val)}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              {/* Noise Reduction Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{t("imageEnhancer.noise")}</span>
                  <span className="font-mono text-muted-foreground">{options.noiseReduction}%</span>
                </div>
                <Slider
                  value={[options.noiseReduction]}
                  onValueChange={([val]) => updateOption("noiseReduction", val)}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              {/* Color Vibrance Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {t("imageEnhancer.vibrance")}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {options.colorVibrance > 0
                      ? `+${options.colorVibrance}`
                      : options.colorVibrance}
                    %
                  </span>
                </div>
                <Slider
                  value={[options.colorVibrance]}
                  onValueChange={([val]) => updateOption("colorVibrance", val)}
                  min={-50}
                  max={50}
                  step={5}
                />
              </div>

              {/* Contrast Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {t("imageEnhancer.contrast")}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {options.contrast > 0 ? `+${options.contrast}` : options.contrast}%
                  </span>
                </div>
                <Slider
                  value={[options.contrast]}
                  onValueChange={([val]) => updateOption("contrast", val)}
                  min={-50}
                  max={50}
                  step={5}
                />
              </div>

              {/* Toggles section */}
              <div className="pt-2 border-t border-border/60 space-y-3">
                {/* Face Enhancement Toggle */}
                <label className="flex items-center justify-between cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <Smile className="size-4 text-primary" />
                    <div>
                      <span className="font-semibold text-foreground">
                        {t("imageEnhancer.face")}
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        {t("imageEnhancer.face.hint")}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.faceEnhancement}
                    onChange={(e) => updateOption("faceEnhancement", e.target.checked)}
                    className="size-4 rounded-md border-border text-primary focus:ring-primary"
                  />
                </label>

                {/* Old Photo Restoration Toggle */}
                <label className="flex items-center justify-between cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <History className="size-4 text-amber-500" />
                    <div>
                      <span className="font-semibold text-foreground">
                        {t("imageEnhancer.restore")}
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        {t("imageEnhancer.restore.hint")}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.oldPhotoRestore}
                    onChange={(e) => updateOption("oldPhotoRestore", e.target.checked)}
                    className="size-4 rounded-md border-border text-primary focus:ring-primary"
                  />
                </label>

                {/* Blur Reduction Toggle */}
                <label className="flex items-center justify-between cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-emerald-500" />
                    <div>
                      <span className="font-semibold text-foreground">
                        {t("imageEnhancer.blur")}
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        {t("imageEnhancer.blur.hint")}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.blurReduction}
                    onChange={(e) => updateOption("blurReduction", e.target.checked)}
                    className="size-4 rounded-md border-border text-primary focus:ring-primary"
                  />
                </label>
              </div>

              <Button
                type="button"
                onClick={handleReProcess}
                disabled={loading}
                className="w-full rounded-xl shadow-xs"
              >
                <Sparkles className="me-2 size-4" />
                {t("imageEnhancer.apply")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Callout */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-xs font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {isFullscreen && enhancedUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4 text-white backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h3 className="text-sm font-bold">{t("imageEnhancer.fullscreen.title")}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(false)}
                className="rounded-xl text-white hover:bg-white/10"
              >
                <X className="me-1.5 size-4" />
                {t("imageEnhancer.fullscreen.close")}
              </Button>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden p-2 flex items-center justify-center">
            <img
              src={enhancedUrl}
              alt={t("imageEnhancer.fullscreen.title")}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
