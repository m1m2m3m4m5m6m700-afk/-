import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Assistant } from "@/components/landing/Assistant";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { CategoryId } from "@/data/categories";

interface HeroProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onRequestTool: () => void;
  onSelectCategory: (categoryId: CategoryId) => void;
}

export function Hero({ prompt, onPromptChange, onRequestTool, onSelectCategory }: HeroProps) {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-hero-glow">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl animate-float" />

      <div className="relative mx-auto max-w-3xl px-5 pb-24 pt-24 text-center md:pb-32 md:pt-36">
        <span className="inline-flex animate-rise items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-primary" />
          {t("hero.badge")}
        </span>

        <h1
          className="mx-auto mt-6 max-w-2xl animate-rise font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance md:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          {t("hero.title")}
        </h1>

        <p
          className="mx-auto mt-5 max-w-xl animate-rise text-base leading-relaxed text-muted-foreground md:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          {t("hero.description")}
        </p>

        <Assistant
          prompt={prompt}
          onPromptChange={onPromptChange}
          onRequestTool={onRequestTool}
          onSelectCategory={onSelectCategory}
        />

        <div
          className="mt-8 flex animate-rise flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "400ms" }}
        >
          <Button asChild size="lg" className="w-full rounded-xl shadow-lift sm:w-auto">
            <Link to="/tools/translator">
              {t("hero.cta")}
              <ArrowRight className="size-4 rtl:-scale-x-100" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">{t("hero.note")}</p>
        </div>
      </div>
    </section>
  );
}
