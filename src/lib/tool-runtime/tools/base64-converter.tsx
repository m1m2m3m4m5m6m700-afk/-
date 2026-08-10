import { useState } from "react";
import { Binary, Copy, Check, RotateCcw, Download, Upload } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function Base64ConverterTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("Hello, Flixo!");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      if (mode === "encode") {
        // UTF-8 base64 encoding
        const bytes = new TextEncoder().encode(input);
        const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
        setOutput(btoa(binString));
      } else {
        // UTF-8 base64 decoding
        const binString = atob(input.trim());
        const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
        setOutput(new TextDecoder().decode(bytes));
      }
    } catch {
      setError("Invalid Base64 sequence or encoding error.");
      setOutput("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (mode === "encode") {
        setInput(result);
        handleConvert();
      }
    };
    if (mode === "encode") {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
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
    a.download = `base64-${mode}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex rounded-xl border border-border p-1 bg-background">
          <button
            type="button"
            onClick={() => {
              setMode("encode");
              setError(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              mode === "encode"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Encode Text / File to Base64
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("decode");
              setError(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              mode === "decode"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Decode Base64 to Text
          </button>
        </div>

        <button
          type="button"
          onClick={handleConvert}
          className="px-5 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Convert Now
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              {mode === "encode" ? "Input String or File" : "Input Base64 String"}
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-xs text-primary hover:underline font-medium inline-flex items-center gap-1">
                <Upload className="size-3" />
                Upload File
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                type="button"
                onClick={() => {
                  setInput("");
                  setOutput("");
                  setError(null);
                }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="size-3" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            placeholder={mode === "encode" ? "Type or paste text..." : "Paste Base64 string..."}
            className="w-full h-64 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Output</label>
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

          <div className="h-64 rounded-2xl border border-border bg-background p-4 overflow-y-auto font-mono text-xs whitespace-pre-wrap break-all">
            {error ? (
              <span className="text-destructive font-semibold">{error}</span>
            ) : output ? (
              output
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Binary className="size-8 opacity-40" />
                <span>Result will appear here...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Base64ConverterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "base64-converter",
  slug: "base64-converter",
  categoryId: "converters",
  icon: Binary,
  component: Base64ConverterTool,
  layoutDescription:
    "Encode text and files into Base64 strings, or decode Base64 back into readable text.",
};
