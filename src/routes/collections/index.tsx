import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Layers, ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { collectionRegistry } from "@/data/seoEnterpriseData";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { LastUpdatedBadge } from "@/components/seo/LastUpdatedBadge";

export const Route = createFileRoute("/collections/")({
  component: CollectionsIndexRoute,
});

function CollectionsIndexRoute() {
  usePageSeo(undefined, {
    title: "Curated Tool Collections — Flixo Bundling Packs",
    description:
      "Explore curated browser tool collections: E-Commerce Photo Suite, Privacy Essentials, and Creator Media Toolkit.",
    keywords: ["tool collections", "ecommerce tools pack", "privacy essentials suite"],
  });

  useEffect(() => {
    trackPageView("/collections");
  }, []);

  const siteUrl = "https://flixotools.com";
  const pageUrl = `${siteUrl}/collections`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Tool Collections", item: pageUrl },
    ],
  };

  return (
    <SiteLayout>
      <JsonLd data={breadcrumbSchema} />

      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 md:pt-14 space-y-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 opacity-60 rtl:rotate-180" />
              </li>
              <li className="font-semibold text-foreground" aria-current="page">
                Tool Collections
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="space-y-4">
            <LastUpdatedBadge />
            <div className="flex items-center gap-2">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Layers className="size-5" />
              </span>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Curated Tool Collections
              </h1>
            </div>
            <p className="max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
              Hand-picked tool bundles assembled to streamline workflows for creators, store owners,
              developers, and privacy enthusiasts.
            </p>
          </header>

          {/* Collections Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collectionRegistry.map((col) => (
              <div
                key={col.id}
                className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all"
              >
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <Sparkles className="size-3" /> Bundled Suite
                  </span>
                  <h2 className="text-xl font-bold text-foreground leading-snug">
                    <Link
                      to="/collections/$slug"
                      params={{ slug: col.slug }}
                      className="hover:text-primary transition-colors"
                    >
                      {col.title}
                    </Link>
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {col.tagline}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {col.toolIds.length} Bundled Tools
                  </span>
                  <Link
                    to="/collections/$slug"
                    params={{ slug: col.slug }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Open Collection <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
