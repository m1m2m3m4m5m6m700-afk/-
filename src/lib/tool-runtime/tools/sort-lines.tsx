import { useState } from "react";
import { ArrowDownAZ, Copy, Check, RotateCcw, Download, FileText } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

type SortMode = "asc" | "desc" | "length-asc" | "length-desc" | "shuffle";

function sortLines(lines: string[], mode: SortMode): string[] {
  switch (mode) {
    case "asc":
      return [...lines].sort((a, b) => a.localeCompare(b));
    case "desc":
      return [...lines].sort((a, b) => b.localeCompare(a));
    case "length-asc":
      return [...lines].sort((a, b) => a.length - b.length || a.localeCompare(b));
    case "length-desc":
      return [...lines].sort((a, b) => b.length - a.length || a.localeCompare(b));
    case "shuffle": {
      const arr = [...lines];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
  }
}

function SortLinesTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<SortMode>("asc");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [removeBlanks, setRemoveBlanks] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleSort = () => {
    if (!input) {
      setOutput("");
      return;
    }
    let lines = input.split(/\r?\n/);
    if (removeBlanks) lines = lines.filter((line) => line.trim() !== "");
    if (!caseSensitive && (mode === "asc" || mode === "desc")) {
      lines = [...lines].sort((a, b) => {
        const cmp = a.toLowerCase().localeCompare(b.toLowerCase());
        return mode === "desc" ? -cmp : cmp;
      });
      setOutput(lines.join("\n"));
      return;
    }
    setOutput(sortLines(lines, mode).join("\n"));
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
    a.download = "sorted-lines.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setCopied(false);
  };

  const modes: { id: SortMode; label: string }[] = [
    { id: "asc", label: "A → Z" },
    { id: "desc", label: "Z → A" },
    { id: "length-asc", label: "Shortest first" },
    { id: "length-desc", label: "Longest first" },
    { id: "shuffle", label: "Shuffle" },
  ];

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-border p-1 bg-background">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  mode === m.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="size-3.5 rounded border-border accent-primary"
            />
            Case-sensitive
          </label>
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={removeBlanks}
              onChange={(e) => setRemoveBlanks(e.target.checked)}
              className="size-3.5 rounded border-border accent-primary"
            />
            Skip blanks
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSort}
          disabled={!input}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <ArrowDownAZ className="size-3.5" />
          Sort Lines
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Input Lines</label>
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
            placeholder={"One item per line...\nbanana\napple\ncherry"}
            className="w-full h-72 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Sorted Output</label>
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
          <div className="h-72 rounded-2xl border border-border bg-background p-4 overflow-auto font-mono text-xs">
            {output ? (
              <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileText className="size-8 opacity-40" />
                <span>Sorted lines will appear here.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const SortLinesRuntime: ReadyToolRuntimeDefinition = {
  toolId: "sort-lines",
  slug: "sort-lines",
  categoryId: "utilities",
  icon: ArrowDownAZ,
  component: SortLinesTool,
  layoutDescription:
    "Sort text lines alphabetically, by length, or shuffle them with case and blank-line options.",
};
