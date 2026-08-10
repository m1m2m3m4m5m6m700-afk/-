import { useState } from "react";
import { AlignVerticalSpaceAround, Copy, Check, RotateCcw, Download, FileText } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function RemoveEmptyLinesTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [removed, setRemoved] = useState(0);
  const [trimLines, setTrimLines] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleProcess = () => {
    if (!input) {
      setOutput("");
      setRemoved(0);
      return;
    }
    const lines = input.split(/\r?\n/);
    const kept: string[] = [];
    let count = 0;
    for (const line of lines) {
      const candidate = trimLines ? line.trim() : line;
      if (candidate === "") {
        count++;
      } else {
        kept.push(trimLines ? candidate : line);
      }
    }
    setOutput(kept.join("\n"));
    setRemoved(count);
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
    a.download = "no-empty-lines.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setRemoved(0);
    setCopied(false);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <input
            type="checkbox"
            checked={trimLines}
            onChange={(e) => setTrimLines(e.target.checked)}
            className="size-3.5 rounded border-border accent-primary"
          />
          Also trim whitespace-only lines
        </label>
        <button
          type="button"
          onClick={handleProcess}
          disabled={!input}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <AlignVerticalSpaceAround className="size-3.5" />
          Remove Empty Lines
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
            placeholder={"Paste text with blank lines...\n\nkeep me\n\n\nkeep me too"}
            className="w-full h-72 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Cleaned Output</label>
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
          {removed > 0 && (
            <div className="text-xs text-muted-foreground">
              Removed {removed} empty line{removed === 1 ? "" : "s"}.
            </div>
          )}
          <div className="h-72 rounded-2xl border border-border bg-background p-4 overflow-auto font-mono text-xs">
            {output ? (
              <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileText className="size-8 opacity-40" />
                <span>Cleaned text will appear here.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const RemoveEmptyLinesRuntime: ReadyToolRuntimeDefinition = {
  toolId: "remove-empty-lines",
  slug: "remove-empty-lines",
  categoryId: "utilities",
  icon: AlignVerticalSpaceAround,
  component: RemoveEmptyLinesTool,
  layoutDescription: "Strip blank and whitespace-only lines from any text instantly.",
};
