import { useState } from "react";
import { ListOrdered, Copy, Check, RotateCcw, Download, FileText } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

type Separator = "." | ")" | ":" | "|";
type StartMode = "1" | "0";

function AddLineNumbersTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [separator, setSeparator] = useState<Separator>(".");
  const [startMode, setStartMode] = useState<StartMode>("1");
  const [pad, setPad] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleProcess = () => {
    if (!input) {
      setOutput("");
      return;
    }
    const lines = input.split(/\r?\n/);
    const start = startMode === "1" ? 1 : 0;
    const width = pad ? String(start + lines.length - 1).length : 0;
    const result = lines.map((line, index) => {
      const num = String(start + index);
      const padded = pad ? num.padStart(width, " ") : num;
      return `${padded}${separator} ${line}`;
    });
    setOutput(result.join("\n"));
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
    a.download = "numbered-lines.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setCopied(false);
  };

  const separators: { id: Separator; label: string }[] = [
    { id: ".", label: "1." },
    { id: ")", label: "1)" },
    { id: ":", label: "1:" },
    { id: "|", label: "1 |" },
  ];

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-xl border border-border p-1 bg-background">
            {separators.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSeparator(s.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  separator === s.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-xl border border-border p-1 bg-background">
            {(["1", "0"] as StartMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setStartMode(m)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  startMode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Start at {m}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={pad}
              onChange={(e) => setPad(e.target.checked)}
              className="size-3.5 rounded border-border accent-primary"
            />
            Pad numbers
          </label>
        </div>
        <button
          type="button"
          onClick={handleProcess}
          disabled={!input}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <ListOrdered className="size-3.5" />
          Add Line Numbers
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
            placeholder={"Paste text to number...\nFirst line\nSecond line\nThird line"}
            className="w-full h-72 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Numbered Output</label>
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
              <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileText className="size-8 opacity-40" />
                <span>Numbered text will appear here.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const AddLineNumbersRuntime: ReadyToolRuntimeDefinition = {
  toolId: "add-line-numbers",
  slug: "add-line-numbers",
  categoryId: "utilities",
  icon: ListOrdered,
  component: AddLineNumbersTool,
  layoutDescription:
    "Add sequential line numbers to any text with custom separators, padding, and start offset.",
};
