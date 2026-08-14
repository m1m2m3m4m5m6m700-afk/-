import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, CheckCircle2, HelpCircle, Sparkles, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { AIPromptBox } from "./AIPromptBox";
import { UnknownTaskDialog } from "./UnknownTaskDialog";
import { HeroStats, QuickAccessBar, TrustBar } from "./HomeSignals";
import { FlixoBrain, type BrainStatus, type BrainProcessResult } from "@/lib/brain";
import { useAIGeneration } from "@/lib/ai/useAIGeneration";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/locales/en";
import type { CategoryId } from "@/data/categories";

interface AITaskInterfaceProps {
  onRequestTool: (prefillPrompt?: string) => void;
  onSelectCategory?: (categoryId: CategoryId) => void;
}

const brain = new FlixoBrain();

export function AITaskInterface({ onRequestTool, onSelectCategory }: AITaskInterfaceProps) {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<BrainStatus>("idle");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrainProcessResult | null>(null);
  const [unknownDialogOpen, setUnknownDialogOpen] = useState(false);
  const [unmatchedPrompt, setUnmatchedPrompt] = useState("");
  const ai = useAIGeneration("ai-chat");

  const BRAIN_STATUS_KEY: Record<BrainStatus, TranslationKey> = {
    idle: "brain.status.idle",
    thinking: "brain.notify.thinking",
    analyzing: "brain.notify.analyzing",
    matching: "brain.notify.matching",
    ready: "brain.notify.ready",
    unknown: "brain.notify.unknownLong",
  };
  const localizedStatusText = result?.statusText
    ? result.matched
      ? t("brain.notify.ready")
      : ai.loading
        ? "AI is answering..."
        : t("brain.notify.unknownLong")
    : t(BRAIN_STATUS_KEY[status]);

  const handleExecuteTask = async (
    inputPrompt: string,
    attachment?: { file?: File; name?: string; type?: string },
    linkUrl?: string,
  ) => {
    if (!inputPrompt.trim() && !attachment && !linkUrl) return;

    setLoading(true);
    setResult(null);
    ai.clear();

    const brainResult = await brain.processRequest(inputPrompt, {
      attachment,
      linkUrl,
      locale,
      onStatusChange: (newStatus) => setStatus(newStatus),
    });

    setResult(brainResult);

    if (brainResult.matched && brainResult.skill) {
      if (onSelectCategory) onSelectCategory(brainResult.skill.categoryId);
      if (brainResult.skill.status === "ready" && brainResult.skill.route) {
        const targetRoute = brainResult.skill.route;
        setLoading(false);
        setTimeout(() => {
          navigate({ to: targetRoute as "/tools/translator" });
        }, 500);
      } else {
        setLoading(false);
      }
      return;
    }

    setUnmatchedPrompt(inputPrompt);
    // The homepage is now an AI entry point: if Flixo cannot map the request
    // to one of its concrete tools, the free-first AI layer answers it instead
    // of immediately forcing the user into a tool-request workflow.
    await ai.run(inputPrompt);
    setLoading(false);
  };

  const handleSelectTask = (taskPrompt: string) => {
    setPrompt(taskPrompt);
    void handleExecuteTask(taskPrompt);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <AIPromptBox
        prompt={prompt}
        onPromptChange={setPrompt}
        onSubmit={handleExecuteTask}
        status={status}
        statusText={localizedStatusText}
        loading={loading || ai.loading}
      />

      <TrustBar />
      <HeroStats />
      <QuickAccessBar onSelect={handleSelectTask} />

      <AnimatePresence mode="wait">
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            className="overflow-hidden rounded-3xl border border-border/80 bg-surface/90 p-5 shadow-lift backdrop-blur-xl"
          >
            {result.matched && result.skill ? (
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500 font-bold">
                      <CheckCircle2 className="size-5" />
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block">
                        {t("assistant.result.matched")}
                      </span>
                      <h3 className="text-lg font-bold text-foreground">{result.skill.name}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    {result.skill.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      {t("assistant.result.category")}: {result.skill.categoryName}
                    </span>
                    {result.matchedKeywords.length > 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        {t("assistant.result.matched")}: {result.matchedKeywords.join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                  {result.skill.status === "ready" && result.skill.route ? (
                    <Button asChild size="sm" className="rounded-xl px-4 shadow-sm font-bold">
                      <Link to={result.skill.route as "/tools/translator"}>
                        {t("assistant.result.open")} {result.skill.name}
                        <ArrowRight className="ms-1.5 size-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onRequestTool(prompt)}
                      className="rounded-xl px-4 shadow-sm font-bold"
                    >
                      <Lightbulb className="me-1.5 size-4" />
                      Request Priority Build
                    </Button>
                  )}
                </div>

                {result.alternativeSkills.length > 0 && (
                  <div className="mt-5 rounded-3xl border border-border/70 bg-surface/80 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      Suggested workflow
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {result.alternativeSkills.map((skill) => (
                        <div key={skill.id} className="rounded-2xl border border-border/70 bg-card/60 p-3">
                          <p className="text-sm font-semibold text-foreground">{skill.name}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{skill.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Flixo AI</h4>
                    <p className="text-xs text-muted-foreground">No matching project tool was required, so the AI assistant answered directly.</p>
                  </div>
                </div>

                {ai.result?.ok ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">{ai.result.provider} · {ai.result.model}</span>
                      <button
                        type="button"
                        onClick={() => void navigator.clipboard.writeText(ai.content)}
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        <Copy className="size-3.5" /> Copy
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap break-words rounded-2xl bg-background p-4 text-sm leading-7 text-foreground">
                      {ai.content}
                    </pre>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                    {ai.result?.message ?? "No AI response was available."}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => setUnknownDialogOpen(true)} className="rounded-xl text-xs font-bold">
                    <HelpCircle className="me-1.5 size-4" /> Request a new tool
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <UnknownTaskDialog
        open={unknownDialogOpen}
        onOpenChange={setUnknownDialogOpen}
        prompt={unmatchedPrompt || prompt}
        onRequestSubmitted={(p) => onRequestTool(p)}
      />
    </div>
  );
}
