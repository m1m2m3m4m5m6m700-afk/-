import { useState } from "react";
import { Eraser, Copy, Check, RotateCcw, Download, AlertCircle, FileText } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function RemoveDuplicateLinesTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState<{ removed: number; total: number } | null>(null);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput("");
      setStats(null);
      return;
    }
    const lines = input.split(/\r?\n/);
    const seen = new Set<string>();
    const result: string[] = [];
    for (const line of lines) {
      const key = (trimWhitespace ? line.trim() : line).valueOf();
      const compareKey = caseSensitive ? key : key.toLowerCase();
      if (!seen.has(compareKey)) {
        seen.add(compareKey);
        result.push(line);
      }
    }
    setOutput(result.join("\n"));
    setStats({ removed: lines.length - result.length, total: lines.length });
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unique-lines.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setStats(null);
    setCopied(false);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="size-3.5 rounded border-border accent-primary"
            />
            Case-sensitive
          </label>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={(e) => setTrimWhitespace(e.target.checked)}
              className="size-3.5 rounded border-border accent-primary"
            />
            Ignore leading/trailing spaces
          </label>
        </div>
        <button
          type="button"
          onClick={handleProcess}
          disabled={!input.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <Eraser className="size-3.5" />
          Remove Duplicates
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Input Text</label>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="size-3.5" />
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"Paste lines with possible duplicates...\napple\nbanana\napple\ncherry"}
            className="w-full h-72 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Unique Lines</label>
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
          {stats ? (
            <div className="flex items-start gap-2.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mb-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span className="text-xs">
                Removed {stats.removed} duplicate line{stats.removed === 1 ? "" : "s"} of{" "}
                {stats.total} total.
              </span>
            </div>
          ) : null}
          <div className="h-72 rounded-2xl border border-border bg-background p-4 overflow-auto font-mono text-xs">
            {output ? (
              <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileText className="size-8 opacity-40" />
                <span>Unique lines will appear here.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const RemoveDuplicateLinesRuntime: ReadyToolRuntimeDefinition = {
  toolId: "remove-duplicate-lines",
  slug: "remove-duplicate-lines",
  categoryId: "utilities",
  icon: Eraser,
  component: RemoveDuplicateLinesTool,
  layoutDescription:
    "Remove duplicate lines from any text with optional case-insensitive and whitespace-aware matching.",
};
