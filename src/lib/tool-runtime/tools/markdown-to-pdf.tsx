import { useState } from "react";
import { FileDown, Download, RefreshCw, ShieldCheck, AlertCircle, FileText } from "lucide-react";
import { downloadBlob, friendlyError } from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function MarkdownToPdfTool() {
  const [md, setMd] = useState("");
  const [title, setTitle] = useState("Document");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; size: number } | null>(null);

  const sample = `# Heading 1\n## Heading 2\n\nThis is **bold** and *italic* text.\n\n- Item one\n- Item two\n\n1. First\n2. Second\n\n> A blockquote.\n\n\`inline code\`\n`;

  const handleProcess = async () => {
    if (!md.trim()) {
      setError("Please enter some Markdown first.");
      return;
    }
    setIsProcessing(true);
    setError("");
    setResult(null);
    try {
      const { marked } = await import("marked");
      const html = marked.parse(md, { async: false }) as string;
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 48;
      const tempEl = document.createElement("div");
      tempEl.innerHTML = html;
      doc.setFontSize(12);
      let y = margin + 16;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(title || "Document", margin, y);
      y += 28;
      doc.setFontSize(12);

      const writeLine = (
        text: string,
        opts: { bold?: boolean; size?: number; indent?: number } = {},
      ) => {
        const size = opts.size ?? 12;
        doc.setFontSize(size);
        doc.setFont("helvetica", opts.bold ? "bold" : "normal");
        const lines = doc.splitTextToSize(
          text,
          pageWidth - margin * 2 - (opts.indent ?? 0),
        ) as string[];
        for (const line of lines) {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin + size;
          }
          doc.text(line, margin + (opts.indent ?? 0), y);
          y += size * 1.5;
        }
      };

      for (const node of Array.from(tempEl.childNodes)) {
        if (node.nodeType !== 1) {
          const txt = (node.textContent || "").trim();
          if (txt) writeLine(txt);
          continue;
        }
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const text = el.textContent || "";
        if (tag === "h1") {
          writeLine(text, { bold: true, size: 20 });
          y += 4;
        } else if (tag === "h2") {
          writeLine(text, { bold: true, size: 16 });
          y += 2;
        } else if (tag === "h3") {
          writeLine(text, { bold: true, size: 14 });
        } else if (tag === "ul" || tag === "ol") {
          el.querySelectorAll(":scope > li").forEach((li, i) => {
            const prefix = tag === "ol" ? `${i + 1}. ` : "• ";
            writeLine(prefix + (li.textContent || ""), { indent: 16 });
          });
        } else if (tag === "blockquote") {
          writeLine(text, { indent: 16 });
        } else if (tag === "p" || tag === "div") {
          writeLine(text);
          y += 4;
        } else {
          writeLine(text);
        }
      }

      const outBytes = doc.output("arraybuffer") as ArrayBuffer;
      const outName = (title || "document").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() + ".pdf";
      downloadBlob(outBytes, outName, "application/pdf");
      setResult({ name: outName, size: outBytes.byteLength });
    } catch (e) {
      setError(friendlyError(e, "Failed to generate PDF from Markdown."));
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
            <label className="block text-sm font-semibold text-foreground mb-1">
              Markdown Content
            </label>
            <textarea
              value={md}
              onChange={(e) => setMd(e.target.value)}
              placeholder={sample}
              className="w-full h-48 rounded-2xl border border-border bg-background p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              {md.length.toLocaleString()} characters
            </p>
          </div>
          <button
            type="button"
            onClick={handleProcess}
            disabled={!md.trim() || isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="size-4" />
                Convert Markdown to PDF
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
                <span className="text-xs text-muted-foreground">
                  {result.size.toLocaleString()} bytes
                </span>
                <span className="text-xs">Downloaded successfully</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileDown className="size-8 opacity-40" />
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

export const MarkdownToPdfRuntime: ReadyToolRuntimeDefinition = {
  toolId: "markdown-to-pdf",
  slug: "markdown-to-pdf",
  categoryId: "pdf",
  icon: FileDown,
  component: MarkdownToPdfTool,
  layoutDescription: "Convert Markdown into a formatted PDF document, entirely in your browser.",
  layoutDescriptionKey: "tool.markdown-to-pdf.pageDescription",
};
