import { useMemo, useState } from "react";
import { Code2, Copy, Check, RotateCcw, Download } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

type Mode = "encode" | "decode";

const NAMED_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#47;",
  "`": "&#96;",
};

const NAMED_DECODE: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00A0",
  copy: "\u00A9",
  reg: "\u00AE",
  trade: "\u2122",
  hellip: "\u2026",
  mdash: "\u2014",
  ndash: "\u2013",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201C",
  rdquo: "\u201D",
  laquo: "\u00AB",
  raquo: "\u00BB",
  deg: "\u00B0",
  pound: "\u00A3",
  euro: "\u20AC",
  yen: "\u00A5",
  cent: "\u00A2",
  times: "\u00D7",
  divide: "\u00F7",
  micro: "\u00B5",
  para: "\u00B6",
  middot: "\u00B7",
  bull: "\u2022",
  dagger: "\u2020",
  Dagger: "\u2021",
  permil: "\u2030",
  prime: "\u2032",
  Prime: "\u2033",
  infin: "\u221E",
  ne: "\u2260",
  le: "\u2264",
  ge: "\u2265",
  plusmn: "\u00B1",
  frac12: "\u00BD",
  frac14: "\u00BC",
  frac34: "\u00BE",
  sup2: "\u00B2",
  sup3: "\u00B3",
};

function encodeHtml(input: string, encodeQuotes: boolean): string {
  let result = "";
  for (const char of input) {
    if (NAMED_ENTITIES[char] && (char !== '"' || encodeQuotes) && (char !== "'" || encodeQuotes)) {
      result += NAMED_ENTITIES[char];
    } else if (char.charCodeAt(0) > 127) {
      result += `&#${char.charCodeAt(0)};`;
    } else {
      result += char;
    }
  }
  return result;
}

function decodeHtml(input: string): string {
  return input.replace(/&(#[0-9]+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const code = parseInt(entity.slice(2), 16);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    if (entity.startsWith("#")) {
      const code = parseInt(entity.slice(1), 10);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    return NAMED_DECODE[entity] ?? match;
  });
}

function HtmlEntityEncoderTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState('<a href="/search?q=cats & dogs">Café "résumé" — 5€</a>');
  const [encodeQuotes, setEncodeQuotes] = useState(true);
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: false };
    try {
      if (mode === "encode") {
        return { output: encodeHtml(input, encodeQuotes), error: false };
      }
      return { output: decodeHtml(input), error: false };
    } catch {
      return { output: "Invalid HTML entity sequence", error: true };
    }
  }, [input, mode, encodeQuotes]);

  const handleCopy = () => {
    if (!output || error) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output || error) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `html-entity-${mode}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const words = output.trim() ? output.trim().split(/\s+/).length : 0;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
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
            HTML Encode
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
            HTML Decode
          </button>
        </div>
        {mode === "encode" && (
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={encodeQuotes}
              onChange={(e) => setEncodeQuotes(e.target.checked)}
              className="size-3.5 accent-primary"
            />
            Encode quotes (&quot; &apos;)
          </label>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              {mode === "encode" ? "Raw HTML or Text" : "Entity-Encoded HTML"}
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
            placeholder={
              mode === "encode"
                ? "Enter text or HTML to encode..."
                : "Paste HTML with entities to decode..."
            }
            className="w-full h-56 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Output Result</label>
            {output && !error && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Download className="size-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>

          <div className="h-56 rounded-2xl border border-border bg-background p-4 overflow-y-auto font-mono text-xs whitespace-pre-wrap break-all">
            {error ? (
              <span className="text-destructive font-semibold">{output}</span>
            ) : output ? (
              <span className="text-foreground">{output}</span>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Code2 className="size-8 opacity-40" />
                <span>Result will appear here...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {output && !error && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          <span>
            Length: <strong className="text-foreground">{output.length}</strong>
          </span>
          <span>
            Words: <strong className="text-foreground">{words}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

export const HtmlEntityEncoderRuntime: ReadyToolRuntimeDefinition = {
  toolId: "html-entity-encoder",
  slug: "html-entity-encoder",
  categoryId: "web",
  icon: Code2,
  component: HtmlEntityEncoderTool,
  layoutDescription:
    "Escape special characters into named and numeric HTML entities, or decode entities back to readable text.",
};
