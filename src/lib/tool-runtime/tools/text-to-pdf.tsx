import { useState } from "react";
import { FilePlus, Download, RefreshCw, ShieldCheck, AlertCircle, Type } from "lucide-react";
import { downloadBlob, friendlyError } from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function TextToPdfTool() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("Document");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; size: number } | null>(null);

  const handleProcess = async () => {
    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }
    setIsProcessing(true);
    setError("");
    setResult(null);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 48;
      const fontSize = 12;
      const lineHeight = fontSize * 1.5;
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", "bold");
      doc.text(title || "Document", margin, margin + fontSize);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2) as string[];
      let y = margin + fontSize * 2 + 8;
      for (const line of lines) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin + fontSize;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      }
      const outBytes = doc.output("arraybuffer") as ArrayBuffer;
      const outName = (title || "document").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() + ".pdf";
      downloadBlob(outBytes, outName, "application/pdf");
      setResult({ name: outName, size: outBytes.byteLength });
    } catch (e) {
      setError(friendlyError(e, "Failed to generate PDF."));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Your Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste the text you want to convert to PDF..."
              className="w-full h-48 rounded-2xl border border-border bg-background p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              {text.length.toLocaleString()} characters
            </p>
          </div>
          <button
            type="button"
            onClick={handleProcess}
            disabled={!text.trim() || isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FilePlus className="size-4" />
                Convert to PDF
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
                <Type className="size-8" />
                <span className="text-sm font-semibold">{result.name}</span>
                <span className="text-xs text-muted-foreground">
                  {result.size.toLocaleString()} bytes
                </span>
                <span className="text-xs">Downloaded successfully</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FilePlus className="size-8 opacity-40" />
                <span>Your PDF will download here.</span>
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

export const TextToPdfRuntime: ReadyToolRuntimeDefinition = {
  toolId: "text-to-pdf",
  slug: "text-to-pdf",
  categoryId: "pdf",
  icon: FilePlus,
  component: TextToPdfTool,
  layoutDescription:
    "Convert plain text into a formatted, downloadable PDF entirely in your browser.",
  layoutDescriptionKey: "tool.text-to-pdf.pageDescription",
};
