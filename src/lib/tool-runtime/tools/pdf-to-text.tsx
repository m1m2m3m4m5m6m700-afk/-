import { useState } from "react";
import {
  ScanText,
  Download,
  RefreshCw,
  Upload,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import {
  assertFileValid,
  downloadBlob,
  formatBytes,
  friendlyError,
  getPdfjs,
  readFileAsArrayBuffer,
} from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function PdfToTextTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError("");
    setText("");
    setCopied(false);
    try {
      assertFileValid(file, { kind: "PDF", maxBytes: 100 * 1024 * 1024 });
      const pdfjs = await getPdfjs();
      const data = await readFileAsArrayBuffer(file);
      const pdf = await pdfjs.getDocument({ data }).promise;
      setPageCount(pdf.numPages);
      const parts: string[] = [];
      let totalItems = 0;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const textItems = content.items.filter((item) => "str" in item) as { str: string }[];
        totalItems += textItems.length;
        const pageText = textItems
          .map((item) => item.str)
          .join(" ")
          .replace(/[ \t]+/g, " ");
        parts.push(`--- Page ${i} ---\n${pageText.trim()}`);
      }
      const out = parts.join("\n\n");
      if (totalItems === 0) {
        setError(
          "No text layer found. This PDF appears to be scanned or image-based. Text extraction requires OCR (optical character recognition), which is not available in a browser-based tool.",
        );
      } else {
        setText(out);
      }
    } catch (e) {
      setError(
        friendlyError(
          e,
          "Failed to extract text. The PDF may be scanned (image-based) or protected.",
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!text) return;
    const outName = file ? file.name.replace(/\.pdf$/i, "") + ".txt" : "extracted-text.txt";
    downloadBlob(text, outName, "text/plain;charset=utf-8");
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-foreground">Upload PDF File</label>
          <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
            <input
              type="file"
              id="pdf-text-upload"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  setError("");
                  setText("");
                }
              }}
            />
            <label
              htmlFor="pdf-text-upload"
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
          <button
            type="button"
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Extracting text...
              </>
            ) : (
              <>
                <ScanText className="size-4" />
                Extract Text
              </>
            )}
          </button>
          {pageCount > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Processed {pageCount} page{pageCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="space-y-4 flex flex-col justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Extracted Text</span>
              {text && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Download className="size-3.5" />
                    Download .txt
                  </button>
                </div>
              )}
            </div>
            <div className="h-56 rounded-2xl border border-border bg-background/50 p-4 text-sm text-foreground overflow-y-auto whitespace-pre-wrap font-mono">
              {error ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-destructive gap-2">
                  <AlertCircle className="size-8" />
                  <span className="text-xs">{error}</span>
                </div>
              ) : (
                text || (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                    <ScanText className="size-8 opacity-40" />
                    <span>
                      Extracted text will appear here. Scanned (image-only) PDFs need OCR, which is
                      not supported here.
                    </span>
                  </div>
                )
              )}
            </div>
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

export const PdfToTextRuntime: ReadyToolRuntimeDefinition = {
  toolId: "pdf-to-text",
  slug: "pdf-to-text",
  categoryId: "pdf",
  icon: ScanText,
  component: PdfToTextTool,
  layoutDescription:
    "Extract selectable text from any PDF, entirely in your browser with full privacy.",
  layoutDescriptionKey: "tool.pdf-to-text.pageDescription",
};
