import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Briefcase, ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { useCaseRegistry } from "@/data/seoEnterpriseData";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { LastUpdatedBadge } from "@/components/seo/LastUpdatedBadge";
import { SITE_URL } from "@/lib/seo/site";

export const Route = createFileRoute("/use-cases/")({
  component: UseCasesIndexRoute,
});

function UseCasesIndexRoute() {
  usePageSeo(undefined, {
    title: "Use-Case Landing Hub — Flixo Workflows & Solutions",
    description:
      "Explore tailored Flixo browser tool workflows for e-commerce store owners, privacy-first translation, Wi-Fi code sharing, and creator media production.",
    keywords: [
      "flixo use cases",
      "e-commerce product photo tools",
      "privacy translation workflow",
      "wifi qr generator for cafe",
    ],
  });

  useEffect(() => {
    trackPageView("/use-cases");
  }, []);

  const siteUrl = SITE_URL;
  const pageUrl = `${siteUrl}/use-cases`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Use Cases", item: pageUrl },
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
                Use Cases
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="space-y-4">
            <LastUpdatedBadge />
            <div className="flex items-center gap-2">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Briefcase className="size-5" />
              </span>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Flixo Workflows & Use-Case Solutions
              </h1>
            </div>
            <p className="max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
              Step-by-step guides and tool combinations tailored for specific industries, digital
              creators, enterprise developers, and e-commerce merchants.
            </p>
          </header>

          {/* Use-cases Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {useCaseRegistry.map((uc) => (
              <div
                key={uc.id}
                className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all"
              >
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-wider">
                    <Sparkles className="size-3" /> {uc.targetAudience}
                  </span>
                  <h2 className="text-lg font-bold text-foreground leading-snug">
                    <Link
                      to="/use-cases/$slug"
                      params={{ slug: uc.slug }}
                      className="hover:text-primary transition-colors"
                    >
                      {uc.title}
                    </Link>
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {uc.solutionSummary}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {uc.recommendedToolIds.length} Recommended Tools
                  </span>
                  <Link
                    to="/use-cases/$slug"
                    params={{ slug: uc.slug }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    View Workflow <ArrowRight className="size-3.5" />
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
