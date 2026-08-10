import { Shield, Zap, Star, Activity, CheckCircle2 } from "lucide-react";
import { getToolStats } from "@/data/seoEnterpriseData";

interface ToolStatsWidgetProps {
  toolId: string;
}

export function ToolStatsWidget({ toolId }: ToolStatsWidgetProps) {
  const stats = getToolStats(toolId);

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Activity className="size-4 text-primary" /> Real-time Performance & Privacy Metrics
        </h3>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
          <CheckCircle2 className="size-3.5" /> 100% Operational
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Total Executions</div>
          <div className="text-base sm:text-lg font-bold text-foreground font-mono">
            {stats.processedCount}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
            <Zap className="size-3 text-amber-500" /> Avg Latency
          </div>
          <div className="text-base sm:text-lg font-bold text-foreground font-mono">
            {stats.avgTimeMs}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
            <Shield className="size-3 text-emerald-500" /> Privacy Rating
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {stats.privacyRating}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
            <Star className="size-3 text-amber-400 fill-amber-400" /> User Satisfaction
          </div>
          <div className="text-base sm:text-lg font-bold text-foreground font-mono">
            {stats.userRating}
          </div>
        </div>
      </div>
    </div>
  );
}
