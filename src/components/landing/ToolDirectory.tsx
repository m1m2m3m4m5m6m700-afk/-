import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { sortedCategories, type CategoryId } from "@/data/categories";
import { toolsByCategory } from "@/data/tools";
import { ToolCard } from "@/components/landing/ToolCard";
import { SponsorSection } from "@/components/landing/SponsorSection";
import { Sparkles } from "lucide-react";

interface ToolDirectoryProps {
  onRequestTool: (prefillPrompt?: string) => void;
  highlightedCategoryId?: CategoryId | null;
}

/** Full tools directory — one section per category, completely data-driven. */
export function ToolDirectory({ onRequestTool, highlightedCategoryId }: ToolDirectoryProps) {
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<CategoryId>>(new Set());

  const toggleCategoryExpansion = (categoryId: CategoryId) => {
    setExpandedCategoryIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  return (
    <section id="tools" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 md:py-28">
      {/* Directory Section Header */}
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground shadow-xs">
          <Sparkles className="size-3.5 text-primary" />
          Full Directory
        </span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          All Flixo Tools & Roadmap
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Everything on our active roadmap, organized into high-speed hubs. Ready tools launch
          instantly in your browser; planned tools can be requested for priority development.
        </p>
      </div>

      {/* Category Sections */}
      <div className="space-y-16">
        {sortedCategories.map((category, index) => {
          const Icon = category.icon;
          const catTools = toolsByCategory(category.id).filter((t) => t.status === "ready");
          if (catTools.length === 0) return null;

          const isHighlighted = highlightedCategoryId === category.id;
          const isExpanded = expandedCategoryIds.has(category.id);
          const visibleTools = isExpanded ? catTools : catTools.slice(0, 12);
          const readyCount = catTools.filter((t) => t.status === "ready").length;
          const showSponsorBetween = index === 2;

          return (
            <div key={category.id} className="space-y-16">
              <motion.div
                id={`cat-${category.anchor}`}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className={`scroll-mt-24 rounded-3xl border p-6 md:p-8 backdrop-blur-md transition-all duration-300 ${
                  isHighlighted
                    ? "border-primary/60 bg-primary/5 ring-2 ring-primary/40 shadow-lift"
                    : "border-border/60 bg-card/40"
                }`}
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
                  <div className="flex items-center gap-3.5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        {category.name}
                        {isHighlighted && (
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary animate-pulse">
                            Matched
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full border border-border/80 bg-surface/80 px-3 py-1 font-medium text-muted-foreground">
                      {visibleTools.length} / {catTools.length}{" "}
                      {catTools.length === 1 ? "tool" : "tools"}
                    </span>
                    {readyCount > 0 && (
                      <span className="rounded-full border border-primary/30 bg-primary/15 px-3 py-1 font-semibold text-primary">
                        {readyCount} ready
                      </span>
                    )}
                  </div>
                </div>

                {/* Responsive Tools Grid */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onRequestTool={onRequestTool}
                      isHighlighted={isHighlighted}
                    />
                  ))}
                </div>

                {catTools.length > 12 && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="secondary"
                      onClick={() => toggleCategoryExpansion(category.id)}
                    >
                      {isExpanded ? "Show fewer tools" : `Show all ${catTools.length} tools`}
                    </Button>
                  </div>
                )}
              </motion.div>

              {showSponsorBetween && <SponsorSection />}
            </div>
          );
        })}
      </div>

      {/* Call to Action Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-20 rounded-3xl border border-border/80 bg-gradient-to-br from-card/80 via-card/50 to-surface/80 p-8 md:p-12 text-center shadow-lift backdrop-blur-xl"
      >
        <div className="mx-auto max-w-md">
          <span className="grid size-12 mx-auto place-items-center rounded-2xl bg-primary/15 text-primary">
            <Sparkles className="size-6" />
          </span>
          <h3 className="mt-4 text-2xl font-bold text-foreground">Need a tool that isn't here?</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We build tools directly based on user requests. Tell us what workflow you'd like to
            automate next.
          </p>
          <Button className="mt-6 rounded-xl px-6 py-2.5 shadow-md" onClick={() => onRequestTool()}>
            Request a custom tool
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
