import { useState } from "react";
import { CheckCircle2, AlertCircle, Copy, Check, RotateCcw } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function JsonValidatorTool() {
  const [input, setInput] = useState(
    `{\n  "title": "JSON Validator",\n  "status": "active",\n  "count": 42\n}`,
  );
  const [copied, setCopied] = useState(false);

  let isValid = false;
  let errorMessage: string | null = null;
  let parsedObject: unknown = null;

  if (input.trim()) {
    try {
      parsedObject = JSON.parse(input);
      isValid = true;
    } catch (err) {
      isValid = false;
      errorMessage = (err as Error).message || "Invalid JSON syntax";
    }
  }

  const handleCopy = () => {
    if (!input) return;
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          {input.trim() ? (
            isValid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="size-4" /> Valid JSON
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <AlertCircle className="size-4" /> Invalid JSON Syntax
              </span>
            )
          ) : (
            <span className="text-xs text-muted-foreground font-medium">
              Enter JSON below to validate
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!input}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium disabled:opacity-40"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => setInput("")}
            disabled={!input}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" />
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">JSON Input & Linting</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste JSON string here..."
          className={`w-full h-64 rounded-2xl border p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 resize-none transition-colors ${
            input.trim()
              ? isValid
                ? "border-emerald-500/50 bg-background focus:ring-emerald-500/30"
                : "border-rose-500/50 bg-rose-500/5 focus:ring-rose-500/30"
              : "border-border bg-background focus:ring-primary/50"
          }`}
        />
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-500">Syntax Error Details</h4>
            <p className="text-xs font-mono text-foreground/90">{errorMessage}</p>
          </div>
        </div>
      )}

      {isValid && parsedObject !== null && (
        <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-2">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Structure Info
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Type:</span>{" "}
              <span className="font-semibold text-foreground">
                {Array.isArray(parsedObject) ? "Array" : typeof parsedObject}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Top Keys:</span>{" "}
              <span className="font-semibold text-foreground">
                {typeof parsedObject === "object" && parsedObject !== null
                  ? Object.keys(parsedObject).length
                  : 1}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Byte Size:</span>{" "}
              <span className="font-semibold text-foreground">{new Blob([input]).size} bytes</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const JsonValidatorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "json-validator",
  slug: "json-validator",
  categoryId: "developer",
  icon: CheckCircle2,
  component: JsonValidatorTool,
  layoutDescription:
    "Validate JSON structure, detect syntax errors, and inspect key data types instantly.",
};
