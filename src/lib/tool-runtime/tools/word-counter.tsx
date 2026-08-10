import { useState } from "react";
import { Type, Copy, Check, RotateCcw, FileText, Clock, BarChart2 } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function WordCounterTool() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charsNoSpaces = text.replace(/\s+/g, "").length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0;
  const paragraphs = text.trim() ? text.split(/\n+/).filter(Boolean).length : 0;
  const readingTime = Math.ceil(words / 200); // avg 200 wpm
  const speakingTime = Math.ceil(words / 130); // avg 130 wpm

  // Word frequency calculation
  const wordFreq = text.trim()
    ? text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .reduce(
          (acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        )
    : {};

  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText("");
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-background p-4 flex items-center gap-3">
          <FileText className="size-8 text-primary shrink-0" />
          <div>
            <div className="text-2xl font-bold text-foreground">{words.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground font-medium">Total Words</div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4 flex items-center gap-3">
          <Type className="size-8 text-blue-500 shrink-0" />
          <div>
            <div className="text-2xl font-bold text-foreground">{characters.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground font-medium">
              Characters (with spaces)
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4 flex items-center gap-3">
          <BarChart2 className="size-8 text-emerald-500 shrink-0" />
          <div>
            <div className="text-2xl font-bold text-foreground">
              {charsNoSpaces.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Characters (no spaces)</div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4 flex items-center gap-3">
          <Clock className="size-8 text-amber-500 shrink-0" />
          <div>
            <div className="text-2xl font-bold text-foreground">{readingTime} min</div>
            <div className="text-xs text-muted-foreground font-medium">Reading Time</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Type or Paste Your Text</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!text}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-40"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy Text"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={!text}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive disabled:opacity-40"
            >
              <RotateCcw className="size-3.5" />
              Clear
            </button>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your document content here to see instant statistics..."
          className="w-full h-64 rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-2">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Detailed Structural Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm pt-1">
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground">Sentences:</span>
              <span className="font-semibold text-foreground">{sentences}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground">Paragraphs:</span>
              <span className="font-semibold text-foreground">{paragraphs}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground">Speaking Time:</span>
              <span className="font-semibold text-foreground">~{speakingTime} min</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground">Avg Word Length:</span>
              <span className="font-semibold text-foreground">
                {words > 0 ? (charsNoSpaces / words).toFixed(1) : 0} chars
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-2">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Top Keyword Density
          </h4>
          {topWords.length > 0 ? (
            <div className="space-y-1.5 pt-1 text-sm">
              {topWords.map(([word, freq]) => (
                <div key={word} className="flex items-center justify-between">
                  <span className="font-mono text-xs text-foreground">{word}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {((freq / words) * 100).toFixed(1)}%
                    </span>
                    <span className="font-semibold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {freq}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground pt-2">
              Word density breakdown will appear as you type.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export const WordCounterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "word-counter",
  slug: "word-counter",
  categoryId: "utilities",
  icon: Type,
  component: WordCounterTool,
  layoutDescription:
    "Count words, characters, sentences, paragraphs, and reading time in real time.",
};
