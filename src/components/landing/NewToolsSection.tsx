import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { tools } from "@/data/tools";
import { categoryById } from "@/data/categories";
import { useI18n } from "@/lib/i18n";
import { resolveToolName, resolveCategoryName } from "@/lib/i18n/keys";

const NEW_IDS = [
  "background-remover",
  "image-compressor",
  "qr-generator",
  "password-generator",
  "image-enhancer",
  "word-counter",
];

/** Newly added tools — signals to visitors and crawlers that Flixo keeps shipping. */
export function NewToolsSection() {
  const { t } = useI18n();
  const fresh = NEW_IDS.map((id) => tools.find((tool) => tool.id === id)).filter(
    (tool): tool is NonNullable<typeof tool> => Boolean(tool?.slug && tool.status === "ready"),
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-xl bg-emerald-500/12 text-emerald-500">
          <Sparkles className="size-4" />
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">New on Flixo</h2>
          <p className="text-xs text-muted-foreground">Recently shipped tools, updated weekly.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fresh.map((tool) => {
          const category = categoryById.get(tool.categoryId);
          return (
            <Link
              key={tool.id}
              to="/tools/$slug"
              params={{ slug: tool.slug! }}
              className="group rounded-2xl border border-border/70 bg-surface/60 p-4 transition-all hover:border-emerald-500/40 hover:shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary">
                  {resolveToolName(tool.slug || tool.id, t)}
                </h3>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                  New
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{tool.description}</p>
              {category && (
                <p className="mt-3 text-[11px] font-medium text-muted-foreground">
                  {resolveCategoryName(category.id, t)}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
