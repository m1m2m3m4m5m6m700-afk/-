import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType?: "up" | "down" | "neutral";
  subtext: string;
  icon: ReactNode;
  badgeText?: string;
  highlightColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "up",
  subtext,
  icon,
  badgeText,
  highlightColor = "bg-primary/10 text-primary",
}: StatCardProps) {
  return (
    <div className="group relative rounded-2xl border border-border/80 bg-card/60 p-4 transition-all duration-200 hover:border-border hover:bg-card hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black tracking-tight text-foreground">{value}</h3>
            {badgeText && (
              <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border/60">
                {badgeText}
              </span>
            )}
          </div>
        </div>

        <div
          className={cn(
            "grid size-11 place-items-center rounded-2xl shrink-0 font-bold shadow-xs",
            highlightColor,
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5 text-xs">
        <div className="flex items-center gap-1 font-semibold">
          {changeType === "up" && (
            <span className="inline-flex items-center text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md text-[11px]">
              <TrendingUp className="me-1 size-3" />
              {change}
            </span>
          )}
          {changeType === "down" && (
            <span className="inline-flex items-center text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded-md text-[11px]">
              <TrendingDown className="me-1 size-3" />
              {change}
            </span>
          )}
          {changeType === "neutral" && (
            <span className="inline-flex items-center text-muted-foreground font-semibold bg-surface px-1.5 py-0.5 rounded-md text-[11px]">
              <Minus className="me-1 size-3" />
              {change}
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[140px]">
          {subtext}
        </span>
      </div>
    </div>
  );
}
