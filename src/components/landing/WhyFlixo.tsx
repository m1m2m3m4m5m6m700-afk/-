import { Gauge, KeyRound, Layers, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { Section } from "@/components/layout/Section";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/locales/en";

const reasons = [
  { id: "speed", icon: Gauge },
  { id: "consistency", icon: Layers },
  { id: "privacy", icon: ShieldCheck },
  { id: "access", icon: KeyRound },
];

export function WhyFlixo() {
  const { t } = useI18n();

  return (
    <div className="border-y border-border/60 bg-surface/40 backdrop-blur-sm">
      <Section id="why" eyebrow={t("why.eyebrow")} title={t("why.title")}>
        <div className="grid gap-4 md:grid-cols-2">
          {reasons.map(({ id, icon: Icon }, index) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              className="flex gap-4 rounded-2xl border border-border/80 bg-card/80 p-6 shadow-xs backdrop-blur transition-all duration-300 hover:border-primary/40 hover:shadow-lift"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-foreground shadow-xs">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground">
                  {t(`why.${id}.title` as TranslationKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`why.${id}.body` as TranslationKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>
    </div>
  );
}
