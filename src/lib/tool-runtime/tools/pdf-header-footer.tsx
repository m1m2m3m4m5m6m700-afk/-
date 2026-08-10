import { useState } from "react";
import {
  PanelTop,
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

function PdfHeaderFooterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; size: number } | null>(null);
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [fontSize, setFontSize] = useState(10);

  const handleProcess = async () => {
    if (!file) return;
    if (!headerText.trim() && !footerText.trim()) {
      setError("Please enter header text, footer text, or both.");
      return;
    }
    setIsProcessing(true);
    setError("");
    setResult(null);
    try {
      assertFileValid(file, { kind: "PDF", maxBytes: 100 * 1024 * 1024 });
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      for (const page of pdf.getPages()) {
        const { width, height } = page.getSize();
        const margin = 14;
        if (headerText.trim()) {
          const tw = font.widthOfTextAtSize(headerText, fontSize);
          page.drawText(headerText, {
            x: width / 2 - tw / 2,
            y: height - margin - fontSize,
            size: fontSize,
            font,
            color: rgb(0.25, 0.25, 0.25),
          });
        }
        if (footerText.trim()) {
          const tw = font.widthOfTextAtSize(footerText, fontSize);
          page.drawText(footerText, {
            x: width / 2 - tw / 2,
            y: margin,
            size: fontSize,
            font,
            color: rgb(0.25, 0.25, 0.25),
          });
        }
      }
      const outBytes = await pdf.save();
      const outName = file.name.replace(/\.pdf$/i, "") + "-stamped.pdf";
      downloadBlob(new Uint8Array(outBytes), outName, "application/pdf");
      setResult({ name: outName, size: outBytes.length });
    } catch (e) {
      setError(friendlyError(e, "Failed to add header/footer. Please upload a valid PDF."));
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
              id="pdf-hf-upload"
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
              htmlFor="pdf-hf-upload"
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
              <label className="text-xs text-muted-foreground">Header text (top, centered)</label>
              <input
                type="text"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder="e.g. Confidential"
                className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Footer text (bottom, centered)
              </label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="e.g. Page footer"
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
                onChange={(e) => setFontSize(Number(e.target.value) || 10)}
                className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm"
              />
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
                Adding header/footer...
              </>
            ) : (
              <>
                <PanelTop className="size-4" />
                Add Header &amp; Footer
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
                <span>Your stamped PDF will download here.</span>
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

export const PdfHeaderFooterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "pdf-header-footer",
  slug: "pdf-header-footer",
  categoryId: "pdf",
  icon: PanelTop,
  component: PdfHeaderFooterTool,
  layoutDescription:
    "Add custom headers and footers to PDF pages, processed locally in your browser.",
  layoutDescriptionKey: "tool.pdf-header-footer.pageDescription",
};
