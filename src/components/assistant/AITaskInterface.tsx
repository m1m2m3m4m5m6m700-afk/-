import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, CheckCircle2, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { AIPromptBox } from "./AIPromptBox";
import { UnknownTaskDialog } from "./UnknownTaskDialog";
import { HeroStats, QuickAccessBar, TrustBar } from "./HomeSignals";
import { FlixoBrain, type BrainStatus, type BrainProcessResult } from "@/lib/brain";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/locales/en";
import type { CategoryId } from "@/data/categories";

interface AITaskInterfaceProps {
  onRequestTool: (prefillPrompt?: string) => void;
  onSelectCategory?: (categoryId: CategoryId) => void;
}

const brain = new FlixoBrain();

interface FlexGuidance {
  reply: string;
}

export function AITaskInterface({ onRequestTool, onSelectCategory }: AITaskInterfaceProps) {
  const { t, locale } = useI18n();
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<BrainStatus>("idle");
  const [statusText, setStatusText] = useState("Ready");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrainProcessResult | null>(null);
  const [flexGuidance, setFlexGuidance] = useState<FlexGuidance | null>(null);
  const [unknownDialogOpen, setUnknownDialogOpen] = useState(false);
  const [unmatchedPrompt, setUnmatchedPrompt] = useState("");

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
      : t("brain.notify.unknownLong")
    : t(BRAIN_STATUS_KEY[status]);

  const askFlexForGuidance = async (inputPrompt: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: inputPrompt, history: [] }),
      });
      const payload = (await response.json()) as { reply?: string; error?: string };
      return (
        payload.reply?.trim() ||
        payload.error ||
        (locale === "ar"
          ? "لم أتمكن من فهم المهمة بالكامل. جرّب وصف ما تريد فعله بالملف أو الرابط وسأرشدك للأداة المناسبة."
          : "I could not fully understand the task. Describe what you want to do with the file or link and I will guide you to the right tool.")
      );
    } catch {
      return locale === "ar"
        ? "تعذر الاتصال بـFlex الآن. يمكنك وصف المهمة مرة أخرى وسأحاول إرشادك للأداة المناسبة."
        : "Flex could not reach the AI service right now. Try describing the task again and I will guide you to the right tool.";
    }
  };

  const handleFlexTask = async (
    inputPrompt: string,
    attachment?: { file?: File; name?: string; type?: string },
    linkUrl?: string,
  ) => {
    if (!inputPrompt.trim() && !attachment && !linkUrl) return;

    setLoading(true);
    setResult(null);
    setFlexGuidance(null);

    const brainResult = await brain.processRequest(inputPrompt, {
      attachment,
      linkUrl,
      locale,
      onStatusChange: (newStatus, text) => {
        setStatus(newStatus);
        setStatusText(text);
      },
    });

    setResult(brainResult);
    setLoading(false);

    if (brainResult.matched && brainResult.skill) {
      if (onSelectCategory) onSelectCategory(brainResult.skill.categoryId);
      return;
    }

    setUnmatchedPrompt(inputPrompt);
    const reply = await askFlexForGuidance(inputPrompt);
    setFlexGuidance({ reply });
  };

  const handleSelectTask = (taskPrompt: string) => {
    setPrompt(taskPrompt);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <AIPromptBox
        prompt={prompt}
        onPromptChange={setPrompt}
        onSubmit={handleFlexTask}
        status={status}
        statusText={localizedStatusText}
        loading={loading}
      />

      <TrustBar />
      <HeroStats />
      <QuickAccessBar onSelect={handleSelectTask} />

      <AnimatePresence mode="wait">
        {result && !loading && result.matched && result.skill && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            className="overflow-hidden rounded-3xl border border-primary/20 bg-surface/90 p-5 shadow-lift backdrop-blur-xl"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Bot className="size-5" />
                  </span>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-primary">Flex</span>
                    <h3 className="text-lg font-bold text-foreground">
                      {locale === "ar" ? "وجدت لك الأداة المناسبة" : "I found the right tool for you"}
                    </h3>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
                  <p className="text-sm font-bold text-foreground">{result.skill.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{result.skill.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {t("assistant.result.category")}: {result.skill.categoryName}
                    </span>
                    {result.matchedKeywords.length > 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        {t("assistant.result.matched")}: {result.matchedKeywords.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-2">
                {result.skill.status === "ready" && result.skill.route ? (
                  <Button asChild size="sm" className="rounded-xl px-4 font-bold shadow-sm">
                    <Link to={result.skill.route as "/tools/translator"}>
                      {locale === "ar" ? "افتح الأداة" : "Open tool"}
                      <ArrowRight className="ms-1.5 size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onRequestTool(prompt)}
                    className="rounded-xl px-4 font-bold shadow-sm"
                  >
                    <Lightbulb className="me-1.5 size-4" />
                    {locale === "ar" ? "اطلب إضافة الأداة" : "Request this tool"}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {flexGuidance && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-primary/20 bg-surface/90 p-5 shadow-lift backdrop-blur-xl"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Bot className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">Flex</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {locale === "ar" ? "إرشاد" : "Guidance"}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{flexGuidance.reply}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setUnknownDialogOpen(true)}
                    className="rounded-xl text-xs font-bold"
                  >
                    {locale === "ar" ? "اطلب أداة جديدة" : "Request a new tool"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>{locale === "ar" ? "Flex يفهم طلبك…" : "Flex is understanding your request…"}</span>
          </div>
        )}
      </AnimatePresence>

      {result?.matched && result.skill && (
        <div className="sr-only" aria-live="polite">
          <CheckCircle2 /> {result.skill.name}
        </div>
      )}

      <UnknownTaskDialog
        open={unknownDialogOpen}
        onOpenChange={setUnknownDialogOpen}
        prompt={unmatchedPrompt || prompt}
        onRequestSubmitted={(p) => onRequestTool(p)}
      />
    </div>
  );
}
