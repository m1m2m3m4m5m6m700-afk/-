import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { tools, type Tool } from "@/data/tools";
import { categoryById } from "@/data/categories";
import { resolveToolName } from "@/lib/i18n/keys";
import { useI18n } from "@/lib/i18n";

const PRIMARY_CATEGORY_IDS = ["images", "video", "audio", "pdf"] as const;

const CATEGORY_COPY: Record<(typeof PRIMARY_CATEGORY_IDS)[number], { title: string; subtitle: string }> = {
  images: {
    title: "Images",
    subtitle: "Edit, compress, enhance, convert and work with images in one place.",
  },
  video: {
    title: "Video",
    subtitle: "Trim, merge, compress, convert and prepare videos without heavy software.",
  },
  audio: {
    title: "MP3 & Audio",
    subtitle: "Convert, cut, compress, clean and transcribe audio files quickly.",
  },
  pdf: {
    title: "PDF",
    subtitle: "Merge, split, compress, convert, protect and edit PDF documents.",
  },
};

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const { t } = useI18n();
  const ready = tool.status === "ready" && Boolean(tool.slug);

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-foreground">
            {resolveToolName(tool.slug || tool.id, t)}
          </span>
          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
            {tool.description}
          </span>
        </span>
        {ready ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-label="Ready" />
        ) : (
          <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" aria-label="Coming soon" />
        )}
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
        {ready ? "Open tool" : "Coming soon"}
        {ready && <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />}
      </span>
    </>
  );

  if (!ready) {
    return (
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 opacity-80">
        {content}
      </div>
    );
  }

  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug! }}
      className="group rounded-2xl border border-border/70 bg-card/75 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-lift"
    >
      {content}
    </Link>
  );
}

export function PrimaryToolCategories() {
  return (
    <div className="space-y-8">
      {PRIMARY_CATEGORY_IDS.map((categoryId) => {
        const category = categoryById.get(categoryId);
        if (!category) return null;

        const toolsForCategory = category.toolIds
          .map((id) => tools.find((tool) => tool.id === id))
          .filter((tool): tool is Tool => Boolean(tool));

        const copy = CATEGORY_COPY[categoryId];
        const Icon = category.icon;

        return (
          <motion.section
            key={categoryId}
            id={category.anchor}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.35 }}
            className="scroll-mt-24"
          >
            <div className="mb-4 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4.5" />
                  </span>
                  <h2 className="text-xl font-black tracking-tight sm:text-2xl">{copy.title}</h2>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{copy.subtitle}</p>
              </div>
              <Link
                to="/categories/$slug"
                params={{ slug: categoryId }}
                className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-primary sm:inline-flex"
              >
                View all
                <ArrowRight className="size-3.5 rtl:-scale-x-100" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {toolsForCategory.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} />
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
