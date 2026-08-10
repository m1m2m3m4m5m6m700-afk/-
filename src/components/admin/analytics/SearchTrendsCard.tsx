import { Search, Flame, TrendingUp, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SearchTrend } from "./types";

interface SearchTrendsCardProps {
  trends: SearchTrend[];
  totalSearches: number;
}

export function SearchTrendsCard({ trends, totalSearches }: SearchTrendsCardProps) {
  return (
    <div className="rounded-3xl border border-border/80 bg-card/60 p-5 backdrop-blur-xl flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-2xl bg-amber-500/10 text-amber-500 font-bold">
              <Flame className="size-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                Search Trends & Intent
              </h3>
              <p className="text-xs text-muted-foreground">Most popular query intent & growth</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-bold border-amber-500/30 text-amber-500">
            {totalSearches.toLocaleString()} Queries
          </Badge>
        </div>

        {/* Trends List */}
        <div className="space-y-2.5 pt-1">
          {trends.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground italic">
              No search keywords recorded yet.
            </div>
          ) : (
            trends.slice(0, 6).map((trend, idx) => (
              <div
                key={trend.query}
                className="flex items-center justify-between gap-2 rounded-2xl border border-border/60 bg-surface/40 p-3 transition-colors hover:bg-surface hover:border-border"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid size-6 place-items-center rounded-lg bg-card text-[11px] font-mono font-bold text-muted-foreground shrink-0 border border-border/50">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-foreground block truncate">
                      "{trend.query}"
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Matched to{" "}
                      <span className="text-primary font-semibold">{trend.category}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <TrendingUp className="me-1 size-3" />
                    {trend.growth}
                  </span>
                  <span className="rounded-xl bg-card px-2.5 py-1 text-xs font-mono font-bold text-foreground border border-border/60">
                    {trend.count} searches
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
