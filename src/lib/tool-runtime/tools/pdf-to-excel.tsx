import { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  Upload,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  assertFileValid,
  downloadBlob,
  formatBytes,
  friendlyError,
  getPdfjs,
  readFileAsArrayBuffer,
} from "@/lib/utils";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import type { ReadyToolRuntimeDefinition } from "../types";

function PdfToExcelTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; rows: number; preview: string } | null>(
    null,
  );

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError("");
    setResult(null);
    try {
      assertFileValid(file, { kind: "PDF", maxBytes: 100 * 1024 * 1024 });
      const pdfjs = await getPdfjs();
      const data = await readFileAsArrayBuffer(file);
      const pdf = await pdfjs.getDocument({ data }).promise;
      const rows: string[][] = [];
      let totalItems = 0;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const items = content.items.filter((it): it is TextItem => "str" in it);
        totalItems += items.length;
        rows.push([`Page ${i}`]);
        rows.push(...buildRows(items));
        rows.push([]);
      }
      if (totalItems === 0) {
        setError(
          "No text layer found. This PDF appears to be scanned or image-based. CSV extraction requires OCR (optical character recognition), which is not available in a browser-based tool.",
        );
        return;
      }
      const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
      const outName = file.name.replace(/\.pdf$/i, "") + ".csv";
      downloadBlob("\uFEFF" + csv, outName, "text/csv;charset=utf-8");
      setResult({
        name: outName,
        rows: rows.filter((r) => r.length).length,
        preview: csv.split("\n").slice(0, 8).join("\n"),
      });
    } catch (e) {
      setError(friendlyError(e, "Failed to convert PDF. It may be scanned or protected."));
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
              id="pdf-excel-upload"
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
              htmlFor="pdf-excel-upload"
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
          <p className="text-[11px] text-muted-foreground">
            Extracts text positioned into CSV rows by detecting table-like column alignment. Best
            for PDFs with real text (not scanned images).
          </p>
          <button
            type="button"
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="size-4" />
                Convert to Excel (CSV)
              </>
            )}
          </button>
        </div>
        <div className="space-y-4 flex flex-col justify-between">
          <div className="h-full rounded-2xl border border-border bg-background/50 p-4 text-sm flex flex-col gap-3">
            {error ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-destructive">
                <AlertCircle className="size-8" />
                <span className="text-xs">{error}</span>
              </div>
            ) : result ? (
              <div className="flex flex-col gap-2 text-emerald-600">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="size-8" />
                  <span className="text-sm font-semibold">{result.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{result.rows} rows extracted</span>
                <span className="text-xs">Downloaded as CSV (opens in Excel).</span>
                <pre className="text-[10px] text-muted-foreground bg-background p-2 rounded border border-border overflow-auto max-h-32 font-mono">
                  {result.preview}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <FileSpreadsheet className="size-8 opacity-40" />
                <span>Your spreadsheet will download here.</span>
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

function buildRows(items: TextItem[]): string[][] {
  const lineTolerance = 3;
  const lines = new Map<number, { x: number; text: string }[]>();
  for (const it of items) {
    if (!it.str.trim()) continue;
    const y = Math.round(it.transform[5]);
    let key = -1;
    for (const k of lines.keys())
      if (Math.abs(k - y) <= lineTolerance) {
        key = k;
        break;
      }
    if (key === -1) {
      key = y;
      lines.set(key, []);
    }
    lines.get(key)!.push({ x: it.transform[4], text: it.str });
  }
  const sortedYs = [...lines.keys()].sort((a, b) => b - a);
  return sortedYs
    .map((y) => {
      const cells = lines.get(y)!.sort((a, b) => a.x - b.x);
      const cols: string[] = [];
      let current = "";
      for (const c of cells) {
        if (current && c.x - (cells[cols.length - 1 === -1 ? 0 : 0]?.x ?? c.x) > 50 && current) {
          cols.push(current.trim());
          current = c.text;
        } else {
          current = current ? current + " " + c.text : c.text;
        }
      }
      if (current.trim()) cols.push(current.trim());
      return cols.length ? cols : [];
    })
    .filter((r) => r.length);
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export const PdfToExcelRuntime: ReadyToolRuntimeDefinition = {
  toolId: "pdf-to-excel",
  slug: "pdf-to-excel",
  categoryId: "pdf",
  icon: FileSpreadsheet,
  component: PdfToExcelTool,
  layoutDescription:
    "Extract table-like data from PDF into a CSV spreadsheet, entirely in your browser.",
  layoutDescriptionKey: "tool.pdf-to-excel.pageDescription",
};
