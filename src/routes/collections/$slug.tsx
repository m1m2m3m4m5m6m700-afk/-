import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Layers,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { collectionRegistry } from "@/data/seoEnterpriseData";
import { tools } from "@/data/tools";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { LastUpdatedBadge } from "@/components/seo/LastUpdatedBadge";

export const Route = createFileRoute("/collections/$slug")({
  component: CollectionSlugRoute,
});

function CollectionSlugRoute() {
  const { slug } = Route.useParams();
  const col = collectionRegistry.find((c) => c.slug === slug || c.id === slug);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  usePageSeo(undefined, {
    title: col ? `${col.title} | Flixo Collections` : "Collection Not Found | Flixo",
    description: col?.metaDescription || "Flixo curated tool collection.",
    keywords: ["flixo collections", col?.title || ""],
  });

  useEffect(() => {
    trackPageView(`/collections/${slug}`);
  }, [slug]);

  if (!col) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h1 className="text-2xl font-bold">Collection Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The requested tool collection does not exist.
          </p>
          <Link
            to="/collections"
            className="mt-4 inline-block font-semibold text-primary underline"
          >
            Back to Collections Index
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const bundledTools = tools.filter((t) => col.toolIds.includes(t.id) && t.status === "ready");

  const siteUrl = "https://flixotools.com";
  const pageUrl = `${siteUrl}/collections/${col.slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Collections", item: `${siteUrl}/collections` },
      { "@type": "ListItem", position: 3, name: col.title, item: pageUrl },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: col.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <SiteLayout>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <div className="bg-hero-glow min-h-screen">
        <article className="mx-auto max-w-4xl px-5 pb-20 pt-10 md:pt-14 space-y-10">
          {/* Breadcrumb */}
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
                <Link to="/collections" className="hover:text-foreground transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 opacity-60 rtl:rotate-180" />
              </li>
              <li
                className="font-semibold text-foreground truncate max-w-[200px]"
                aria-current="page"
              >
                {col.title}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="space-y-4">
            <LastUpdatedBadge />
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              <Layers className="size-4" /> Curated Tool Suite
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground leading-tight">
              {col.title}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {col.description}
            </p>
          </header>

          {/* Tools Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Bundled Tools in this Pack</h2>
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                <ShieldCheck className="size-3.5" /> 100% Free & In-Browser
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {bundledTools.map((tool) => (
                <div
                  key={tool.id}
                  className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 flex flex-col justify-between hover:border-primary/50 transition-all"
                >
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full mb-2">
                      <Sparkles className="size-3" /> Ready to Use
                    </span>
                    <h3 className="text-base font-bold text-foreground">{tool.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                  {tool.slug && (
                    <Link
                      to={`/tools/${tool.slug}` as never}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      Launch Utility <ArrowRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="size-5 text-primary" />
              <h2 className="text-lg font-bold tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {col.faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-border/80 bg-surface/30 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-foreground focus:outline-none"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`size-4 shrink-0 transition-transform ${
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
        </article>
      </div>
    </SiteLayout>
  );
}
