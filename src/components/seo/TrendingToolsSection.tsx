import { Link } from "@tanstack/react-router";
import { Flame, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { tools } from "@/data/tools";
import { getToolStats } from "@/data/seoEnterpriseData";

export function TrendingToolsSection() {
  const readyTools = tools.filter((t) => t.status === "ready" && t.slug);
  const trendingTools = readyTools.slice(0, 6);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-amber-500/12 text-amber-500">
            <Flame className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">Trending Tools</h2>
            <p className="text-xs text-muted-foreground">
              Most active browser-based tools used by creators and developers this week.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trendingTools.map((tool, idx) => {
          const stats = getToolStats(tool.id);
          return (
            <Link
              key={tool.id}
              to={`/tools/${tool.slug!}` as never}
              className="group rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                    <Sparkles className="size-3" /> #{idx + 1} Trending
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {stats.avgTimeMs}
                  </span>
                </div>

                <h3 className="mt-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {tool.description}
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
