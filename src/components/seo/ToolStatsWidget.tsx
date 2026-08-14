import { Shield, Star } from "lucide-react";
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
          <Shield className="size-4 text-primary" /> Privacy &amp; Capabilities
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
            <Shield className="size-3 text-emerald-500" /> Privacy
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {stats.privacyRating}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
            <Star className="size-3 text-amber-400 fill-amber-400" /> Key Capability
          </div>
          <div className="text-xs font-bold text-foreground">{stats.keyMetric}</div>
        </div>
      </div>
    </div>
  );
}
