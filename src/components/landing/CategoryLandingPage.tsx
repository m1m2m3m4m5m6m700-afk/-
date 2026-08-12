import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Search,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Layers,
  Flame,
  BookOpen,
  Target,
  BarChart3,
} from "lucide-react";
import { getCategory, categoryById, type CategoryId } from "@/data/categories";
import { tools, type Tool } from "@/data/tools";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackCategoryVisit, trackPageView } from "@/lib/analytics";
import { SITE_URL } from "@/lib/seo/site";

const TOOL_STATUS_ORDER: Record<Tool["status"], number> = {
  ready: 0,
  planned: 1,
  placeholder: 2,
};

interface CategoryLandingPageProps {
  categoryId: CategoryId;
}

export function CategoryLandingPage({ categoryId }: CategoryLandingPageProps) {
  const category = getCategory(categoryId);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [visibleCount, setVisibleCount] = useState(18);
  const initialVisibleCount = 18;

  const categoryName = category?.name || "AI Tools Category";
  const categoryDesc =
    category?.description ||
    `Explore fast, free, and private browser-based ${categoryName} on Flixo.`;

  const categoryContentMap: Record<
    string,
    {
      intro: string;
      whyUse: string[];
      useCases: string[];
      comparisons: string[];
      relatedSlugs: CategoryId[];
      faq: Array<{ question: string; answer: string }>;
    }
  > = {
    ai: {
      intro:
        "Flixo AI Tools bring fast, private, and browser-based assistance for content creation, analysis, summarization, and workflow support.",
      whyUse: [
        "Move from raw ideas to polished results without switching between multiple apps.",
        "Use AI features for writing, research, and advisory tasks inside a lightweight workspace.",
        "Keep the experience simple, free, and accessible from any device.",
      ],
      useCases: [
        "Draft blog post ideas, emails, and marketing copy.",
        "Summarize dense reports, notes, and team discussions.",
        "Create presentations, resumes, and product descriptions quickly.",
      ],
      comparisons: [
        "Use AI writing tools when you need fast drafts and rewrites.",
        "Use AI analysis tools when you need summaries and insights from large text content.",
      ],
      relatedSlugs: ["translation", "writing", "developer"],
      faq: [
        {
          question: "What makes Flixo AI tools different from large AI chat apps?",
          answer:
            "Flixo focuses on lightweight, task-specific AI experiences that are easier to use, faster to access, and more appropriate for everyday productivity work.",
        },
        {
          question: "Are these AI tools free to use?",
          answer:
            "Yes. Flixo keeps its AI tool collection free and browser-first, so you can try tasks without needing an account or subscription.",
        },
      ],
    },
    images: {
      intro:
        "Flixo Image Tools help creators, marketers, and everyday users resize, improve, clean, and convert images without needing heavy desktop software.",
      whyUse: [
        "Prepare visual assets for social media, ecommerce, presentations, and print.",
        "Improve quality and reduce size in seconds for faster loading and easier sharing.",
        "Keep edits private and local inside the browser.",
      ],
      useCases: [
        "Enhance product photos before launching a storefront or campaign.",
        "Remove backgrounds for profile pictures, ads, and digital graphics.",
        "Compress image files for faster websites and smoother email delivery.",
      ],
      comparisons: [
        "Use image enhancer for sharpening and upscaling.",
        "Use background remover when you need a transparent cutout.",
        "Use image compressor when file size matters more than perfect pixel detail.",
      ],
      relatedSlugs: ["utilities", "web", "developer"],
      faq: [
        {
          question: "Do these tools work on mobile and desktop?",
          answer:
            "Yes. Flixo image tools are designed to work in modern browsers across desktop and mobile devices.",
        },
        {
          question: "Can I use these tools for ecommerce and marketing assets?",
          answer:
            "Absolutely. They are commonly used for product listings, social media design, and website optimization.",
        },
      ],
    },
    pdf: {
      intro:
        "Flixo PDF Tools make document tasks simpler by helping you compress, convert, protect, and organize content without installing bulky software.",
      whyUse: [
        "Handle common document tasks quickly in one place.",
        "Reduce file size and preserve readability for sharing and storage.",
        "Improve document workflows for students, teams, and freelancers.",
      ],
      useCases: [
        "Convert Word or image files into PDF format for sharing.",
        "Compress large PDFs before emailing them.",
        "Protect a document with password settings or layout-safe conversions.",
      ],
      comparisons: [
        "Use PDF conversion tools for format changes.",
        "Use compression tools when you need smaller file sizes.",
        "Use security tools when you need to protect sensitive documents.",
      ],
      relatedSlugs: ["files", "utilities", "developer"],
      faq: [
        {
          question: "Are these PDF tools suitable for work documents?",
          answer:
            "Yes. They are useful for both everyday office tasks and professional document preparation.",
        },
        {
          question: "Can I work with PDFs without installing software?",
          answer:
            "Yes. Flixo PDF tools are browser-based and accessible without installing desktop applications.",
        },
      ],
    },
    translation: {
      intro:
        "Flixo Translation Tools help you move content across languages quickly with a focus on clarity, speed, and privacy-friendly workflows.",
      whyUse: [
        "Translate messages, documents, and copy for international audiences.",
        "Reduce friction in onboarding, support, and communication workflows.",
        "Keep everything simple with tools that work directly in the browser.",
      ],
      useCases: [
        "Translate support replies and customer messages.",
        "Localize blog posts and marketing copy for new markets.",
        "Translate documents and image text without needing a separate platform.",
      ],
      comparisons: [
        "Use the main translator for everyday text translation.",
        "Use document or image translation tools when the source content needs structural preservation.",
      ],
      relatedSlugs: ["ai", "utilities", "web"],
      faq: [
        {
          question: "Are these translation tools appropriate for business use?",
          answer:
            "Yes. They are practical for customer communication, internal documentation, and multilingual content preparation.",
        },
        {
          question: "Can I use them for long-form content?",
          answer:
            "Yes, especially for shorter documents and repeated translation tasks. Flixo also supports planned expansions for larger translation workflows.",
        },
      ],
    },
  };

  const categoryContent = categoryContentMap[categoryId] ?? {
    intro: categoryDesc,
    whyUse: [
      "Use these tools to simplify daily work without installing heavy software.",
      "Keep everything private, fast, and accessible from a browser.",
    ],
    useCases: [
      "Complete everyday tasks faster with lightweight utilities.",
      "Improve quality and productivity without leaving the Flixo workspace.",
    ],
    comparisons: [
      "Choose the right tool based on your specific task, speed, and output requirements.",
    ],
    relatedSlugs: ["utilities", "developer", "web"] as CategoryId[],
    faq: [
      {
        question: `Is ${categoryName} suitable for everyday use?`,
        answer: `Yes. ${categoryName} is built for practical, repeatable browser-based tasks that save time and reduce friction.`,
      },
    ],
  };

  usePageSeo(undefined, {
    title: `${categoryName} — Free Online ${categoryName} | Flixo`,
    description: `${categoryDesc} Free to use, no account required, 100% private in-browser toolsuite.`,
    keywords: [
      categoryName.toLowerCase(),
      `free ${categoryName.toLowerCase()}`,
      `online ${categoryName.toLowerCase()}`,
      "flixo category",
      "ai tools",
    ],
  });

  useEffect(() => {
    trackPageView(`/categories/${categoryId}`);
    trackCategoryVisit(categoryId);
  }, [categoryId]);

  useEffect(() => {
    setVisibleCount(initialVisibleCount);
  }, [searchQuery]);

  if (!category) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h1 className="text-2xl font-bold">Category Not Found</h1>
          <p className="mt-2 text-muted-foreground">The requested category could not be located.</p>
          <Link to="/" className="mt-4 inline-block font-semibold text-primary underline">
            Return to Homepage
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const CategoryIcon = category.icon;
  const categoryTools = tools.filter((t) => t.categoryId === categoryId && t.status === "ready");
  const sortedTools = [...categoryTools].sort((a, b) => {
    const statusDiff = TOOL_STATUS_ORDER[a.status] - TOOL_STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    return a.name.localeCompare(b.name);
  });

  const filteredTools = sortedTools.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const visibleTools = filteredTools.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredTools.length;

  const otherCategories = Object.values(categoryById)
    .filter((c) => c.id !== categoryId)
    .slice(0, 6);
  const relatedCategories = otherCategories.filter((c) =>
    categoryContent.relatedSlugs.includes(c.id),
  );
  const fallbackRelatedCategories = otherCategories.slice(0, 3);
  const featuredRelatedCategories =
    relatedCategories.length > 0 ? relatedCategories : fallbackRelatedCategories;

  // JSON-LD Schema
  const siteUrl = SITE_URL;
  const pageUrl = `${siteUrl}/categories/${categoryId}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: pageUrl,
      },
    ],
  };

  const categoryFaqs = [
    {
      question: `Are all ${categoryName} on Flixo free to use?`,
      answer: `Yes! All tools in ${categoryName} are 100% free with no hidden paywalls, API subscription requirements, or sign-up needed.`,
    },
    {
      question: `Does Flixo store my data when using ${categoryName}?`,
      answer:
        "No. Flixo processes all tool interactions locally inside your web browser using HTML5 and Canvas APIs. Your files and text are never uploaded to remote servers.",
    },
    {
      question: `Can I request a new tool for the ${categoryName} hub?`,
      answer:
        "Yes! Use our 'Request Tool' feature from the footer or home page to submit new tool ideas to our engineering roadmap.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categoryFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryName,
    description: categoryDesc,
    url: pageUrl,
    hasPart: sortedTools.map((tool) => ({
      "@type": "SoftwareApplication",
      name: tool.name,
      url: tool.slug ? `${siteUrl}/tools/${tool.slug}` : `${siteUrl}/#categories`,
    })),
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${categoryName} tools`,
    itemListElement: sortedTools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: tool.slug ? `${siteUrl}/tools/${tool.slug}` : `${siteUrl}/#categories`,
    })),
  };

  return (
    <SiteLayout>
      {/* JSON-LD Structured Data */}
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <JsonLd data={itemListSchema} />
      <JsonLd data={faqSchema} />

      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 md:pt-14 space-y-12">
          {/* Breadcrumb Navigation */}
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
              <li className="font-semibold text-foreground" aria-current="page">
                {categoryName}
              </li>
            </ol>
          </nav>

          {/* Header Banner */}
          <header className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary shadow-xs">
                <CategoryIcon className="size-7" />
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{categoryName}</h1>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {categoryTools.length} Tools
                  </span>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {categoryDesc}
                </p>
              </div>
            </div>

            {/* In-category Search bar */}
            <div className="mt-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search tools in ${categoryName}...`}
                className="w-full rounded-2xl border border-border bg-surface/80 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </header>

          <section className="rounded-2xl border border-border/60 bg-card/40 p-6 space-y-6">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Why this category matters</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{categoryContent.intro}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-surface/50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Target className="size-4 text-primary" /> Why use these tools
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {categoryContent.whyUse.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 size-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border/60 bg-surface/50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BarChart3 className="size-4 text-primary" /> Best use cases
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {categoryContent.useCases.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 size-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card/40 p-6 space-y-4">
            <h2 className="text-lg font-semibold">How to choose the right tool</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {categoryContent.comparisons.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-border/60 bg-surface/50 p-4 text-sm text-muted-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          {/* Tools Grid */}
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold tracking-tight">Available & Planned Tools</h2>
              <span className="text-xs text-muted-foreground">
                Showing {visibleTools.length} of {filteredTools.length} tools
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleTools.map((tool) => (
                <ToolCategoryCard key={tool.id} tool={tool} />
              ))}
            </div>

            {canLoadMore && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((current) =>
                      Math.min(current + initialVisibleCount, filteredTools.length),
                    )
                  }
                  className="mt-6 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15"
                >
                  Show {Math.min(filteredTools.length - visibleCount, initialVisibleCount)} more
                  tools
                </button>
              </div>
            )}

            {visibleCount > initialVisibleCount && filteredTools.length > initialVisibleCount && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount(initialVisibleCount)}
                  className="mt-4 rounded-full border border-border bg-surface px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/10"
                >
                  Show fewer tools
                </button>
              </div>
            )}

            {filteredTools.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <p className="text-sm">No tools found matching "{searchQuery}".</p>
              </div>
            )}
          </section>

          {/* SEO Content & Information */}
          <section className="rounded-2xl border border-border/60 bg-card/40 p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight">
                Why Choose Flixo's {categoryName}?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Flixo's {categoryName} collection brings lightweight, privacy-focused utilities
                directly into your browser window. Designed for speed, security, and accessibility
                across all devices.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs sm:text-sm">
              <div className="rounded-xl border border-border/60 bg-surface/50 p-4 space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary" /> 100% Free
                </div>
                <p className="text-muted-foreground text-xs">
                  No subscriptions, credits, or hidden daily quotas.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-surface/50 p-4 space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="size-4 text-primary" /> Browser-Based
                </div>
                <p className="text-muted-foreground text-xs">
                  All rendering executes inside client memory with zero server uploads.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-surface/50 p-4 space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Flame className="size-4 text-amber-500" /> Fast Execution
                </div>
                <p className="text-muted-foreground text-xs">
                  Instant response without network processing queues.
                </p>
              </div>
            </div>
          </section>

          {/* Category FAQ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="size-5 text-primary" />
              <h2 className="text-lg font-bold tracking-tight md:text-xl">
                {categoryName} Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-3">
              {categoryFaqs.map((faq, index) => {
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
            <h3 className="text-lg font-bold tracking-tight">Related categories</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {featuredRelatedCategories.map((c) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={c.id}
                    to="/categories/$slug"
                    params={{ slug: c.id }}
                    className="group rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 flex items-center gap-3"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate block">
                        {c.toolIds.length} Tools
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="border-t border-border/60 pt-8 space-y-4">
            <h3 className="text-lg font-bold tracking-tight">Popular tools in this category</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sortedTools.slice(0, 6).map((tool) => {
                const destination = tool.slug ? (`/tools/${tool.slug}` as never) : null;

                if (!destination) {
                  return (
                    <div key={tool.id} className="rounded-xl border border-border/80 bg-card p-4">
                      <div className="text-sm font-semibold text-foreground">{tool.name}</div>
                      <p className="mt-2 text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                  );
                }

                return (
                  <Link
                    key={tool.id}
                    to={destination}
                    className="rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50"
                  >
                    <div className="text-sm font-semibold text-foreground">{tool.name}</div>
                    <p className="mt-2 text-xs text-muted-foreground">{tool.description}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}

function ToolCategoryCard({ tool }: { tool: Tool }) {
  const isReady = tool.status === "ready" && tool.slug;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-foreground">{tool.name}</h3>
          {isReady ? (
            <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
              Ready
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Planned
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
        {tool.tags && tool.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground/80 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between">
        {isReady ? (
          <Link
            to={`/tools/${tool.slug!}` as never}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            Launch Tool <ArrowRight className="size-3.5" />
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground italic">Coming to Roadmap</span>
        )}
      </div>
    </div>
  );
}
