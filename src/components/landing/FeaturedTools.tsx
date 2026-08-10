import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { useI18n } from "@/lib/i18n";
import { sortedCategories, type CategoryId } from "@/data/categories";
import { toolsByCategory } from "@/data/tools";

export function FeaturedTools() {
  const { t } = useI18n();

  const liveCount = (id: CategoryId) =>
    toolsByCategory(id).filter((tool) => tool.status === "ready").length;

  return (
    <Section
      id="tools"
      eyebrow={t("categories.eyebrow")}
      title={t("categories.title")}
      description={t("categories.description")}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedCategories.map((cat) => {
          const Icon = cat.icon;
          const count = liveCount(cat.id);
          const isLive = count > 0;
          const toolNames = toolsByCategory(cat.id)
            .filter((tool) => tool.status === "ready")
            .slice(0, 3)
            .map((tool) => tool.name)
            .join(" · ");

          const card = (
            <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span
                  className={
                    isLive
                      ? "rounded-full bg-primary/12 px-2.5 py-1 text-[11px] font-medium text-primary"
                      : "rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  }
                >
                  {isLive ? t("categories.status.live", { count }) : t("categories.status.coming")}
                </span>
              </div>

              <h3 className="mt-5 flex items-center gap-1.5 text-lg font-semibold">
                {cat.name}
                {isLive && (
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
                )}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {cat.description}
              </p>

              <div className="mt-auto pt-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/60">
                  {t("categories.toolsLabel")}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/90">
                  {toolNames || "More tools coming soon"}
                </p>
              </div>
            </div>
          );

          return isLive && cat.route ? (
            <Link key={cat.id} to={cat.route as never} className="block">
              {card}
            </Link>
          ) : (
            <div key={cat.id} className="cursor-default opacity-80">
              {card}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
