import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Cpu,
  HelpCircle,
  Laptop2,
  Layers,
  ShieldCheck,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";
import { categoryById, type CategoryId } from "@/data/categories";
import { getToolContent } from "@/data/toolContent";
import { getToolSeo, type ToolSeoData } from "@/data/toolSeo";
import { tools, type Tool } from "@/data/tools";
import { LastUpdatedBadge } from "@/components/seo/LastUpdatedBadge";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolStatsWidget } from "@/components/seo/ToolStatsWidget";
import { trackPageView, trackToolOpen } from "@/lib/analytics";
import { buildToolStructuredData } from "@/lib/seo/structuredData";
import { getSuggestedRelatedTools } from "@/lib/seo/relatedTools";

interface ToolSeoSectionProps {
  slug: string;
  toolName: string;
  categoryName: string;
  categoryId?: CategoryId;
}

export function ToolSeoSection({ slug, toolName, categoryName, categoryId }: ToolSeoSectionProps) {
  const seo: ToolSeoData = getToolSeo(slug);
  const content = getToolContent(slug);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    trackPageView(`/tools/${slug}`);
    trackToolOpen(slug);
  }, [slug]);

  const currentTool = tools.find((t) => t.slug === slug || t.id === slug);
  const resolvedCategoryId = categoryId || currentTool?.categoryId || "utilities";
  const category = categoryById.get(resolvedCategoryId);
  const relatedTools = getSuggestedRelatedTools(slug, 6);

  const structuredData = buildToolStructuredData({
    slug,
    toolName,
    categoryName,
    category,
    seo,
    eeat: content.eeat,
  });

  return (
    <article className="mt-16 border-t border-border/60 pt-12 text-foreground space-y-12">
      <JsonLd data={structuredData} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <ol className="flex items-center flex-wrap gap-1.5">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="size-3 opacity-60 rtl:rotate-180" />
            </li>
            <li>
              <Link
                to="/categories/$slug"
                params={{ slug: resolvedCategoryId }}
                className="hover:text-foreground transition-colors"
              >
                {categoryName}
              </Link>
            </li>
            <li>
              <ChevronRight className="size-3 opacity-60 rtl:rotate-180" />
            </li>
            <li className="font-semibold text-foreground" aria-current="page">
              {toolName}
            </li>
          </ol>
        </nav>
        <LastUpdatedBadge date={content.eeat.lastUpdated} version={content.eeat.version} />
      </div>

      <ToolStatsWidget toolId={slug} />

      <section className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight">Trust, privacy, and platform details</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 text-sm">
          <InfoPill icon={Sparkles} label="Author" value={content.eeat.author} />
          <InfoPill icon={Tag} label="Category" value={categoryName} />
          <InfoPill icon={Calendar} label="Last updated" value={content.eeat.lastUpdated} />
          <InfoPill icon={Zap} label="Tool version" value={content.eeat.version} />
          <InfoPill
            icon={Laptop2}
            label="Supported platforms"
            value={content.eeat.supportedPlatforms.join(", ")}
          />
          <InfoPill icon={Cpu} label="Processing type" value={content.eeat.processingType} />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {content.eeat.privacyStatement}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">Overview</h2>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          {content.overview}
        </p>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="rounded-2xl border border-border/80 bg-surface/40 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            <h2 className="text-base font-semibold">How it works</h2>
          </div>
          <ol className="space-y-3 text-xs sm:text-sm">
            {content.howItWorks.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-border/80 bg-surface/40 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-base font-semibold">Features</h2>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            {content.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Use cases</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {content.useCases.map((useCase, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/70 bg-surface/40 p-4 text-sm text-muted-foreground"
            >
              {useCase}
            </div>
          ))}
        </div>
      </section>

      {content.examples && content.examples.length > 0 && (
        <section className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Examples and real-world use</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {content.examples.map((example, index) => (
              <div
                key={index}
                className="rounded-xl border border-border/70 bg-surface/40 p-4 text-sm text-muted-foreground"
              >
                {example}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight md:text-xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-3">
          {content.faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-border/80 bg-surface/30 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-label={`Toggle FAQ: ${faq.question}`}
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-foreground focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`size-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-border/50 px-4 pb-4 pt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border/60 pt-8 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-primary" />
          <h2 className="text-lg font-bold tracking-tight">Related tools</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {relatedTools.map((item) => (
            <ToolLinkCard key={item.id} tool={item} />
          ))}
        </div>
      </section>
    </article>
  );
}

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface/40 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5 text-primary" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ToolLinkCard({ tool }: { tool: Tool }) {
  const isReady = tool.status === "ready" && tool.slug;
  const destination = isReady ? `/tools/${tool.slug}` : `/#categories`;

  return (
    <Link
      to={destination}
      className="group rounded-xl border border-border/80 bg-card p-3.5 transition-all hover:border-primary/50 hover:shadow-xs flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {tool.name}
          </span>
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-transform" />
        </div>
        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{tool.description}</p>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-muted-foreground/70">
          {tool.categoryId}
        </span>
        {isReady ? (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
            Ready
          </span>
        ) : (
          <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Roadmap
          </span>
        )}
      </div>
    </Link>
  );
}
