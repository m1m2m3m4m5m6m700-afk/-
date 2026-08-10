import { useState } from "react";
import { FileJson, Copy, Check, RotateCcw, Download, AlertCircle, FileText } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

type IndentValue = 2 | 4;

function parseValue(raw: string): unknown {
  const v = raw.trim();
  if (v === "") return null;
  if (v === "null" || v === "~" || v === "Null" || v === "NULL") return null;
  if (v === "true" || v === "True" || v === "TRUE") return true;
  if (v === "false" || v === "False" || v === "FALSE") return false;
  if (/^-?\d+$/.test(v)) return Number(v);
  if (/^-?\d+\.\d+$/.test(v)) return Number(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => parseValue(item.trim()));
  }
  if (v.startsWith("{") && v.endsWith("}")) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return {};
    const obj: Record<string, unknown> = {};
    for (const pair of inner.split(",")) {
      const [k, val] = pair.split(":");
      if (k) obj[k.trim()] = parseValue(val?.trim() ?? "");
    }
    return obj;
  }
  return v;
}

function parseYaml(input: string): unknown {
  const lines = input.split(/\r?\n/);
  const result: Record<string, unknown> = {};
  const stack: { indent: number; obj: Record<string, unknown> }[] = [{ indent: -1, obj: result }];

  for (const rawLine of lines) {
    if (!rawLine.trim() || rawLine.trim().startsWith("#")) continue;
    const indent = rawLine.length - rawLine.trimStart().length;
    const line = rawLine.trim();
    if (!line.includes(":")) continue;
    const colonIdx = line.indexOf(":");
    const key = line.slice(0, colonIdx).trim();
    const valuePart = line.slice(colonIdx + 1).trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].obj;

    if (valuePart === "") {
      const child: Record<string, unknown> = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else {
      parent[key] = parseValue(valuePart);
    }
  }
  return result;
}

function stringifyValue(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (/[:#{}[\],&*?|<>=!%@`"'\\\n]/.test(value) || value.trim() !== value) {
      return JSON.stringify(value);
    }
    return value;
  }
  return String(value);
}

function toYaml(obj: Record<string, unknown>, indent: string, depth: number): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      lines.push(`${indent.repeat(depth)}${key}:`);
      lines.push(toYaml(value as Record<string, unknown>, indent, depth + 1));
    } else if (Array.isArray(value)) {
      lines.push(`${indent.repeat(depth)}${key}:`);
      for (const item of value) {
        if (item !== null && typeof item === "object") {
          lines.push(`${indent.repeat(depth + 1)}- ` + JSON.stringify(item));
        } else {
          lines.push(`${indent.repeat(depth + 1)}- ${stringifyValue(item)}`);
        }
      }
    } else {
      lines.push(`${indent.repeat(depth)}${key}: ${stringifyValue(value)}`);
    }
  }
  return lines.join("\n");
}

function YamlFormatterTool() {
  const [input, setInput] = useState(
    `name: Flixo\nversion: 2.6\nfeatures:\n  - fast\n  - private\n  - free\nmetadata:\n  author: Flixo Team\n  licensed: true\n`,
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState<IndentValue>(2);
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const parsed = parseYaml(input);
      const space = " ".repeat(indent);
      setOutput(toYaml(parsed as Record<string, unknown>, space, 0));
      setError(null);
    } catch (err) {
      setError((err as Error).message || "Invalid YAML syntax.");
      setOutput("");
    }
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
    const blob = new Blob([data], { type: "application/x-yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.yaml";
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
            {([2, 4] as IndentValue[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setIndent(opt)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  indent === opt
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt} Spaces
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={handleFormat}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <FileJson className="size-3.5" />
          Beautify YAML
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Input YAML</label>
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
            placeholder={"key: value\nnested:\n  child: 1"}
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
                  <div className="font-semibold text-xs">YAML Error Detected</div>
                  <div className="text-[11px] opacity-90 mt-0.5">{error}</div>
                </div>
              </div>
            ) : output ? (
              <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileText className="size-8 opacity-40" />
                <span>Click "Beautify YAML" to format output.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const YamlFormatterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "yaml-formatter",
  slug: "yaml-formatter",
  categoryId: "developer",
  icon: FileJson,
  component: YamlFormatterTool,
  layoutDescription: "Beautify and normalize YAML with configurable indentation and validation.",
};
