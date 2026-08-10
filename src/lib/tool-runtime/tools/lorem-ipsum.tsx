import { useState } from "react";
import { FileText, Copy, Check, RefreshCw, Download } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

const LOREM_WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "eu",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
];

function generateSentence(numWords: number = 10, startLorem: boolean = false): string {
  const words: string[] = [];
  if (startLorem) {
    words.push("Lorem", "ipsum", "dolor", "sit", "amet");
  }
  while (words.length < numWords) {
    const randomWord = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
    words.push(randomWord);
  }
  const result = words.slice(0, numWords).join(" ");
  return result.charAt(0).toUpperCase() + result.slice(1) + ".";
}

function generateParagraph(
  sentencesCount: number = 5,
  isFirst: boolean = false,
  startLorem: boolean = false,
): string {
  const sentences: string[] = [];
  for (let i = 0; i < sentencesCount; i++) {
    const wordCount = Math.floor(Math.random() * 8) + 6;
    const shouldStartLorem = isFirst && i === 0 && startLorem;
    sentences.push(generateSentence(wordCount, shouldStartLorem));
  }
  return sentences.join(" ");
}

function LoremIpsumTool() {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [wrapHtml, setWrapHtml] = useState(false);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    let result: string;
    if (unit === "paragraphs") {
      const paras: string[] = [];
      for (let i = 0; i < count; i++) {
        const para = generateParagraph(5, i === 0, startWithLorem);
        paras.push(wrapHtml ? `<p>${para}</p>` : para);
      }
      result = paras.join(wrapHtml ? "\n\n" : "\n\n");
    } else if (unit === "sentences") {
      const sents: string[] = [];
      for (let i = 0; i < count; i++) {
        sents.push(generateSentence(8, i === 0 && startWithLorem));
      }
      result = sents.join(" ");
    } else {
      const words: string[] = [];
      if (startWithLorem) {
        words.push("Lorem", "ipsum", "dolor", "sit", "amet");
      }
      while (words.length < count) {
        words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      }
      result = words.slice(0, count).join(" ");
    }
    setOutput(result);
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
    a.download = "lorem-ipsum.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Count</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Type</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as "paragraphs" | "sentences" | "words")}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </div>

        <div className="space-y-2 pb-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground font-medium">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            Start with "Lorem ipsum..."
          </label>
          {unit === "paragraphs" && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground font-medium">
              <input
                type="checkbox"
                checked={wrapHtml}
                onChange={(e) => setWrapHtml(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              Wrap in &lt;p&gt; tags
            </label>
          )}
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="size-3.5" />
          Generate Text
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            Generated Placeholder Text
          </label>
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
                Download .txt
              </button>
            </div>
          )}
        </div>

        <div className="min-h-56 max-h-96 rounded-2xl border border-border bg-background p-4 overflow-y-auto text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {output || (
            <div className="h-44 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <FileText className="size-8 opacity-40" />
              <span>Click "Generate Text" to create dummy text.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const LoremIpsumRuntime: ReadyToolRuntimeDefinition = {
  toolId: "lorem-ipsum",
  slug: "lorem-ipsum",
  categoryId: "utilities",
  icon: FileText,
  component: LoremIpsumTool,
  layoutDescription:
    "Generate placeholder text by paragraphs, sentences, or words with optional HTML formatting.",
};
