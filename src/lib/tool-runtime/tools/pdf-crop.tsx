import { useState } from "react";
import {
  Crop,
  Download,
  RefreshCw,
  Upload,
  ShieldCheck,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  downloadBlob,
  formatBytes,
  assertFileValid,
  friendlyError,
  readFileAsArrayBuffer,
} from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function PdfCropTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; size: number } | null>(null);
  const [margins, setMargins] = useState({ top: 5, bottom: 5, left: 5, right: 5 });

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError("");
    setResult(null);
    try {
      assertFileValid(file, { kind: "PDF", maxBytes: 100 * 1024 * 1024 });
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdf.getPages();
      const totalRemoved = { w: 0, h: 0 };
      for (const page of pages) {
        const { width, height } = page.getSize();
        const cutL = (margins.left / 100) * width;
        const cutR = (margins.right / 100) * width;
        const cutT = (margins.top / 100) * height;
        const cutB = (margins.bottom / 100) * height;
        const newWidth = width - cutL - cutR;
        const newHeight = height - cutT - cutB;
        if (newWidth <= 0 || newHeight <= 0) {
          throw new Error("Margins too large — resulting page would have no content.");
        }
        page.setMediaBox(cutL, cutB, newWidth, newHeight);
        page.setCropBox(cutL, cutB, newWidth, newHeight);
        totalRemoved.w += cutL + cutR;
        totalRemoved.h += cutT + cutB;
      }
      const outBytes = await pdf.save();
      const outName = file.name.replace(/\.pdf$/i, "") + "-cropped.pdf";
      downloadBlob(new Uint8Array(outBytes), outName, "application/pdf");
      setResult({ name: outName, size: outBytes.length });
    } catch (e) {
      setError(friendlyError(e, "Failed to crop PDF. Please upload a valid PDF."));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-foreground">Upload PDF File</label>
          <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
            <input
              type="file"
              id="pdf-crop-upload"
              accept="application/pdf"
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
              htmlFor="pdf-crop-upload"
              className="cursor-pointer flex flex-col items-center gap-1"
            >
              <Upload className="size-6 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {file ? file.name : "Drop a PDF here, or click to browse"}
              </span>
              {file && (
                <span className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</span>
              )}
            </label>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              Crop Margins (% of page)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["top", "right", "bottom", "left"] as const).map((side) => (
                <div key={side}>
                  <span className="text-xs text-muted-foreground capitalize">{side}</span>
                  <input
                    type="range"
                    min={0}
                    max={45}
                    value={margins[side]}
                    onChange={(e) => setMargins((m) => ({ ...m, [side]: Number(e.target.value) }))}
                    className="w-full accent-primary"
                  />
                  <span className="text-xs font-mono text-foreground">{margins[side]}%</span>
                </div>
              ))}
            </div>
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
                Cropping...
              </>
            ) : (
              <>
                <Crop className="size-4" />
                Crop PDF
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
                <FileText className="size-8" />
                <span className="text-sm font-semibold">{result.name}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(result.size)}</span>
                <span className="text-xs">Downloaded successfully</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileText className="size-8 opacity-40" />
                <span>Your cropped PDF will download here.</span>
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

export const PdfCropRuntime: ReadyToolRuntimeDefinition = {
  toolId: "pdf-crop",
  slug: "pdf-crop",
  categoryId: "pdf",
  icon: Crop,
  component: PdfCropTool,
  layoutDescription: "PDF Crop runs entirely in your browser for fast, private processing.",
  layoutDescriptionKey: "tool.pdf-crop.pageDescription",
};
