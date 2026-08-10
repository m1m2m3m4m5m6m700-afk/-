import { useState } from "react";
import { Search, Globe, Laptop, Smartphone, Tablet, Compass, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { BreakdownItem } from "./types";

interface BreakdownListProps {
  title: string;
  subtitle?: string;
  items: BreakdownItem[];
  icon?: React.ReactNode;
  maxDisplay?: number;
  showSearch?: boolean;
  valueBadgeLabel?: string;
}

export function BreakdownList({
  title,
  subtitle,
  items,
  icon,
  maxDisplay = 6,
  showSearch = true,
  valueBadgeLabel = "hits",
}: BreakdownListProps) {
  const [query, setQuery] = useState("");

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category?.toLowerCase().includes(query.toLowerCase()),
  );

  const displayItems = filtered.slice(0, maxDisplay);
  const totalHits = items.reduce((acc, i) => acc + i.count, 0);

  return (
    <div className="rounded-3xl border border-border/80 bg-card/60 p-5 backdrop-blur-xl flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary font-bold">
                {icon}
              </span>
            )}
            <div>
              <h4 className="text-sm font-bold text-foreground">{title}</h4>
              {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-semibold border-primary/30 text-primary">
            {totalHits.toLocaleString()} total
          </Badge>
        </div>

        {/* Optional Search Filter */}
        {showSearch && items.length > 4 && (
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Filter ${title.toLowerCase()}...`}
              className="pl-8 text-xs rounded-xl h-8 bg-surface/50"
            />
          </div>
        )}

        {/* Items List */}
        <div className="space-y-3 pt-1">
          {displayItems.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground italic">
              No data logged yet.
            </div>
          ) : (
            displayItems.map((item, index) => {
              const pct =
                item.percentage || (totalHits > 0 ? Math.round((item.count / totalHits) * 100) : 0);
              return (
                <div key={item.id || item.name} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground/70 w-4 text-center">
                        #{index + 1}
                      </span>
                      {item.icon ? <span className="text-sm shrink-0">{item.icon}</span> : null}
                      <span className="font-semibold text-foreground truncate max-w-[210px]">
                        {item.name}
                      </span>
                      {item.category && (
                        <span className="rounded-md bg-surface px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground hidden sm:inline-block">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                        {pct}%
                      </span>
                      <span className="rounded-lg bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-primary font-bold">
                        {item.count.toLocaleString()} {valueBadgeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
