import { useState } from "react";
import { Link, Copy, Check, RotateCcw } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function UrlEncoderTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState(
    "https://flixo.app/tools/url-encoder?query=search term&category=web & tech",
  );
  const [copied, setCopied] = useState(false);

  let output = "";
  let error = false;

  try {
    if (input) {
      output = mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
    }
  } catch (err) {
    error = true;
    output = "Malformed URI sequence";
  }

  const handleCopy = () => {
    if (!output || error) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex rounded-xl border border-border p-1 bg-background w-fit">
        <button
          type="button"
          onClick={() => setMode("encode")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            mode === "encode"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          URL Encode
        </button>
        <button
          type="button"
          onClick={() => setMode("decode")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            mode === "decode"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          URL Decode
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              {mode === "encode" ? "Raw URL or Query Parameter" : "Encoded URL"}
            </label>
            <button
              type="button"
              onClick={() => setInput("")}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="size-3" />
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter URL to encode or decode..."
            className="w-full h-56 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Output Result</label>
            {output && !error && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          <div className="h-56 rounded-2xl border border-border bg-background p-4 overflow-y-auto font-mono text-xs whitespace-pre-wrap break-all">
            {error ? (
              <span className="text-destructive font-semibold">{output}</span>
            ) : output ? (
              <span className="text-foreground">{output}</span>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Link className="size-8 opacity-40" />
                <span>Result will appear here...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const UrlEncoderRuntime: ReadyToolRuntimeDefinition = {
  toolId: "url-encoder",
  slug: "url-encoder",
  categoryId: "web",
  icon: Link,
  component: UrlEncoderTool,
  layoutDescription:
    "Encode special characters into percent-encoded URL parameters or decode encoded URLs.",
};
