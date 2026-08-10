import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "@/components/layout/Section";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/locales/en";

const faqIds = ["1", "2", "3", "4", "5"];

export function FAQ() {
  const { t } = useI18n();

  return (
    <Section
      id="faq"
      eyebrow={t("faq.eyebrow")}
      title={t("faq.title")}
      description={t("faq.description")}
    >
      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3.5">
          {faqIds.map((id, index) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <AccordionItem
                value={`item-${id}`}
                className="rounded-2xl border border-border/70 bg-card/80 px-5 shadow-xs transition-colors hover:border-primary/40 backdrop-blur"
              >
                <AccordionTrigger className="text-start text-base font-medium text-foreground hover:no-underline py-4">
                  {t(`faq.q${id}` as TranslationKey)}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {t(`faq.a${id}` as TranslationKey)}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}
