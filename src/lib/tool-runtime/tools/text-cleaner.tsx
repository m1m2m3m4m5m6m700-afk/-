import { useState } from "react";
import { Sparkles, Copy, Check, RotateCcw, Download, AlertCircle, FileText } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 rounded border-border accent-primary"
      />
      {label}
    </label>
  );
}

function TextCleanerTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState<{
    removedLines: number;
    totalLines: number;
    collapsedSpaces: number;
    trimmedChars: number;
  } | null>(null);
  const [trimLines, setTrimLines] = useState(true);
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [normalizeBreaks, setNormalizeBreaks] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = () => {
    setError(null);
    if (!input) {
      setOutput("");
      setStats(null);
      return;
    }
    try {
      let working = input;
      // Normalize line breaks first: CRLF / CR -> LF
      if (normalizeBreaks) {
        working = working.replace(/\r\n?/g, "\n");
      }
      let collapsedSpaces = 0;
      let trimmedChars = 0;
      let lines = working.split("\n");

      if (trimLines || collapseSpaces) {
        lines = lines.map((line) => {
          let next = line;
          if (trimLines) {
            const before = next.length;
            next = next.trim();
            trimmedChars += before - next.length;
          }
          if (collapseSpaces) {
            // Collapse runs of spaces/tabs into a single space (preserve content).
            const collapsed = next.replace(/[ \t]+/g, " ");
            collapsedSpaces += next.length - collapsed.length;
            next = collapsed;
          }
          return next;
        });
      }

      const totalLines = lines.length;
      if (removeEmpty) {
        lines = lines.filter((line) => line.length > 0);
      }
      const removedLines = totalLines - lines.length;

      // Re-join, trimming any leading/trailing blank lines for a tidy result.
      const result = lines.join("\n").replace(/^\n+|\n+$/g, "");

      setOutput(result);
      setStats({ removedLines, totalLines, collapsedSpaces, trimmedChars });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clean text.");
      setOutput("");
      setStats(null);
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
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setStats(null);
    setCopied(false);
    setError(null);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-4">
          <Toggle checked={trimLines} onChange={setTrimLines} label="Trim line ends" />
          <Toggle
            checked={collapseSpaces}
            onChange={setCollapseSpaces}
            label="Collapse extra spaces"
          />
          <Toggle checked={removeEmpty} onChange={setRemoveEmpty} label="Remove empty lines" />
          <Toggle
            checked={normalizeBreaks}
            onChange={setNormalizeBreaks}
            label="Normalize breaks"
          />
        </div>
        <button
          type="button"
          onClick={handleProcess}
          disabled={!input}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <Sparkles className="size-3.5" />
          Clean Text
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
            placeholder={
              "Paste messy text here...\n   extra   spaces   \n\n  blank lines above  \r\nwindows breaks"
            }
            className="w-full h-72 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Cleaned Text</label>
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
          {error ? (
            <div className="flex items-start gap-2.5 text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 mb-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span className="text-xs">{error}</span>
            </div>
          ) : stats ? (
            <div className="flex items-start gap-2.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mb-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span className="text-xs">
                Cleaned {stats.totalLines} line{stats.totalLines === 1 ? "" : "s"} · removed{" "}
                {stats.removedLines} empty · collapsed {stats.collapsedSpaces} space
                {stats.collapsedSpaces === 1 ? "" : "s"} · trimmed {stats.trimmedChars} char
                {stats.trimmedChars === 1 ? "" : "s"}.
              </span>
            </div>
          ) : null}
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

export const TextCleanerRuntime: ReadyToolRuntimeDefinition = {
  toolId: "text-cleaner",
  slug: "text-cleaner",
  categoryId: "utilities",
  icon: Sparkles,
  component: TextCleanerTool,
  layoutDescription:
    "Trim, collapse spaces, remove empty lines and normalize line breaks in any text without uploading it.",
};
