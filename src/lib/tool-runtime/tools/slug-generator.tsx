import { useMemo, useState } from "react";
import { Link2, Copy, Check, Download, RotateCcw } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

type Separator = "hyphen" | "underscore" | "dot";
type CaseMode = "lower" | "upper" | "preserve";

function transliterate(input: string): string {
  // Strip Arabic tashkeel (diacritics/harakat) before processing so vocalized
  // Arabic text does not leave stray combining marks in the slug.
  const withoutTashkeel = input.replace(
    /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g,
    "",
  );

  // Common Latin-1 / extended accented chars → ASCII equivalents.
  const map: Record<string, string> = {
    à: "a",
    á: "a",
    â: "a",
    ã: "a",
    ä: "ae",
    å: "a",
    æ: "ae",
    ç: "c",
    è: "e",
    é: "e",
    ê: "e",
    ë: "e",
    ì: "i",
    í: "i",
    î: "i",
    ï: "i",
    ñ: "n",
    ò: "o",
    ó: "o",
    ô: "o",
    õ: "o",
    ö: "oe",
    ø: "o",
    ù: "u",
    ú: "u",
    û: "u",
    ü: "ue",
    ý: "y",
    ÿ: "y",
    ß: "ss",
    œ: "oe",
    ð: "d",
    þ: "th",
  };
  // Match non-ASCII characters (U+0080 and above) for transliteration.
  return withoutTashkeel.replace(/[\u0080-\uFFFF]/g, (char) => {
    const lower = char.toLowerCase();
    if (map[lower]) {
      const replacement = map[lower];
      return char === lower
        ? replacement
        : replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    // Arabic letters, CJK and other non-ASCII script characters fall back to
    // removal; the separator logic then collapses the resulting gaps.
    return "";
  });
}

function slugify(
  text: string,
  separator: Separator,
  caseMode: CaseMode,
  options: { stripStopWords: boolean; allowNumbers: boolean; maxLength: number },
): string {
  if (!text) return "";

  let working = transliterate(text);

  // Replace any non-alphanumeric run with the chosen separator.
  const sep = separator === "hyphen" ? "-" : separator === "underscore" ? "_" : ".";
  const numberClass = options.allowNumbers ? "0-9" : "";
  working = working.replace(new RegExp(`[^a-zA-Z${numberClass}]+`, "g"), sep);

  // Optional stop-word stripping (English only, lightweight list).
  if (options.stripStopWords) {
    const stopWords = new Set([
      "a",
      "an",
      "and",
      "the",
      "of",
      "to",
      "in",
      "on",
      "at",
      "for",
      "is",
      "are",
      "as",
      "by",
      "or",
      "with",
      "this",
      "that",
      "it",
      "be",
      "from",
    ]);
    working = working
      .split(sep)
      .filter((word) => word && !stopWords.has(word.toLowerCase()))
      .join(sep);
  }

  // Trim leading/trailing separators and collapse repeats.
  working = working.replace(new RegExp(`(${escapeRegex(sep)})\\1+`, "g"), sep);
  working = working.replace(new RegExp(`^\\${sep}+|\\${sep}+$`, "g"), "");

  if (caseMode === "lower") working = working.toLowerCase();
  else if (caseMode === "upper") working = working.toUpperCase();

  if (options.maxLength > 0 && working.length > options.maxLength) {
    const truncated = working.slice(0, options.maxLength);
    working = truncated.replace(new RegExp(`\\${sep}[^${sep}]*$`), "");
  }

  return working;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function SlugGeneratorTool() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState<Separator>("hyphen");
  const [caseMode, setCaseMode] = useState<CaseMode>("lower");
  const [stripStopWords, setStripStopWords] = useState(false);
  const [allowNumbers, setAllowNumbers] = useState(true);
  const [maxLength, setMaxLength] = useState(0);
  const [copied, setCopied] = useState(false);

  const slug = useMemo(
    () =>
      slugify(input, separator, caseMode, {
        stripStopWords,
        allowNumbers,
        maxLength,
      }),
    [input, separator, caseMode, stripStopWords, allowNumbers, maxLength],
  );

  const words = useMemo(
    () =>
      slug
        ? slug
            .split(separator === "hyphen" ? "-" : separator === "underscore" ? "_" : ".")
            .filter(Boolean)
        : [],
    [slug, separator],
  );

  const handleCopy = () => {
    if (!slug) return;
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!slug) return;
    const blob = new Blob([slug], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slug.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput("");
    setCopied(false);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">Text to slugify</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 10 Best Coffee Recipes for Busy Mornings!"
          rows={3}
          className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{input.length} characters</span>
          {input && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Separator</label>
          <select
            value={separator}
            onChange={(e) => setSeparator(e.target.value as Separator)}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="hyphen">Hyphen (-)</option>
            <option value="underscore">Underscore (_)</option>
            <option value="dot">Dot (.)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Letter case</label>
          <select
            value={caseMode}
            onChange={(e) => setCaseMode(e.target.value as CaseMode)}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="lower">Lowercase</option>
            <option value="upper">Uppercase</option>
            <option value="preserve">Preserve case</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Max length (0 = unlimited)
          </label>
          <input
            type="number"
            min={0}
            max={500}
            value={maxLength}
            onChange={(e) =>
              setMaxLength(Math.min(500, Math.max(0, parseInt(e.target.value) || 0)))
            }
            className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-2 pb-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground font-medium">
            <input
              type="checkbox"
              checked={allowNumbers}
              onChange={(e) => setAllowNumbers(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            Keep numbers
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground font-medium">
            <input
              type="checkbox"
              checked={stripStopWords}
              onChange={(e) => setStripStopWords(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            Strip stop words (the, a, of…)
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Generated slug</label>
          {slug && (
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

        <div className="min-h-16 rounded-2xl border border-border bg-background p-4 font-mono text-sm text-foreground break-all">
          {slug ? (
            <span>{slug}</span>
          ) : (
            <span className="text-muted-foreground">
              Type text above to generate a clean, URL-friendly slug.
            </span>
          )}
        </div>

        {slug && (
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>
              Length: <strong className="text-foreground">{slug.length}</strong>
            </span>
            <span>
              Words: <strong className="text-foreground">{words.length}</strong>
            </span>
            <span>
              URL preview: <strong className="text-foreground font-mono">/{slug}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export const SlugGeneratorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "slug-generator",
  slug: "slug-generator",
  categoryId: "utilities",
  icon: Link2,
  component: SlugGeneratorTool,
  layoutDescription:
    "Convert any title or sentence into a clean, URL-friendly slug with separator, case, and length options.",
};
