import { useState } from "react";
import { FileSpreadsheet, Copy, Check, Download, ArrowRightLeft } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function CsvToJsonTool() {
  const [direction, setDirection] = useState<"csv2json" | "json2csv">("csv2json");
  const [input, setInput] = useState(`id,name,role\n1,Alice,Developer\n2,Bob,Designer`);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      if (direction === "csv2json") {
        const lines = input
          .trim()
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        if (lines.length === 0) return;
        const headers = lines[0].split(",").map((h) => h.trim());
        const result = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = values[i] ?? "";
          });
          return obj;
        });
        setOutput(JSON.stringify(result, null, 2));
      } else {
        const parsed = JSON.parse(input);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          setError("Input JSON must be an array of objects.");
          return;
        }
        const headers = Object.keys(parsed[0]);
        const csvRows = [headers.join(",")];
        parsed.forEach((obj) => {
          const row = headers.map((h) => JSON.stringify(obj[h] ?? "")).join(",");
          csvRows.push(row);
        });
        setOutput(csvRows.join("\n"));
      }
    } catch (err) {
      setError((err as Error).message || "Conversion failed");
      setOutput("");
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const ext = direction === "csv2json" ? "json" : "csv";
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex rounded-xl border border-border p-1 bg-background">
          <button
            type="button"
            onClick={() => {
              setDirection("csv2json");
              setError(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              direction === "csv2json"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            CSV to JSON
          </button>
          <button
            type="button"
            onClick={() => {
              setDirection("json2csv");
              setError(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              direction === "json2csv"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            JSON to CSV
          </button>
        </div>

        <button
          type="button"
          onClick={handleConvert}
          className="px-5 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <ArrowRightLeft className="size-3.5" />
          Convert
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            {direction === "csv2json" ? "CSV Input" : "JSON Input Array"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === "csv2json" ? "Paste CSV here..." : "Paste JSON array here..."
            }
            className="w-full h-64 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Output Result</label>
            {output && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  <Download className="size-3.5" />
                  Download
                </button>
              </div>
            )}
          </div>

          <div className="h-64 rounded-2xl border border-border bg-background p-4 overflow-y-auto font-mono text-xs whitespace-pre">
            {error ? (
              <span className="text-rose-500 font-semibold">{error}</span>
            ) : output ? (
              output
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileSpreadsheet className="size-8 opacity-40" />
                <span>Click "Convert" to process data.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const CsvToJsonRuntime: ReadyToolRuntimeDefinition = {
  toolId: "csv-to-json",
  slug: "csv-to-json",
  categoryId: "converters",
  icon: FileSpreadsheet,
  component: CsvToJsonTool,
  layoutDescription: "Convert CSV spreadsheets into structured JSON arrays and back.",
};
