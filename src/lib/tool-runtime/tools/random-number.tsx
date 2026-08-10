import { useState } from "react";
import { Dices, Copy, Check, RotateCcw, Download } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function RandomNumberTool() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(false);
  const [decimals, setDecimals] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = () => {
    const lo = Number(min);
    const hi = Number(max);
    const n = Math.max(1, Math.min(1000, Math.floor(Number(count) || 1)));
    const dp = Math.max(0, Math.min(6, Math.floor(Number(decimals) || 0)));

    if (Number.isNaN(lo) || Number.isNaN(hi)) {
      setError("Min and Max must be valid numbers.");
      setResults([]);
      return;
    }
    if (lo >= hi) {
      setError("Min must be less than Max.");
      setResults([]);
      return;
    }
    setError(null);

    const factor = Math.pow(10, dp);
    const span = (hi - lo) * factor;
    const poolSize = Math.floor(span) + 1;

    if (unique && n > poolSize) {
      setError(`Cannot generate ${n} unique values in this range. Increase the range or count.`);
      setResults([]);
      return;
    }

    const out: number[] = [];
    if (unique) {
      const pool = Array.from({ length: poolSize }, (_, i) => lo + i / factor);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      out.push(...pool.slice(0, n));
    } else {
      for (let i = 0; i < n; i++) {
        out.push(lo + Math.random() * (hi - lo));
      }
    }

    setResults(out.map((v) => (dp === 0 ? Math.round(v) : Number(v.toFixed(dp)))));
  };

  const text = results.join("\n");

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "random-numbers.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Min</label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Max</label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Count</label>
          <input
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Decimals</label>
          <input
            type="number"
            min={0}
            max={6}
            value={decimals}
            onChange={(e) => setDecimals(Number(e.target.value))}
            className="w-24 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={unique}
            onChange={(e) => setUnique(e.target.checked)}
            className="size-4 rounded border-border accent-primary"
          />
          Unique values only
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Dices className="size-3.5" />
          Generate
        </button>
        {results.length > 0 && (
          <>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <Download className="size-3.5" />
              Download
            </button>
            <button
              type="button"
              onClick={() => setResults([])}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="size-3.5" />
              Clear
            </button>
          </>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {results.length > 0 && (
        <div className="rounded-2xl border border-border bg-background p-4">
          <pre className="max-h-72 overflow-auto font-mono text-sm text-foreground whitespace-pre-wrap">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}

export const RandomNumberRuntime: ReadyToolRuntimeDefinition = {
  toolId: "random-number",
  slug: "random-number",
  categoryId: "utilities",
  icon: Dices,
  component: RandomNumberTool,
  layoutDescription:
    "Generate random numbers within a custom range with count, decimal precision, and unique-value options.",
};
