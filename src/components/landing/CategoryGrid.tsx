import { motion } from "motion/react";
import { Section } from "@/components/layout/Section";
import { sortedCategories, type CategoryId } from "@/data/categories";
import { toolsByCategory } from "@/data/tools";
import { cn } from "@/lib/utils";
import { trackCategoryVisit } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { resolveCategoryName } from "@/lib/i18n/keys";

interface CategoryGridProps {
  highlightedCategoryId?: CategoryId | null;
  onSelectCategory?: (categoryId: CategoryId) => void;
}

/** Category cards — rendered entirely from src/data/categories.ts. */
export function CategoryGrid({ highlightedCategoryId, onSelectCategory }: CategoryGridProps) {
  const { t } = useI18n();
  const handleCategoryClick = (anchor: string, id: CategoryId) => {
    trackCategoryVisit(id);
    onSelectCategory?.(id);
    const element = document.getElementById(`cat-${anchor}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Section
      id="categories"
      eyebrow="Category Hubs"
      title="Every tool has a home"
      description={`${sortedCategories.length} dedicated hubs cover the work people bring to Flixo. Jump straight to a hub or explore the full directory below.`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedCategories.map((category, index) => {
          const Icon = category.icon;
          const catTools = toolsByCategory(category.id);
          const readyCount = catTools.filter((tool) => tool.status === "ready").length;
          const isHighlighted = highlightedCategoryId === category.id;

          return (
            <motion.a
              key={category.id}
              href={`#cat-${category.anchor}`}
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick(category.anchor, category.id);
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                "group relative flex h-full flex-col justify-between rounded-2xl border p-5 backdrop-blur-md transition-all duration-300",
                isHighlighted
                  ? "border-primary bg-primary/10 ring-2 ring-primary/50 shadow-lift"
                  : "border-border/70 bg-card/70 hover:border-primary/40 hover:bg-card hover:shadow-lift",
              )}
            >
              <div>
                {/* Header icon & badge */}
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium shadow-xs",
                      readyCount > 0
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground border border-border/50",
                    )}
                  >
                    {readyCount > 0 ? `${readyCount} Ready` : "Coming soon"}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="mt-4 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {resolveCategoryName(category.id, t)}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              </div>

              {/* Footer Tool count */}
              <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-3">
                <span className="text-[11px] font-mono text-muted-foreground/70 uppercase tracking-wider">
                  {readyCount} {readyCount === 1 ? "tool" : "tools"}
                </span>
                <span className="text-[11px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Explore →
                </span>
              </div>
            </motion.a>
          );
        })}
      </div>
    </Section>
  );
}
