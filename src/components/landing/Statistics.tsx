import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/locales/en";

const stats: { value: string; key: TranslationKey }[] = [
  { value: "1.2M+", key: "stats.tasks" },
  { value: "20+", key: "stats.languages" },
  { value: "0.8s", key: "stats.latency" },
  { value: "99.9%", key: "stats.uptime" },
];

export function Statistics() {
  const { t } = useI18n();

  return (
    <section id="stats" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid gap-px overflow-hidden rounded-3xl border border-border/80 bg-border/60 shadow-lift sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((s, idx) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-card/90 p-8 text-center backdrop-blur-md transition-colors hover:bg-card"
          >
            <p
              className="font-display text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent"
              dir="ltr"
            >
              {s.value}
            </p>
            <p className="mt-2 text-xs md:text-sm font-medium text-muted-foreground">{t(s.key)}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
