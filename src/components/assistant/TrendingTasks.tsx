import { Flame, ArrowUpRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TrendingTasksProps {
  onSelectTask: (taskPrompt: string) => void;
}

const TRENDING_TASKS = [
  {
    title: "Compress PNG photo",
    prompt: "Compress PNG image file size under 500KB without losing visual quality",
    badge: "Image",
    icon: "🖼️",
  },
  {
    title: "Translate to French",
    prompt: "Translate this text into French with natural grammar and tone",
    badge: "Translation",
    icon: "🌐",
  },
  {
    title: "Remove photo background",
    prompt: "Cut out background from image and export transparent PNG",
    badge: "AI Image",
    icon: "✂️",
  },
  {
    title: "Generate Wi-Fi QR code",
    prompt: "Create a custom QR code for my Wi-Fi network credentials",
    badge: "Utility",
    icon: "📱",
  },
  {
    title: "Create strong password",
    prompt: "Generate 24-character high-entropy password with numbers and symbols",
    badge: "Security",
    icon: "🔐",
  },
  {
    title: "Enhance photo quality",
    prompt: "Upscale image resolution 4x and sharpen facial details",
    badge: "AI Tool",
    icon: "✨",
  },
];

export function TrendingTasks({ onSelectTask }: TrendingTasksProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Flame className="size-4 text-amber-500" />
          <span>Trending Tasks</span>
        </h3>
        <span className="text-[11px] text-muted-foreground font-medium">
          Popular community workflows
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {TRENDING_TASKS.map((task) => (
          <button
            key={task.title}
            onClick={() => onSelectTask(task.prompt)}
            className="group relative flex items-start justify-between gap-2 rounded-2xl border border-border/70 bg-card/60 p-3 text-start shadow-xs transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-md"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{task.icon}</span>
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {task.title}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                "{task.prompt}"
              </p>
            </div>
            <ArrowUpRight className="size-3.5 text-muted-foreground/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary shrink-0 mt-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
