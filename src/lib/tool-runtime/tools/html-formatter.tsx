import { useState } from "react";
import { Code2, Copy, Check, RotateCcw, Download, AlertCircle, FileCode } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const INLINE_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "data",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr",
]);

function formatHtml(input: string, indent: string): string {
  const doc = new DOMParser().parseFromString(input, "text/html");
  const out: string[] = [];
  const walk = (node: Node, depth: number) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) out.push(indent.repeat(depth) + text);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        const tag = el.tagName.toLowerCase();
        const isVoid = VOID_TAGS.has(tag);
        const isInline = INLINE_TAGS.has(tag);
        const attrs = el.attributes.length
          ? " " +
            Array.from(el.attributes)
              .map((a) => `${a.name}="${a.value}"`)
              .join(" ")
          : "";
        if (isVoid) {
          out.push(indent.repeat(depth) + `<${tag}${attrs}>`);
        } else if (isInline && el.childElementCount === 0) {
          const text = el.textContent?.trim() ?? "";
          out.push(indent.repeat(depth) + `<${tag}${attrs}>${text}</${tag}>`);
        } else {
          out.push(indent.repeat(depth) + `<${tag}${attrs}>`);
          walk(el, depth + 1);
          out.push(indent.repeat(depth) + `</${tag}>`);
        }
      }
    });
  };
  walk(doc.documentElement, 0);
  return out.join("\n");
}

function HtmlFormatterTool() {
  const [input, setInput] = useState(
    `<div class="card"><h2>Title</h2><p>Hello <strong>Flixo</strong></p><ul><li>One</li><li>Two</li></ul></div>`,
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState<number | "tab">(2);
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    const space = indent === "tab" ? "\t" : " ".repeat(indent);
    try {
      setOutput(formatHtml(input, space));
      setError(null);
    } catch (err) {
      setError((err as Error).message || "Formatting failed.");
      setOutput("");
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    setOutput(
      input
        .replace(/>\s+</g, "><")
        .replace(/\s{2,}/g, " ")
        .trim(),
    );
    setError(null);
  };

  const handleCopy = () => {
    const text = output || input;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const data = output || input;
    if (!data) return;
    const blob = new Blob([data], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setError(null);
    setCopied(false);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Indent:</label>
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
            <Code2 className="size-3.5" />
            Beautify HTML
          </button>
          <button
            type="button"
            onClick={handleMinify}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Minify HTML
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Input HTML</label>
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
            placeholder="<div><p>Paste HTML here</p></div>"
            className="w-full h-72 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Formatted Output</label>
            {(output || input) && (
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
            {error ? (
              <div className="flex items-start gap-2.5 text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-xs">HTML Error Detected</div>
                  <div className="text-[11px] opacity-90 mt-0.5">{error}</div>
                </div>
              </div>
            ) : output ? (
              <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileCode className="size-8 opacity-40" />
                <span>Click "Beautify HTML" to format output.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const HtmlFormatterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "html-formatter",
  slug: "html-formatter",
  categoryId: "developer",
  icon: Code2,
  component: HtmlFormatterTool,
  layoutDescription: "Beautify and minify HTML with proper nesting and configurable indentation.",
};
