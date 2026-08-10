import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, Loader as Loader2, Sparkles, Wand as Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { classifyIntent, type ClassificationResult } from "@/lib/tool-classifier";
import { toolRoute } from "@/data/tools";
import { trackSearch } from "@/lib/analytics";

interface PromptBoxProps {
  value: string;
  onChange: (value: string) => void;
  onRequestTool: () => void;
}

const EXAMPLES = ["Translate a PDF to Arabic", "Remove image background", "Format messy JSON"];

/** Large AI-style input that routes an intent to a category + suggested tool. */
export function PromptBox({ value, onChange, onRequestTool }: PromptBoxProps) {
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const route = useMemo(
    () => (result?.kind === "match" && result.tool ? toolRoute(result.tool) : undefined),
    [result],
  );

  const run = (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    trackSearch(text);
    setTimeout(() => {
      setResult(classifyIntent(text));
      setLoading(false);
    }, 450);
  };

  return (
    <div
      className="mx-auto mt-10 w-full max-w-2xl animate-rise"
      style={{ animationDelay: "300ms" }}
    >
      <div className="rounded-3xl border border-border bg-card/70 p-2 shadow-lift backdrop-blur-xl">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 sm:flex">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Wand2 className="size-5" />
          </span>
          <label htmlFor="flixo-prompt" className="sr-only">
            Describe what you want to do
          </label>
          <input
            id="flixo-prompt"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run(value)}
            placeholder="Describe what you need — Flixo finds the tool"
            className="col-span-2 min-w-0 flex-1 bg-transparent px-2 py-3 text-base outline-none placeholder:text-muted-foreground sm:col-span-1"
          />
          <Button
            onClick={() => run(value)}
            disabled={loading || !value.trim()}
            className="col-span-2 shrink-0 rounded-2xl sm:col-span-1"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {loading ? "Thinking" : "Find tool"}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            onClick={() => {
              onChange(example);
              run(example);
            }}
            className="rounded-full border border-border bg-surface/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {example}
          </button>
        ))}
      </div>

      {result && (
        <div className="mt-5 animate-rise rounded-2xl border border-border bg-surface/60 p-5 text-start backdrop-blur">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-foreground">
              <Lightbulb className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              {result.kind === "match" ? (
                <>
                  <p className="text-sm leading-relaxed">
                    Looks like <span className="font-semibold">{result.category.name}</span>
                    {result.tool ? (
                      <>
                        {" "}
                        — try <span className="font-semibold">{result.tool.name}</span>.
                      </>
                    ) : (
                      "."
                    )}
                  </p>
                  {result.matchedKeywords.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Matched: {result.matchedKeywords.slice(0, 3).join(", ")}
                    </p>
                  )}
                  <div className="mt-4">
                    {route ? (
                      <Button asChild size="sm" className="rounded-xl">
                        <Link to={route}>
                          Open {result.tool?.name}
                          <ArrowRight className="size-4 rtl:-scale-x-100" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={onRequestTool}
                      >
                        Not built yet — request it
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm leading-relaxed">
                    No match yet. Tell us what you need and we will build it.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 rounded-xl"
                    onClick={onRequestTool}
                  >
                    Request a tool
                  </Button>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setResult(null)}
            className="mt-4 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear result
          </button>
        </div>
      )}
    </div>
  );
}
