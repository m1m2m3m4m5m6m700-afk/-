import { useState } from "react";
import { Code, Copy, Check, RotateCcw, Download, AlertCircle, Sparkles } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function JsonFormatterTool() {
  const [input, setInput] = useState(
    `{\n  "name": "Flixo",\n  "type": "Online Tools Platform",\n  "version": 1.0,\n  "features": ["Fast", "Private", "Free"]\n}`,
  );
  const [formatted, setFormatted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState<number | "tab">(2);
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    if (!input.trim()) {
      setFormatted("");
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const space = indent === "tab" ? "\t" : indent;
      setFormatted(JSON.stringify(parsed, null, space));
      setError(null);
    } catch (err) {
      setError((err as Error).message || "Invalid JSON syntax");
      setFormatted("");
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setFormatted(JSON.stringify(parsed));
      setError(null);
    } catch (err) {
      setError((err as Error).message || "Invalid JSON syntax");
      setFormatted("");
    }
  };

  const handleCopy = () => {
    const textToCopy = formatted || input;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const data = formatted || input;
    if (!data) return;
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Indentation:
          </label>
          <div className="flex rounded-xl border border-border p-1 bg-background">
            {[2, 4, "tab"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setIndent(opt as number | "tab")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  indent === opt
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt === "tab" ? "Tab" : `${opt} Spaces`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFormat}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="size-3.5" />
            Prettify JSON
          </button>
          <button
            type="button"
            onClick={handleMinify}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Minify JSON
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Input Raw JSON</label>
            <button
              type="button"
              onClick={() => {
                setInput("");
                setFormatted("");
                setError(null);
              }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="size-3.5" />
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON string here..."
            className="w-full h-80 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Formatted Output</label>
            {(formatted || input) && (
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

          <div className="relative h-80 rounded-2xl border border-border bg-background p-4 overflow-auto font-mono text-xs">
            {error ? (
              <div className="flex items-start gap-2.5 text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-xs">JSON Error Detected</div>
                  <div className="text-[11px] opacity-90 mt-0.5">{error}</div>
                </div>
              </div>
            ) : formatted ? (
              <pre className="text-foreground whitespace-pre-wrap">{formatted}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Code className="size-8 opacity-40" />
                <span>Click "Prettify JSON" or "Minify JSON" to format output.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const JsonFormatterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "json-formatter",
  slug: "json-formatter",
  categoryId: "utilities",
  icon: Code,
  component: JsonFormatterTool,
  layoutDescription: "Format, validate, beautify, and minify JSON with custom spacing options.",
};
