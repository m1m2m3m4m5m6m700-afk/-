import { useState, useMemo } from "react";
import { BarChart3, Copy, Check, RotateCcw, Download, FileText } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

type SortBy = "frequency" | "alphabetical";

function WordFrequencyTool() {
  const [input, setInput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("frequency");
  const [minLength, setMinLength] = useState(1);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    if (!input.trim()) return [] as { word: string; count: number }[];
    const words = input.match(/[A-Za-z0-9'\u0600-\u06FF]+/g) ?? [];
    const map = new Map<string, number>();
    for (const raw of words) {
      const word = caseSensitive ? raw : raw.toLowerCase();
      if (word.length < minLength) continue;
      map.set(word, (map.get(word) ?? 0) + 1);
    }
    const entries = Array.from(map.entries()).map(([word, count]) => ({ word, count }));
    if (sortBy === "frequency") {
      entries.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
    } else {
      entries.sort((a, b) => a.word.localeCompare(b.word));
    }
    return entries;
  }, [input, caseSensitive, sortBy, minLength]);

  const totalWords = useMemo(() => {
    const words = input.match(/[A-Za-z0-9'\u0600-\u06FF]+/g) ?? [];
    return words.length;
  }, [input]);

  const handleCopy = () => {
    if (!results.length) return;
    const text = results.map((r) => `${r.word}: ${r.count}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!results.length) return;
    const text = results.map((r) => `${r.word}: ${r.count}`).join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "word-frequency.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInput("");
    setCopied(false);
  };

  const maxCount = results[0]?.count ?? 1;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-xl border border-border p-1 bg-background">
            {(["frequency", "alphabetical"] as SortBy[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSortBy(s)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  sortBy === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "frequency" ? "By frequency" : "A → Z"}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="size-3.5 rounded border-border accent-primary"
            />
            Case-sensitive
          </label>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            Min length:
            <input
              type="number"
              min={1}
              value={minLength}
              onChange={(e) => setMinLength(Math.max(1, Number(e.target.value) || 1))}
              className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </label>
        </div>
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
            placeholder="Paste text to analyze word frequency..."
            className="w-full h-72 rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              Frequency ({results.length} unique / {totalWords} total)
            </label>
            {results.length > 0 && (
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
          <div className="h-72 rounded-2xl border border-border bg-background p-4 overflow-auto">
            {results.length > 0 ? (
              <ul className="space-y-1.5">
                {results.slice(0, 200).map((r) => (
                  <li key={r.word} className="flex items-center gap-2 text-xs">
                    <span className="w-32 shrink-0 truncate font-mono text-foreground">
                      {r.word}
                    </span>
                    <div className="flex-1 h-4 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary/70"
                        style={{ width: `${(r.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right font-semibold text-foreground">
                      {r.count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileText className="size-8 opacity-40" />
                <span>Word frequency will appear here.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const WordFrequencyRuntime: ReadyToolRuntimeDefinition = {
  toolId: "word-frequency",
  slug: "word-frequency",
  categoryId: "utilities",
  icon: BarChart3,
  component: WordFrequencyTool,
  layoutDescription:
    "Analyze word frequency in any text with sorting, case sensitivity, and minimum length filters.",
};
