import { useState } from "react";
import { Replace, Copy, Check, RotateCcw, Download, AlertCircle, FileText } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function FindAndReplaceTool() {
  const [input, setInput] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [output, setOutput] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [replacements, setReplacements] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReplace = () => {
    if (!input) {
      setOutput("");
      setReplacements(null);
      setError(null);
      return;
    }
    if (!find) {
      setError("Enter text to find before replacing.");
      setOutput("");
      setReplacements(null);
      return;
    }
    let flags = "g";
    if (!caseSensitive) flags += "i";
    let pattern: RegExp;
    try {
      pattern = useRegex ? new RegExp(find, flags) : new RegExp(escapeRegExp(find), flags);
    } catch (err) {
      setError(`Invalid regular expression: ${(err as Error).message}`);
      setOutput("");
      setReplacements(null);
      return;
    }
    let count = 0;
    const out = input.replace(pattern, () => {
      count++;
      return replace;
    });
    setOutput(out);
    setReplacements(count);
    setError(null);
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
    a.download = "replaced-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInput("");
    setFind("");
    setReplace("");
    setOutput("");
    setReplacements(null);
    setError(null);
    setCopied(false);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 border-b border-border pb-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Find</label>
          <input
            type="text"
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder="Text or pattern to find"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Replace with
          </label>
          <input
            type="text"
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            placeholder="Replacement text"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="size-3.5 rounded border-border accent-primary"
            />
            Use regex
          </label>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="size-3.5 rounded border-border accent-primary"
            />
            Case-sensitive
          </label>
        </div>
        <button
          type="button"
          onClick={handleReplace}
          disabled={!input}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <Replace className="size-3.5" />
          Replace All
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
            placeholder="Paste the text you want to search and replace within..."
            className="w-full h-64 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Result</label>
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
            <div className="flex items-start gap-2.5 text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-xs">Replacement Error</div>
                <div className="text-[11px] opacity-90 mt-0.5">{error}</div>
              </div>
            </div>
          ) : null}
          <div className="h-64 rounded-2xl border border-border bg-background p-4 overflow-auto font-mono text-xs">
            {output ? (
              <>
                {replacements !== null && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-2">
                    {replacements} replacement{replacements === 1 ? "" : "s"} made.
                  </div>
                )}
                <pre className="text-foreground whitespace-pre-wrap break-all">{output}</pre>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileText className="size-8 opacity-40" />
                <span>Replaced text will appear here.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const FindAndReplaceRuntime: ReadyToolRuntimeDefinition = {
  toolId: "find-and-replace",
  slug: "find-and-replace",
  categoryId: "utilities",
  icon: Replace,
  component: FindAndReplaceTool,
  layoutDescription:
    "Find and replace text across long documents with optional regex and case-sensitive matching.",
};
