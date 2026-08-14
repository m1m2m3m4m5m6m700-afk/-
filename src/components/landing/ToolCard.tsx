import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, Clock, Lightbulb } from "lucide-react";
import { motion } from "motion/react";
import { categoryById } from "@/data/categories";
import { toolRoute, type Tool, type ToolStatus } from "@/data/tools";
import { cn } from "@/lib/utils";
import { trackToolOpen } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { resolveToolName, resolveCategoryName } from "@/lib/i18n/keys";

const STATUS_CONFIG: Record<
  ToolStatus,
  { label: string; bg: string; text: string; dot: string; icon: typeof Sparkles }
> = {
  ready: {
    label: "Ready",
    bg: "bg-primary/15 border-primary/30",
    text: "text-primary",
    dot: "bg-primary animate-pulse",
    icon: Sparkles,
  },
  planned: {
    label: "Planned",
    bg: "bg-accent/15 border-accent/25",
    text: "text-accent-foreground",
    dot: "bg-amber-500",
    icon: Clock,
  },
  placeholder: {
    label: "Idea",
    bg: "bg-muted/80 border-border/80",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground/60",
    icon: Lightbulb,
  },
};

interface ToolCardProps {
  tool: Tool;
  onRequestTool: (toolName?: string) => void;
  isHighlighted?: boolean;
}

export function ToolCard({ tool, onRequestTool, isHighlighted }: ToolCardProps) {
  const { t } = useI18n();
  const route = tool.status === "ready" ? toolRoute(tool) : undefined;
  const category = categoryById.get(tool.categoryId);
  const CategoryIcon = category?.icon;
  const statusCfg = STATUS_CONFIG[tool.status];

  const content = (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative flex h-full flex-col justify-between rounded-2xl border p-5 transition-all duration-300 backdrop-blur-md",
        isHighlighted
          ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-lift"
          : "border-border/70 bg-card/70 hover:border-primary/40 hover:bg-card hover:shadow-lift",
      )}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          {category && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface/80 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {CategoryIcon && <CategoryIcon className="size-3 text-primary" />}
              {resolveCategoryName(category.id, t)}
            </span>
          )}

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium shadow-xs",
              statusCfg.bg,
              statusCfg.text,
            )}
          >
            <span className={cn("size-1.5 rounded-full", statusCfg.dot)} />
            {statusCfg.label}
          </span>
        </div>

        {/* Name & Description */}
        <div className="mt-4">
          <h4 className="flex items-center gap-1.5 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {resolveToolName(tool.slug || tool.id, t)}
            {route && (
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary rtl:-scale-x-100" />
            )}
          </h4>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Tags & Action Footer */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-border/40 pt-3">
        <div className="flex flex-wrap gap-1">
          {tool.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/80"
            >
              #{tag}
            </span>
          ))}
        </div>

        <span className="text-[11px] font-medium text-primary opacity-80 group-hover:opacity-100 transition-opacity">
          {tool.status === "ready" ? "Open →" : "Request →"}
        </span>
      </div>
    </motion.div>
  );

  if (route) {
    return (
      <Link to={route} className="block h-full" onClick={() => trackToolOpen(tool.name)}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={() => {
        trackToolOpen(tool.name);
        onRequestTool(`I am interested in using the ${tool.name} tool`);
      }}
      className="block h-full w-full text-start"
    >
      {content}
    </button>
  );
}
