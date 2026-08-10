import { useState } from "react";
import { GitCompareArrows, Copy, Check, RotateCcw, Download, FileText } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

interface DiffLine {
  type: "equal" | "added" | "removed";
  text: string;
  leftNum: number | null;
  rightNum: number | null;
}

function computeLcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  return dp;
}

function diffLines(a: string[], b: string[]): DiffLine[] {
  const dp = computeLcs(a, b);
  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let leftNum = 0;
  let rightNum = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      leftNum++;
      rightNum++;
      result.push({ type: "equal", text: a[i], leftNum, rightNum });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      leftNum++;
      result.push({ type: "removed", text: a[i], leftNum, rightNum: null });
      i++;
    } else {
      rightNum++;
      result.push({ type: "added", text: b[j], leftNum: null, rightNum });
      j++;
    }
  }
  while (i < a.length) {
    leftNum++;
    result.push({ type: "removed", text: a[i], leftNum, rightNum: null });
    i++;
  }
  while (j < b.length) {
    rightNum++;
    result.push({ type: "added", text: b[j], leftNum: null, rightNum });
    j++;
  }
  return result;
}

function TextCompareTool() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [diff, setDiff] = useState<DiffLine[] | null>(null);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [copied, setCopied] = useState(false);

  const normalize = (line: string) => {
    let v = line;
    if (ignoreCase) v = v.toLowerCase();
    if (ignoreWhitespace) v = v.replace(/\s+/g, " ").trim();
    return v;
  };

  const handleCompare = () => {
    if (!left && !right) {
      setDiff([]);
      return;
    }
    const aLines = left.split(/\r?\n/).map(normalize);
    const bLines = right.split(/\r?\n/).map(normalize);
    const aRaw = left.split(/\r?\n/);
    const bRaw = right.split(/\r?\n/);
    const result = diffLines(aLines, bLines);
    // Restore raw text for display while keeping normalized comparison.
    let ai = 0;
    let bi = 0;
    const mapped = result.map((line) => {
      let raw: string;
      if (line.type === "equal") {
        raw = aRaw[ai] ?? bRaw[bi] ?? "";
        ai++;
        bi++;
      } else if (line.type === "removed") {
        raw = aRaw[ai] ?? "";
        ai++;
      } else {
        raw = bRaw[bi] ?? "";
        bi++;
      }
      return { ...line, text: raw };
    });
    setDiff(mapped);
  };

  const handleCopy = () => {
    if (!diff) return;
    const text = diff
      .map((l) => `${l.type === "added" ? "+ " : l.type === "removed" ? "- " : "  "}${l.text}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!diff) return;
    const text = diff
      .map((l) => `${l.type === "added" ? "+ " : l.type === "removed" ? "- " : "  "}${l.text}`)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text-diff.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setLeft("");
    setRight("");
    setDiff(null);
    setCopied(false);
  };

  const added = diff?.filter((l) => l.type === "added").length ?? 0;
  const removed = diff?.filter((l) => l.type === "removed").length ?? 0;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="size-3.5 rounded border-border accent-primary"
            />
            Ignore case
          </label>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="size-3.5 rounded border-border accent-primary"
            />
            Ignore whitespace
          </label>
        </div>
        <button
          type="button"
          onClick={handleCompare}
          disabled={!left && !right}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <GitCompareArrows className="size-3.5" />
          Compare Texts
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Original Text</label>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Paste the original text here..."
            className="w-full h-56 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Modified Text</label>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Paste the modified text here..."
            className="w-full h-56 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            Differences
            {diff && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                +{added} added · −{removed} removed
              </span>
            )}
          </label>
          <div className="flex items-center gap-3">
            {diff && diff.length > 0 && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
            {diff && diff.length > 0 && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                <Download className="size-3.5" />
                Download
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
          </div>
        </div>
        <div className="min-h-[14rem] rounded-2xl border border-border bg-background p-2 overflow-auto font-mono text-xs">
          {diff ? (
            diff.length > 0 ? (
              <table className="w-full border-collapse">
                <tbody>
                  {diff.map((line, index) => (
                    <tr
                      key={index}
                      className={
                        line.type === "added"
                          ? "bg-emerald-500/10"
                          : line.type === "removed"
                            ? "bg-destructive/10"
                            : ""
                      }
                    >
                      <td className="w-8 select-none text-right text-muted-foreground/60 px-2 py-0.5 align-top">
                        {line.leftNum ?? ""}
                      </td>
                      <td className="w-8 select-none text-right text-muted-foreground/60 px-2 py-0.5 align-top">
                        {line.rightNum ?? ""}
                      </td>
                      <td className="w-4 select-none px-1 py-0.5 align-top text-muted-foreground">
                        {line.type === "added" ? "+" : line.type === "removed" ? "−" : ""}
                      </td>
                      <td className="px-2 py-0.5 align-top text-foreground whitespace-pre-wrap break-all">
                        {line.text || "\u00A0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileText className="size-8 opacity-40" />
                <span>The two texts are identical.</span>
              </div>
            )
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <FileText className="size-8 opacity-40" />
              <span>Line-by-line differences will appear here.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const TextCompareRuntime: ReadyToolRuntimeDefinition = {
  toolId: "text-compare",
  slug: "text-compare",
  categoryId: "utilities",
  icon: GitCompareArrows,
  component: TextCompareTool,
  layoutDescription:
    "Compare two text blocks line by line and highlight additions, removals, and matches.",
};
