import {
  Upload,
  FileImage,
  Download,
  RotateCcw,
  Sliders,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { trackDownloadAction } from "@/lib/analytics";

function formatBytes(bytes: number, bytesUnit: string, decimals = 2) {
  if (bytes === 0) return `0 ${bytesUnit}`;
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [bytesUnit, "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function ImageCompressor() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [format, setFormat] = useState<"jpeg" | "webp" | "png">("jpeg");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [originalUrl, compressedUrl]);

  const compressImage = useCallback(
    (srcUrl: string, targetQuality: number, targetFormat: "jpeg" | "webp" | "png") => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          // Fill white background for JPEG/transparent sources
          if (targetFormat === "jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);

          const mimeType = `image/${targetFormat}`;
          canvas.toBlob(
            (blob) => {
              if (blob) {
                setCompressedBlob(blob);
                const url = URL.createObjectURL(blob);
                setCompressedUrl((prev) => {
                  if (prev) URL.revokeObjectURL(prev);
                  return url;
                });
              }
            },
            mimeType,
            targetQuality / 100,
          );
        } catch (err) {
          console.error(err);
          setError(t("imageCompressor.error.compress"));
        }
      };
      img.onerror = () => setError(t("imageCompressor.error.render"));
      img.src = srcUrl;
    },
    [t],
  );

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError(t("imageCompressor.error.invalid"));
      return;
    }
    setError(null);
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);

    let defaultFmt: "jpeg" | "webp" | "png" = "jpeg";
    if (selectedFile.type.includes("png")) defaultFmt = "png";
    else if (selectedFile.type.includes("webp")) defaultFmt = "webp";
    setFormat(defaultFmt);

    compressImage(url, quality, defaultFmt);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    if (originalUrl) {
      compressImage(originalUrl, newQuality, format);
    }
  };

  const handleFormatChange = (newFormat: "jpeg" | "webp" | "png") => {
    setFormat(newFormat);
    if (originalUrl) {
      compressImage(originalUrl, quality, newFormat);
    }
  };

  const handleReset = () => {
    setFile(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setOriginalUrl(null);
    setCompressedUrl(null);
    setCompressedBlob(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = () => {
    if (!compressedUrl || !file) return;
    const ext = format === "jpeg" ? "jpg" : format;
    const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const fileName = `${baseName}-compressed.${ext}`;
    trackDownloadAction(fileName, ext, "image-compressor");
    const a = document.createElement("a");
    a.href = compressedUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const savedPercentage =
    file && compressedBlob
      ? Math.max(0, Math.round(((file.size - compressedBlob.size) / file.size) * 100))
      : 0;

  return (
    <div className="rounded-3xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur md:p-6">
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
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
            {t("imageCompressor.drop.title")}{" "}
            <span className="text-primary underline">{t("imageCompressor.drop.browse")}</span>
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground">{t("imageCompressor.drop.hint")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Stats Bar */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-surface/60 p-3.5 text-center">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("imageCompressor.originalSize")}
              </span>
              <p className="mt-1 font-mono text-lg font-bold text-foreground">
                {formatBytes(file.size, t("imageCompressor.bytesUnit"))}
              </p>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3.5 text-center">
              <span className="text-[11px] font-medium uppercase tracking-wider text-primary">
                {t("imageCompressor.compressedSize")}
              </span>
              <p className="mt-1 font-mono text-lg font-bold text-primary">
                {compressedBlob
                  ? formatBytes(compressedBlob.size, t("imageCompressor.bytesUnit"))
                  : t("imageCompressor.calculating")}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-surface/60 p-3.5 text-center">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("imageCompressor.savedRatio")}
              </span>
              <p className="mt-1 font-mono text-lg font-bold text-emerald-500">
                {savedPercentage > 0 ? `-${savedPercentage}%` : "0%"}
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="rounded-2xl border border-border/60 bg-surface/40 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sliders className="size-3.5 text-primary" />
                    {t("imageCompressor.quality", { count: quality })}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {quality > 85
                      ? t("imageCompressor.qualityHigh")
                      : quality > 50
                        ? t("imageCompressor.qualityBalanced")
                        : t("imageCompressor.qualityMax")}
                  </span>
                </div>
                <Slider
                  value={[quality]}
                  min={5}
                  max={95}
                  step={1}
                  onValueChange={(val) => handleQualityChange(val[0])}
                />
              </div>

              <div className="w-full sm:w-44">
                <span className="text-xs font-semibold text-foreground block mb-1.5">
                  {t("imageCompressor.format")}
                </span>
                <Select
                  value={format}
                  onValueChange={(val: "jpeg" | "webp" | "png") => handleFormatChange(val)}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG (.jpg)</SelectItem>
                    <SelectItem value="webp">WebP (.webp)</SelectItem>
                    <SelectItem value="png">PNG (.png)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preview Image Box */}
          <div className="relative min-h-72 flex flex-col items-center justify-center rounded-2xl border border-border bg-background/50 p-4">
            {compressedUrl && (
              <img
                src={compressedUrl}
                alt={t("imageCompressor.compressedPreview")}
                className="max-h-80 object-contain rounded-xl shadow-md animate-rise"
              />
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="rounded-xl text-xs"
            >
              <RotateCcw className="me-1.5 size-3.5" />
              {t("imageCompressor.compressAnother")}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!compressedUrl}
              size="sm"
              className="rounded-xl shadow-xs text-xs"
            >
              <Download className="me-1.5 size-3.5" />
              {t("imageCompressor.download")}
            </Button>
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
