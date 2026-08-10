import { useState } from "react";
import { Braces, Copy, Check, RotateCcw, Download, AlertCircle, FileCode2 } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function formatXml(input: string, indent: string): string {
  const PAD = indent;
  const xml = input.replace(/>\s*</g, "><").trim();
  let formatted = "";
  let pad = 0;
  const tokens = xml.split(/(<[^>]+>)/g).filter(Boolean);
  for (const token of tokens) {
    if (!token) continue;
    if (token.startsWith("</")) {
      pad = Math.max(0, pad - 1);
      formatted += PAD.repeat(pad) + token + "\n";
    } else if (token.startsWith("<")) {
      const isSelfClosing = token.endsWith("/>");
      const isComment = token.startsWith("<!--");
      const isDoctype = token.startsWith("<!");
      const isCdata = token.startsWith("<![CDATA[");
      const hasInnerContent = !isSelfClosing && !isComment && !isDoctype && !isCdata;
      formatted += PAD.repeat(pad) + token;
      if (isSelfClosing || isComment || isDoctype || isCdata) {
        formatted += "\n";
      } else if (hasInnerContent) {
        formatted += "\n";
        pad++;
      } else {
        formatted += "\n";
      }
    } else {
      const text = token.trim();
      if (text) {
        formatted = formatted.trimEnd() + (formatted.endsWith(">") ? "" : "") + token.trim() + "\n";
      }
    }
  }
  return formatted.trim();
}

function XmlFormatterTool() {
  const [input, setInput] = useState(
    `<note><to>Flixo</to><from>User</from><heading>Reminder</heading><body>Format XML neatly</body></note>`,
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState<number | "tab">(2);
  const [copied, setCopied] = useState(false);

  const validateXml = (text: string): string | null => {
    if (!text.trim()) return "Input is empty.";
    const opens = (text.match(/<[^/!?][^>]*[^/]>/g) ?? []).filter(
      (t) => !t.endsWith("/>") && !t.startsWith("<?") && !t.startsWith("<!"),
    ).length;
    const closes = (text.match(/<\/[^>]+>/g) ?? []).length;
    const selfClosing = (text.match(/<[^>]+\/>/g) ?? []).length;
    void selfClosing;
    if (opens !== closes) {
      return `Tag mismatch: ${opens} opening vs ${closes} closing tags.`;
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "application/xml");
      const parseError = doc.querySelector("parsererror");
      if (parseError) {
        return parseError.textContent?.split("\n")[0] || "Malformed XML detected.";
      }
    } catch (err) {
      return (err as Error).message || "Unable to parse XML.";
    }
    return null;
  };

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    const err = validateXml(input);
    if (err) {
      setError(err);
      setOutput("");
      return;
    }
    const space = indent === "tab" ? "\t" : " ".repeat(indent);
    try {
      setOutput(formatXml(input, space));
      setError(null);
    } catch (e) {
      setError((e as Error).message || "Formatting failed.");
      setOutput("");
    }
  };

  const handleMinify = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    const err = validateXml(input);
    if (err) {
      setError(err);
      setOutput("");
      return;
    }
    setOutput(input.replace(/>\s+</g, "><").trim());
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
    const blob = new Blob([data], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.xml";
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
            <Braces className="size-3.5" />
            Beautify XML
          </button>
          <button
            type="button"
            onClick={handleMinify}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Minify XML
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Input XML</label>
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
            placeholder="<root><item>value</item></root>"
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
                  <div className="font-semibold text-xs">XML Error Detected</div>
                  <div className="text-[11px] opacity-90 mt-0.5">{error}</div>
                </div>
              </div>
            ) : output ? (
              <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileCode2 className="size-8 opacity-40" />
                <span>Click "Beautify XML" to format output.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const XmlFormatterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "xml-formatter",
  slug: "xml-formatter",
  categoryId: "utilities",
  icon: FileCode2,
  component: XmlFormatterTool,
  layoutDescription: "Beautify, minify, and validate XML with custom indentation options.",
};
