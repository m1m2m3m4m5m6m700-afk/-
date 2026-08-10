import { Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";
import { motion } from "motion/react";
import { tools } from "@/data/tools";
import { categoryById } from "@/data/categories";

const POPULAR_IDS = [
  "image-enhancer",
  "background-remover",
  "image-compressor",
  "qr-generator",
  "password-generator",
  "word-counter",
];

/** Most used tools — a short curated shortlist instead of the whole directory. */
export function PopularToolsSection() {
  const popular = POPULAR_IDS.map((id) => tools.find((tool) => tool.id === id)).filter(
    (tool): tool is NonNullable<typeof tool> => Boolean(tool?.slug && tool.status === "ready"),
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-xl bg-primary/12 text-primary">
          <Star className="size-4" />
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">Most used tools</h2>
          <p className="text-xs text-muted-foreground">
            The shortcuts people open the most on Flixo.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {popular.map((tool, index) => {
          const category = categoryById.get(tool.categoryId);
          const Icon = category?.icon;
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <Link
                to="/tools/$slug"
                params={{ slug: tool.slug! }}
                className="group flex h-full flex-col gap-2 rounded-2xl border border-border/80 bg-card/80 p-4 transition-all hover:border-primary/50 hover:shadow-lift"
              >
                <span className="flex items-center gap-2">
                  {Icon && <Icon className="size-4 text-primary" />}
                  <span className="text-sm font-bold text-foreground group-hover:text-primary">
                    {tool.name}
                  </span>
                </span>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-primary">
                  Open tool
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
