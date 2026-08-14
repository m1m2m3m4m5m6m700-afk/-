import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { tools } from "@/data/tools";
import { getToolStats } from "@/data/seoEnterpriseData";
import { useI18n } from "@/lib/i18n";
import { resolveToolName } from "@/lib/i18n/keys";

export function TrendingToolsSection() {
  const { t: translate } = useI18n();
  const readyTools = tools.filter((tool) => tool.status === "ready" && tool.slug);
  const featuredTools = readyTools.slice(0, 6);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-primary/12 text-primary">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">Featured Tools</h2>
            <p className="text-xs text-muted-foreground">
              A selection of browser-based tools for creators and developers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featuredTools.map((tool) => {
          const stats = getToolStats(tool.id);
          return (
            <Link
              key={tool.id}
              to={`/tools/${tool.slug!}` as never}
              className="group rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-xs flex flex-col justify-between"
            >
              <div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {resolveToolName(tool.slug || tool.id, translate)}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {tool.description}
                </p>
                <p className="mt-2 text-[10px] font-medium text-muted-foreground">
                  {stats.keyMetric}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                  <ShieldCheck className="size-3.5" /> 100% Private
                </span>
                <span className="font-bold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Launch <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
