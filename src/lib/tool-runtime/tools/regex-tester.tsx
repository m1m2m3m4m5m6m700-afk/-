import { useState } from "react";
import { Code, Copy, Check, Search } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function RegexTesterTool() {
  const [pattern, setPattern] = useState(`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}`);
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState(
    "Contact us at support@flixo.app or sales@flixo.com for inquiries.",
  );
  const [copied, setCopied] = useState(false);

  let matches: string[] = [];
  let error: string | null = null;

  try {
    if (pattern && testText) {
      const regex = new RegExp(pattern, flags);
      const found = testText.match(regex);
      matches = found ? Array.from(found) : [];
    }
  } catch (err) {
    error = (err as Error).message || "Invalid regular expression pattern";
  }

  const handleCopyMatches = () => {
    if (matches.length === 0) return;
    navigator.clipboard.writeText(matches.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3 items-end">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Regex Pattern
          </label>
          <div className="flex items-center rounded-xl border border-border bg-background px-3 py-2">
            <span className="text-muted-foreground font-mono text-sm mr-1">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. \d+"
              className="w-full bg-transparent font-mono text-xs text-foreground focus:outline-none"
            />
            <span className="text-muted-foreground font-mono text-sm ml-1">/</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Flags (g, i, m, s)
          </label>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="g"
            className="w-full rounded-xl border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Test String</label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to match against..."
            className="w-full h-56 rounded-2xl border border-border bg-background p-4 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              Matches ({error ? 0 : matches.length})
            </label>
            {matches.length > 0 && !error && (
              <button
                type="button"
                onClick={handleCopyMatches}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied Matches" : "Copy Matches"}
              </button>
            )}
          </div>

          <div className="h-56 rounded-2xl border border-border bg-background p-4 overflow-y-auto font-mono text-xs">
            {error ? (
              <div className="text-rose-500 font-semibold">{error}</div>
            ) : matches.length > 0 ? (
              <div className="space-y-1.5">
                {matches.map((match, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-foreground font-semibold flex items-center justify-between"
                  >
                    <span>{match}</span>
                    <span className="text-[10px] text-primary font-mono">Match #{idx + 1}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Search className="size-8 opacity-40" />
                <span>No matches found.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const RegexTesterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "regex-tester",
  slug: "regex-tester",
  categoryId: "developer",
  icon: Code,
  component: RegexTesterTool,
  layoutDescription:
    "Test regular expressions interactively against test strings with real-time match listing.",
};
