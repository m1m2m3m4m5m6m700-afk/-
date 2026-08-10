import { useState } from "react";
import {
  Hash,
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

function PdfPageNumbersTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; size: number } | null>(null);
  const [position, setPosition] = useState<
    "bottom-center" | "bottom-right" | "top-center" | "top-right"
  >("bottom-center");
  const [startAt, setStartAt] = useState(1);
  const [fontSize, setFontSize] = useState(12);

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError("");
    setResult(null);
    try {
      assertFileValid(file, { kind: "PDF", maxBytes: 100 * 1024 * 1024 });
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const total = pages.length;
      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const text = `${startAt + i} / ${startAt + total - 1}`;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const margin = 18;
        let x: number, y: number;
        if (position === "bottom-center") {
          x = width / 2 - textWidth / 2;
          y = margin;
        } else if (position === "bottom-right") {
          x = width - textWidth - margin;
          y = margin;
        } else if (position === "top-center") {
          x = width / 2 - textWidth / 2;
          y = height - margin - fontSize;
        } else {
          x = width - textWidth - margin;
          y = height - margin - fontSize;
        }
        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
      });
      const outBytes = await pdf.save();
      const outName = file.name.replace(/\.pdf$/i, "") + "-numbered.pdf";
      downloadBlob(new Uint8Array(outBytes), outName, "application/pdf");
      setResult({ name: outName, size: outBytes.length });
    } catch (e) {
      setError(friendlyError(e, "Failed to add page numbers. Please upload a valid PDF."));
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
              id="pdf-num-upload"
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
              htmlFor="pdf-num-upload"
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
            <div>
              <label className="text-xs text-muted-foreground">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as typeof position)}
                className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm"
              >
                <option value="bottom-center">Bottom center</option>
                <option value="bottom-right">Bottom right</option>
                <option value="top-center">Top center</option>
                <option value="top-right">Top right</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Start at</label>
                <input
                  type="number"
                  min={1}
                  value={startAt}
                  onChange={(e) => setStartAt(Number(e.target.value) || 1)}
                  className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Font size</label>
                <input
                  type="number"
                  min={6}
                  max={36}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value) || 12)}
                  className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm"
                />
              </div>
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
                Adding numbers...
              </>
            ) : (
              <>
                <Hash className="size-4" />
                Add Page Numbers
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
                <span>Your numbered PDF will download here.</span>
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

export const PdfPageNumbersRuntime: ReadyToolRuntimeDefinition = {
  toolId: "pdf-page-numbers",
  slug: "pdf-page-numbers",
  categoryId: "pdf",
  icon: Hash,
  component: PdfPageNumbersTool,
  layoutDescription:
    "Add page numbers to any PDF with position and styling options, entirely in your browser.",
  layoutDescriptionKey: "tool.pdf-page-numbers.pageDescription",
};
