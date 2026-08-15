import { motion } from "motion/react";
import { ArrowRight, Boxes } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Section } from "@/components/layout/Section";
import { sortedCategories, type CategoryId } from "@/data/categories";
import { toolsByCategory } from "@/data/tools";
import { trackCategoryVisit } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { resolveCategoryName, resolveToolName } from "@/lib/i18n/keys";

interface CategoryGridProps {
  highlightedCategoryId?: CategoryId | null;
  onSelectCategory?: (categoryId: CategoryId) => void;
}

const FEATURED_CATEGORY_IDS: CategoryId[] = ["translation", "images", "pdf", "writing", "utilities", "developer"];

export function CategoryGrid({ highlightedCategoryId, onSelectCategory }: CategoryGridProps) {
  const { t } = useI18n();
  const categories = FEATURED_CATEGORY_IDS.map((id) => sortedCategories.find((category) => category.id === id)).filter(Boolean);

  return (
    <Section
      id="categories"
      eyebrow={t("categories.eyebrow")}
      title={t("categories.title")}
      description={t("categories.description")}
    >
      <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Boxes className="size-4 text-primary" />
        <span>{t("categories.toolsLabel")}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => {
          if (!category) return null;
          const Icon = category.icon;
          const tools = toolsByCategory(category.id);
          const readyTools = tools.filter((tool) => tool.status === "ready");
          const preview = readyTools.slice(0, 4);
          const highlighted = highlightedCategoryId === category.id;
          const blurbKey = `category.${category.id}.blurb` as Parameters<typeof t>[0];
          const translatedBlurb = t(blurbKey);
          const blurb = translatedBlurb === blurbKey ? t("categories.description") : translatedBlurb;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <Link
                to="/categories/$slug"
                params={{ slug: category.id }}
                onClick={() => {
                  trackCategoryVisit(category.id);
                  onSelectCategory?.(category.id);
                }}
                className={`group flex h-full flex-col rounded-3xl border p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-lift ${
                  highlighted ? "border-primary bg-primary/10 ring-2 ring-primary/30" : "border-border/70 bg-card/70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="rounded-full border border-border/70 bg-muted/50 px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                    {readyTools.length} {t("categories.status.live")}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-black tracking-tight">{resolveCategoryName(category.id, t)}</h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{blurb}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {preview.map((tool) => (
                    <span key={tool.id} className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                      {resolveToolName(tool.slug || tool.id, t)}
                    </span>
                  ))}
                </div>

                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-bold text-primary">
                  {t("hero.browse")}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
