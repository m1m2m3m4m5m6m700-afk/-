import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  Wand2,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  CornerDownLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { classifyIntent, type ClassificationResult } from "@/lib/tool-classifier";
import { toolRoute } from "@/data/tools";
import { categoryById, type CategoryId } from "@/data/categories";
import { trackKeywordSearch, trackCategoryVisit, trackToolOpen } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { resolveToolName, resolveCategoryName } from "@/lib/i18n/keys";

interface AssistantProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onRequestTool: (prefillPrompt?: string) => void;
  onSelectCategory?: (categoryId: CategoryId) => void;
}

const EXAMPLE_PROMPTS = [
  "Translate a document to French",
  "Remove background from image",
  "Merge multiple PDF files",
  "Summarize long article",
  "Format messy JSON payload",
];

export function Assistant({
  prompt,
  onPromptChange,
  onRequestTool,
  onSelectCategory,
}: AssistantProps) {
  const { t } = useI18n();
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = (textToAnalyze?: string) => {
    const text = textToAnalyze ?? prompt;
    if (!text.trim()) return;

    trackKeywordSearch(text);
    setLoading(true);

    // Simulate quick intelligent classification
    setTimeout(() => {
      const classification = classifyIntent(text);
      setResult(classification);
      setLoading(false);

      if (classification.kind === "match") {
        trackCategoryVisit(classification.category.id);
        if (classification.tool) {
          trackToolOpen(classification.tool.name);
        }
        handleScrollToCategory(classification.category.anchor, classification.category.id);
      }
    }, 400);
  };

  const handleScrollToCategory = (anchor: string, catId: CategoryId) => {
    onSelectCategory?.(catId);
    const element = document.getElementById(`cat-${anchor}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setResult(null);
    onPromptChange("");
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Input Box */}
      <div className="relative rounded-3xl border border-border/80 bg-card/80 p-2 shadow-lift backdrop-blur-xl transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
        <div className="flex items-center gap-2">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Wand2 className="size-5" />
          </span>

          <label htmlFor="ai-assistant-input" className="sr-only">
            Describe what you need — Flixo finds the tool
          </label>
          <input
            id="ai-assistant-input"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAnalyze();
              }
            }}
            placeholder="Describe what you need — Flixo finds the tool..."
            className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm md:text-base outline-none placeholder:text-muted-foreground/70"
          />

          <Button
            onClick={() => handleAnalyze()}
            disabled={loading || !prompt.trim()}
            className="shrink-0 rounded-2xl px-4 py-2.5 font-medium shadow-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="size-4 animate-spin text-primary-foreground" />
                <span>Thinking...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="size-4" />
                <span className="hidden sm:inline">Find Tool</span>
                <CornerDownLeft className="size-3.5 opacity-60 sm:hidden" />
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      {!result && !loading && (
        <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
          {EXAMPLE_PROMPTS.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                onPromptChange(ex);
                handleAnalyze(ex);
              }}
              className="rounded-full border border-border/60 bg-surface/50 px-3 py-1 text-xs text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-surface hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Loading Skeleton */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="mt-3 flex gap-2">
                  <Skeleton className="h-8 w-24 rounded-xl" />
                  <Skeleton className="h-8 w-32 rounded-xl" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Classification Result Box */}
      <AnimatePresence mode="wait">
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="mt-4 overflow-hidden rounded-2xl border border-border/80 bg-surface/80 p-5 text-start shadow-lift backdrop-blur-md"
          >
            {result.kind === "match" ? (
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Category Icon */}
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                  {categoryById.get(result.category.id)?.icon ? (
                    (() => {
                      const Icon = categoryById.get(result.category.id)!.icon;
                      return <Icon className="size-5" />;
                    })()
                  ) : (
                    <Sparkles className="size-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Matched Category: {resolveCategoryName(result.category.id, t)}
                    </span>
                    {result.matchedKeywords.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Matched: {result.matchedKeywords.slice(0, 3).join(", ")}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {result.tool ? (
                      <>
                        We matched your request to{" "}
                        <strong className="text-foreground">
                          {result.tool
                            ? resolveToolName(result.tool.slug || result.tool.id, t)
                            : ""}
                        </strong>{" "}
                        under{" "}
                        <span className="text-muted-foreground">
                          {resolveCategoryName(result.category.id, t)}
                        </span>
                        .
                      </>
                    ) : (
                      <>
                        Looks like{" "}
                        <strong className="text-foreground">
                          {resolveCategoryName(result.category.id, t)}
                        </strong>
                        . Explore available and planned tools below.
                      </>
                    )}
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {result.tool && result.tool.status === "ready" && result.tool.slug ? (
                      <Button asChild size="sm" className="rounded-xl px-4 shadow-sm">
                        <Link to={toolRoute(result.tool)!}>
                          Open{" "}
                          {result.tool
                            ? resolveToolName(result.tool.slug || result.tool.id, t)
                            : ""}
                          <ArrowRight className="ms-1 size-4 rtl:-scale-x-100" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="rounded-xl px-4 shadow-sm"
                        onClick={() => onRequestTool(prompt)}
                      >
                        <Lightbulb className="me-1.5 size-4" />
                        Request Priority Build
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() =>
                        handleScrollToCategory(result.category.anchor, result.category.id)
                      }
                    >
                      View {resolveCategoryName(result.category.id, t)} in Directory ↓
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback Result */
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-500/15 text-amber-500">
                  <HelpCircle className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-semibold text-foreground">
                    We couldn't find the right tool yet.
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    Flixo is constantly adding new utility and AI tools. Let us know what you need,
                    and we'll prioritize it on our roadmap.
                  </p>

                  <div className="mt-4">
                    <Button
                      size="sm"
                      className="rounded-xl px-4 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => onRequestTool(prompt)}
                    >
                      <Lightbulb className="me-1.5 size-4" />
                      Request a Tool
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end border-t border-border/40 pt-3">
              <button
                onClick={handleReset}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear suggestion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
