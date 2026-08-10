import { useState } from "react";
import { Code, Copy, Check, Download, Zap } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function JsMinifierTool() {
  const [input, setInput] = useState(
    `// Calculate sum of array\nfunction sumArray(arr) {\n  let total = 0;\n  for (let i = 0; i < arr.length; i++) {\n    total += arr[i];\n  }\n  return total;\n}`,
  );
  const [minified, setMinified] = useState("");
  const [copied, setCopied] = useState(false);

  const handleMinify = () => {
    if (!input.trim()) return;
    const result = input
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
      .replace(/\/\/.*/g, "") // Remove line comments
      .replace(/\s+/g, " ") // Collapse spaces
      .replace(new RegExp("\\s*([{}:;,=+\\-*/()])\\s*", "g"), "$1") // Remove spaces around operators
      .trim();
    setMinified(result);
  };

  const handleCopy = () => {
    const text = minified || input;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const data = minified || input;
    if (!data) return;
    const blob = new Blob([data], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "script.min.js";
    a.click();
    URL.revokeObjectURL(url);
  };

  const origSize = new Blob([input]).size;
  const minSize = new Blob([minified]).size;
  const savedPercent =
    origSize > 0 && minified ? (((origSize - minSize) / origSize) * 100).toFixed(1) : 0;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <button
          type="button"
          onClick={handleMinify}
          className="px-5 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <Zap className="size-3.5" />
          Minify JS
        </button>

        {minified && (
          <div className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            Reduced size by {savedPercent}% ({origSize} B → {minSize} B)
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Raw JavaScript Source</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste JS code here..."
            className="w-full h-64 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Minified JS Output</label>
            {(minified || input) && (
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

          <div className="h-64 rounded-2xl border border-border bg-background p-4 overflow-y-auto font-mono text-xs whitespace-pre-wrap break-all">
            {minified ? (
              minified
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Code className="size-8 opacity-40" />
                <span>Click "Minify JS" to clean JavaScript code.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const JsMinifierRuntime: ReadyToolRuntimeDefinition = {
  toolId: "js-minifier",
  slug: "js-minifier",
  categoryId: "web",
  icon: Code,
  component: JsMinifierTool,
  layoutDescription: "Minify JavaScript code, strip comments, and compress formatting.",
};
