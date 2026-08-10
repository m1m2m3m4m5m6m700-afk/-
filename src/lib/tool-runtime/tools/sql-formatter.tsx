import { useState } from "react";
import { Database, Copy, Check, RotateCcw, Download, AlertCircle, FileText } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

const KEYWORDS = new Set([
  "select",
  "from",
  "where",
  "and",
  "or",
  "not",
  "in",
  "is",
  "null",
  "like",
  "between",
  "exists",
  "group",
  "by",
  "order",
  "having",
  "asc",
  "desc",
  "limit",
  "offset",
  "insert",
  "into",
  "values",
  "update",
  "set",
  "delete",
  "create",
  "table",
  "alter",
  "add",
  "drop",
  "column",
  "index",
  "view",
  "join",
  "inner",
  "left",
  "right",
  "outer",
  "full",
  "cross",
  "on",
  "using",
  "union",
  "all",
  "distinct",
  "as",
  "case",
  "when",
  "then",
  "else",
  "end",
  "with",
  "recursive",
  "primary",
  "key",
  "foreign",
  "references",
  "default",
  "constraint",
  "unique",
  "check",
  "begin",
  "commit",
  "rollback",
  "transaction",
  "if",
  "exists",
  "replace",
  "truncate",
  "grant",
  "revoke",
  "explain",
]);

function tokenizeSql(sql: string): string[] {
  // Split into tokens keeping quoted strings, parens, commas, semicolons, and words.
  const tokens: string[] = [];
  const regex = /('(?:[^']|'')*')|("(?:[^"]|"")*")|(\s+)|([(),;])|([^\s(),;]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(sql)) !== null) {
    if (match[1] || match[2] || match[4] || match[5]) {
      tokens.push(match[0]);
    }
  }
  return tokens;
}

function formatSql(input: string, indent: string): string {
  const tokens = tokenizeSql(input);
  const lines: string[] = [];
  let depth = 0;
  let current = "";
  const pushLine = () => {
    if (current.trim()) lines.push(indent.repeat(depth) + current.trim());
    current = "";
  };
  const newlineBefore = new Set([
    "select",
    "from",
    "where",
    "and",
    "or",
    "group",
    "order",
    "having",
    "limit",
    "offset",
    "union",
    "insert",
    "into",
    "values",
    "set",
    "update",
    "delete",
    "create",
    "left",
    "right",
    "inner",
    "outer",
    "full",
    "cross",
    "join",
  ]);
  const indentKeywords = new Set([
    "select",
    "case",
    "when",
    "from",
    "where",
    "and",
    "or",
    "on",
    "set",
    "values",
  ]);

  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i];
    const lower = raw.toLowerCase();
    const isKeyword = KEYWORDS.has(lower);

    if (raw === "(") {
      current += " (";
      // Keep inline for function calls; indent for subqueries handled by keywords.
    } else if (raw === ")") {
      pushLine();
      current = ")";
      pushLine();
    } else if (raw === ",") {
      current += ",";
      pushLine();
    } else if (raw === ";") {
      pushLine();
      lines.push(";");
    } else if (isKeyword && newlineBefore.has(lower) && current.trim()) {
      pushLine();
      if (indentKeywords.has(lower)) depth = Math.max(0, depth);
      current = lower;
    } else if (isKeyword) {
      current += (current ? " " : "") + lower;
    } else {
      current += (current && !current.endsWith("(") ? " " : "") + raw;
    }
  }
  pushLine();
  void indent;
  return lines.join("\n").trim();
}

function SqlFormatterTool() {
  const [input, setInput] = useState(
    `select id,name,email from users where status='active' and age>18 order by name asc limit 10;`,
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState<number | "tab">(2);
  const [uppercase, setUppercase] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    const space = indent === "tab" ? "\t" : " ".repeat(indent);
    try {
      let formatted = formatSql(input, space);
      if (uppercase) {
        formatted = formatted.replace(/\b([a-z]+)\b/g, (word) =>
          KEYWORDS.has(word.toLowerCase()) ? word.toUpperCase() : word,
        );
      }
      setOutput(formatted);
      setError(null);
    } catch (err) {
      setError((err as Error).message || "Formatting failed.");
      setOutput("");
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    setOutput(input.replace(/\s+/g, " ").trim());
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
    const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.sql";
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
        <div className="flex items-center gap-4">
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
                  {opt === "tab" ? "Tab" : `${opt} Sp`}
                </button>
              ))}
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="size-3.5 rounded border-border accent-primary"
            />
            Uppercase keywords
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFormat}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Database className="size-3.5" />
            Beautify SQL
          </button>
          <button
            type="button"
            onClick={handleMinify}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Minify SQL
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Input SQL</label>
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
            placeholder="SELECT * FROM table WHERE id = 1;"
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
                  <div className="font-semibold text-xs">SQL Error Detected</div>
                  <div className="text-[11px] opacity-90 mt-0.5">{error}</div>
                </div>
              </div>
            ) : output ? (
              <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileText className="size-8 opacity-40" />
                <span>Click "Beautify SQL" to format output.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const SqlFormatterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "sql-formatter",
  slug: "sql-formatter",
  categoryId: "developer",
  icon: Database,
  component: SqlFormatterTool,
  layoutDescription:
    "Beautify and minify SQL queries with keyword uppercasing and configurable indentation.",
};
