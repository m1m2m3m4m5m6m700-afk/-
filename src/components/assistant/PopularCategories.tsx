import { categories, type CategoryId } from "@/data/categories";
import { toolsByCategory } from "@/data/tools";
import { Grid, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { resolveCategoryName } from "@/lib/i18n/keys";

interface PopularCategoriesProps {
  onSelectCategory: (categoryId: CategoryId) => void;
}

export function PopularCategories({ onSelectCategory }: PopularCategoriesProps) {
  const { t } = useI18n();
  // Show top categories
  const topCategories = categories.slice(0, 8);

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Grid className="size-4 text-purple-500" />
          <span>{t("brain.section.popularCategories")}</span>
        </h3>
        <span className="text-[11px] text-muted-foreground font-medium">
          {t("brain.section.popularHint")}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {topCategories.map((cat) => {
          const Icon = cat.icon;
          const count = toolsByCategory(cat.id).filter((t) => t.status === "ready").length;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card/60 p-3.5 text-start shadow-xs transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border/50">
                  {t("brain.section.tools", { count })}
                </span>
              </div>

              <div className="mt-3">
                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {resolveCategoryName(cat.id, t)}
                </h4>
                <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                  {(cat as { tagline?: string }).tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
