import { Calendar, ShieldCheck, Sparkles } from "lucide-react";

interface LastUpdatedBadgeProps {
  date?: string;
  version?: string;
  className?: string;
}

export function LastUpdatedBadge({
  date = "2026-07-30",
  version = "v2.5.0 Engine",
  className = "",
}: LastUpdatedBadgeProps) {
  return (
    <div
      className={`inline-flex flex-wrap items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs text-foreground font-medium ${className}`}
    >
      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
        <ShieldCheck className="size-4" />
        Verified Fresh & Active
      </span>
      <span className="text-muted-foreground/40">•</span>
      <span className="flex items-center gap-1 text-muted-foreground">
        <Calendar className="size-3.5" />
        Last Updated: <time dateTime={date}>{date}</time>
      </span>
      <span className="text-muted-foreground/40">•</span>
      <span className="flex items-center gap-1 font-mono text-[11px] text-primary font-bold">
        <Sparkles className="size-3" />
        {version}
      </span>
    </div>
  );
}
