import { useEffect, useRef, useState } from "react";
import {
  ScanLine,
  Upload,
  Camera,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { revokeObjectUrlSafe } from "@/lib/objectUrls";
import type { ReadyToolRuntimeDefinition } from "../types";

interface DecodeResult {
  text: string;
  format: string;
}

async function decodeImage(source: Blob, label = "image"): Promise<DecodeResult> {
  const Bitmap = (window as unknown as { BarcodeDetector?: unknown }).BarcodeDetector
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (window as any).BarcodeDetector({
        formats: ["qr_code", "code_128", "ean_13", "ean_8", "upc_a", "upc_e"],
      })
    : null;

  if (Bitmap) {
    try {
      const buffer = await createImageBitmap(source);
      const codes = await Bitmap.detect(buffer);
      if (codes.length > 0) {
        return { text: codes[0].rawValue, format: codes[0].format };
      }
      buffer.close();
    } catch {
      /* fall through to error */
    }
  }

  throw new Error(
    `No QR decoder available in this browser. Try Chrome or Edge on desktop, or upload a clearer ${label}.`,
  );
}

function QrReaderTool() {
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [usingCamera, setUsingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setUsingCamera(false);
  };

  // Revoke any object URL preview when the component unmounts.
  useEffect(() => {
    return () => {
      revokeObjectUrlSafe(preview ?? undefined);
    };
  }, [preview]);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(file));
    try {
      const decoded = await decodeImage(file, file.name);
      setResult(decoded);
    } catch (err) {
      setError((err as Error).message || "Could not read a QR code from this image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartCamera = async () => {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setUsingCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setError(
        (err as Error).message || "Camera access denied or unavailable. Upload an image instead.",
      );
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPreview(canvas.toDataURL("image/png"));
    setIsProcessing(true);
    setError(null);
    setResult(null);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsProcessing(false);
        return;
      }
      try {
        const decoded = await decodeImage(blob, "frame");
        setResult(decoded);
      } catch (err) {
        setError((err as Error).message || "No QR code detected in this frame.");
      } finally {
        setIsProcessing(false);
      }
    }, "image/png");
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    stopCamera();
    setResult(null);
    setError(null);
    setPreview(null);
    setCopied(false);
  };

  const supportsBarcodeDetector = typeof window !== "undefined" && "BarcodeDetector" in window;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-border p-4 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer flex flex-col items-center gap-2 w-full"
            >
              <Upload className="size-7 text-primary" />
              <span className="text-sm font-semibold text-foreground">Upload QR image</span>
              <span className="text-[11px] text-muted-foreground">
                PNG, JPG, or WebP with a QR code
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {usingCamera ? (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-border bg-black aspect-video">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={isProcessing}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <Camera className="size-3.5" />
                  )}
                  {isProcessing ? "Scanning..." : "Capture & Scan"}
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Stop
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartCamera}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Camera className="size-4" />
              Use camera
            </button>
          )}

          {preview && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Scanned image:</span>
              <img
                src={preview}
                alt="QR code being scanned"
                className="w-full max-h-40 object-contain rounded-xl border border-border bg-background"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Decoded Result</span>
            {result && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          {error ? (
            <div className="flex items-start gap-2.5 text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-xs">Scan Failed</div>
                <div className="text-[11px] opacity-90 mt-0.5">{error}</div>
              </div>
            </div>
          ) : null}

          {result ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <ScanLine className="size-4" />
                  <span className="text-xs font-semibold uppercase">{result.format}</span>
                </div>
                <p className="text-sm text-foreground break-all font-mono">{result.text}</p>
              </div>
              {/^https?:\/\//i.test(result.text) && (
                <a
                  href={result.text}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  Open link →
                </a>
              )}
            </div>
          ) : (
            !error && (
              <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2 rounded-2xl border border-border bg-background/50">
                <ScanLine className="size-8 opacity-40" />
                <span>Decoded text will appear here.</span>
              </div>
            )
          )}

          {(result || error || preview) && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
          )}

          {!supportsBarcodeDetector && (
            <p className="text-[11px] text-muted-foreground">
              Tip: live camera scanning works best in Chrome or Edge. You can still upload an image.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export const QrReaderRuntime: ReadyToolRuntimeDefinition = {
  toolId: "qr-reader",
  slug: "qr-reader",
  categoryId: "utilities",
  icon: ScanLine,
  component: QrReaderTool,
  layoutDescription:
    "Scan and decode QR codes from uploaded images or your camera into plain text or links.",
};
