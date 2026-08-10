import { useState } from "react";
import { Shuffle, RotateCcw, Copy, Check, Dices } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function RandomNameTool() {
  const [input, setInput] = useState("Alice\nBob\nCharlie\nDiana\nEthan\nFiona");
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(true);
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handlePick = () => {
    const names = input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (names.length === 0) {
      setResults([]);
      return;
    }
    if (unique && count > names.length) {
      setResults([...names].sort(() => Math.random() - 0.5));
      return;
    }
    if (unique) {
      const shuffled = [...names].sort(() => Math.random() - 0.5);
      setResults(shuffled.slice(0, count));
    } else {
      setResults(
        Array.from({ length: count }, () => names[Math.floor(Math.random() * names.length)]),
      );
    }
  };

  const handleCopy = () => {
    if (!results.length) return;
    navigator.clipboard.writeText(results.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput("");
    setResults([]);
    setCount(1);
    setCopied(false);
  };

  const names = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            How many:
            <input
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={unique}
              onChange={(e) => setUnique(e.target.checked)}
              className="size-3.5 rounded border-border accent-primary"
            />
            No duplicates
          </label>
        </div>
        <button
          type="button"
          onClick={handlePick}
          disabled={names.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <Shuffle className="size-3.5" />
          Pick Random
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Names ({names.length})</label>
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
            placeholder={"Enter one name per line...\nAlice\nBob\nCharlie"}
            className="w-full h-64 rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Result</label>
            {results.length > 0 && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          <div className="h-64 rounded-2xl border border-border bg-background p-4 overflow-auto flex flex-col gap-2 justify-center">
            {results.length > 0 ? (
              results.map((name, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
                  <Dices className="size-4 text-primary shrink-0" />
                  <span className="text-sm font-semibold text-foreground">{name}</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Shuffle className="size-8 opacity-40" />
                <span>Randomly picked names will appear here.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const RandomNameRuntime: ReadyToolRuntimeDefinition = {
  toolId: "random-name",
  slug: "random-name",
  categoryId: "utilities",
  icon: Shuffle,
  component: RandomNameTool,
  layoutDescription:
    "Pick one or more random names from a custom list with optional duplicate-free selection.",
};
