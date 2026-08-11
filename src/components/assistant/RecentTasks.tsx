import { History, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface RecentTasksProps {
  tasks: string[];
  onSelectTask: (prompt: string) => void;
  onClearTasks: () => void;
}

export function RecentTasks({ tasks, onSelectTask, onClearTasks }: RecentTasksProps) {
  const { t } = useI18n();
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <History className="size-4 text-primary" />
          <span>{t("brain.section.recentTasks")}</span>
        </h3>

        <button
          onClick={onClearTasks}
          className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
        >
          <Trash2 className="size-3" />
          <span>{t("brain.section.clearHistory")}</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tasks.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelectTask(prompt)}
            className="group inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface/50 px-3 py-1.5 text-xs text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-xs"
          >
            <span className="truncate max-w-[240px] font-medium">"{prompt}"</span>
            <ArrowRight className="size-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </button>
        ))}
      </div>
    </div>
  );
}
