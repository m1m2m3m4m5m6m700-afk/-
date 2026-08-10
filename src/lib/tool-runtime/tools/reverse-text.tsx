import { useState } from "react";
import { FlipHorizontal2, Copy, Check, RotateCcw, Download, FileText } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

type ReverseMode = "chars" | "words" | "lines";

function ReverseTextTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<ReverseMode>("chars");
  const [copied, setCopied] = useState(false);

  const handleProcess = () => {
    if (!input) {
      setOutput("");
      return;
    }
    if (mode === "chars") {
      setOutput([...input].reverse().join(""));
    } else if (mode === "words") {
      setOutput(input.split(/\s+/).reverse().join(" "));
    } else {
      setOutput(input.split(/\r?\n/).reverse().join("\n"));
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
    a.download = "reversed-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setCopied(false);
  };

  const modes: { id: ReverseMode; label: string }[] = [
    { id: "chars", label: "Characters" },
    { id: "words", label: "Words" },
    { id: "lines", label: "Lines" },
  ];

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex rounded-xl border border-border p-1 bg-background">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                mode === m.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleProcess}
          disabled={!input}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <FlipHorizontal2 className="size-3.5" />
          Reverse Text
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
            placeholder="Type or paste text to reverse..."
            className="w-full h-72 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Reversed Output</label>
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
          <div className="h-72 rounded-2xl border border-border bg-background p-4 overflow-auto font-mono text-xs">
            {output ? (
              <pre className="text-foreground whitespace-pre-wrap break-all">{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileText className="size-8 opacity-40" />
                <span>Reversed text will appear here.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const ReverseTextRuntime: ReadyToolRuntimeDefinition = {
  toolId: "reverse-text",
  slug: "reverse-text",
  categoryId: "utilities",
  icon: FlipHorizontal2,
  component: ReverseTextTool,
  layoutDescription: "Reverse text by characters, words, or entire lines instantly.",
};
