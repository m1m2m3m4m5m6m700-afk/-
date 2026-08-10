import { useMemo } from "react";
import { Activity, Eye, Search, Wrench, Download, Copy, ExternalLink, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ActivityEvent } from "./types";

interface RecentActivityFeedProps {
  initialEvents: ActivityEvent[];
}

const EVENT_CONFIG: Record<
  ActivityEvent["type"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  page_view: {
    label: "Pageview",
    color: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    icon: <Eye className="size-3.5" />,
  },
  search: {
    label: "Search",
    color: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    icon: <Search className="size-3.5" />,
  },
  tool_click: {
    label: "Tool Used",
    color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    icon: <Wrench className="size-3.5" />,
  },
  category_click: {
    label: "Category",
    color: "bg-purple-500/15 text-purple-500 border-purple-500/30",
    icon: <Activity className="size-3.5" />,
  },
  download: {
    label: "Download",
    color: "bg-teal-500/15 text-teal-500 border-teal-500/30",
    icon: <Download className="size-3.5" />,
  },
  copy: {
    label: "Copy Action",
    color: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
    icon: <Copy className="size-3.5" />,
  },
  external_link: {
    label: "External Link",
    color: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
    icon: <ExternalLink className="size-3.5" />,
  },
};

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function RecentActivityFeed({ initialEvents }: RecentActivityFeedProps) {
  const events = useMemo(() => initialEvents.slice(0, 20), [initialEvents]);

  return (
    <div className="rounded-3xl border border-border/80 bg-card/60 p-5 backdrop-blur-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500 font-bold">
            <Radio className="size-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              Recent Visitor Activity
              <Badge
                variant="outline"
                className="text-xs font-semibold border-emerald-500/30 text-emerald-500"
              >
                Recorded
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              Recent analytics events captured from this browser session data.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-surface/30 p-6 text-center text-sm text-muted-foreground">
            No activity has been recorded yet.
          </div>
        ) : (
          events.map((evt) => {
            const config = EVENT_CONFIG[evt.type] || EVENT_CONFIG.page_view;
            return (
              <div
                key={evt.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface/40 p-3 transition-colors hover:bg-surface hover:border-border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">🧭</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground truncate">
                        {evt.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 font-semibold flex items-center gap-1 ${config.color}`}
                      >
                        {config.icon}
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{evt.detail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0 ms-auto sm:ms-0">
                  <span className="hidden md:inline-block font-medium">Local</span>
                  <span className="hidden sm:inline-block font-mono text-[10px] bg-card px-2 py-0.5 rounded-md border border-border/60">
                    This browser
                  </span>
                  <span className="font-semibold text-foreground text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                    {formatRelativeTime(evt.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
