import { Sparkles, Bot } from "lucide-react";
import { motion } from "motion/react";
import { AITaskInterface } from "@/components/assistant/AITaskInterface";
import { useI18n } from "@/lib/i18n";

interface HomeHeroProps {
  onRequestTool: (prefillPrompt?: string) => void;
}

export function HomeHero({ onRequestTool }: HomeHeroProps) {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-hero-glow">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-24 left-1/2 size-[450px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl animate-float" />

      <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-14 text-center md:pb-24 md:pt-20">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-4 py-1.5 text-xs font-semibold text-foreground shadow-xs backdrop-blur"
        >
          <Bot className="size-4 text-primary animate-pulse" />
          <span>Flixo AI Task Assistant</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-5 bg-gradient-to-b from-foreground via-foreground/90 to-foreground/60 bg-clip-text font-display text-5xl font-bold leading-[1.02] tracking-tight text-transparent sm:text-6xl md:text-7xl"
        >
          Flixo
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          Your conversational AI task assistant. Describe what you need to accomplish and Flixo
          matches the right AI skill instantly.
        </motion.p>

        {/* Promo Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mx-auto mt-6 flex max-w-2xl flex-col items-start gap-3 rounded-3xl border border-primary/20 bg-primary/5 px-5 py-4 text-left shadow-sm backdrop-blur-sm"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary/90">
            {t("hero.promo.badge")}
          </span>
          <p className="text-sm font-medium text-foreground md:text-base">{t("hero.promo.body")}</p>
        </motion.div>

        {/* Conversational AI Task Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-start"
        >
          <AITaskInterface onRequestTool={onRequestTool} />
        </motion.div>
      </div>
    </section>
  );
}
