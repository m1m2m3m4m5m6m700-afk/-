import { BarChart3, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAnalytics, clearAnalytics, type AnalyticsData } from "@/lib/analytics";

interface AnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnalyticsDialog({ open, onOpenChange }: AnalyticsDialogProps) {
  const [data, setData] = useState<AnalyticsData>(() => getAnalytics());

  const handleRefresh = () => {
    setData(getAnalytics());
  };

  const handleClear = () => {
    clearAnalytics();
    setData(getAnalytics());
  };

  const renderSection = (title: string, items: Record<string, number>) => {
    const entries = Object.entries(items).sort((a, b) => b[1] - a[1]);
    return (
      <div className="rounded-xl border border-border/60 bg-surface/50 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
        {entries.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground italic">No data logged yet</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {entries.slice(0, 5).map(([key, count]) => (
              <li key={key} className="flex items-center justify-between text-xs">
                <span className="truncate text-foreground font-medium max-w-[200px]">{key}</span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-primary font-bold">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (val) handleRefresh();
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-w-md rounded-2xl border-border bg-card shadow-lift">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <BarChart3 className="size-5 text-primary" />
            Local Workspace Analytics
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            100% private, client-side usage statistics stored in your browser's local storage.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {renderSection("Top Landing Pages", data.landingPages)}
          {renderSection("Most Visited Tools", data.openedTools)}
          {renderSection("Most Searched Keywords", data.searchedKeywords)}
          {renderSection("Exit Pages", data.exitPages)}
          {renderSection("Most Visited Categories", data.visitedCategories)}
          {renderSection("Most Requested Tools", data.requestedTools)}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="me-1.5 size-3.5" />
            Clear Stats
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
