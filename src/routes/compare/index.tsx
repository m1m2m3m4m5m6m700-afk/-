import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Scale, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";
import { comparisonRegistry } from "@/data/seoEnterpriseData";
import { tools } from "@/data/tools";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { LastUpdatedBadge } from "@/components/seo/LastUpdatedBadge";
import { SITE_URL } from "@/lib/seo/site";
import { useI18n } from "@/lib/i18n";
import { resolveToolName } from "@/lib/i18n/keys";

export const Route = createFileRoute("/compare/")({
  component: CompareIndexRoute,
});

function CompareIndexRoute() {
  const { t } = useI18n();
  usePageSeo(undefined, {
    title: "Tool Comparisons — Flixo vs Traditional SaaS & Cloud Tools",
    description:
      "Compare Flixo free browser-based AI utilities against traditional cloud services like Adobe Express, Google Translate, and Remove.bg.",
    keywords: [
      "tool comparisons",
      "flixo vs adobe",
      "flixo vs google translate",
      "free alternative online tools",
      "client side vs cloud tools",
    ],
  });

  useEffect(() => {
    trackPageView("/compare");
  }, []);

  const siteUrl = SITE_URL;
  const pageUrl = `${siteUrl}/compare`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Comparisons", item: pageUrl },
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
                Comparisons
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="space-y-4">
            <LastUpdatedBadge />
            <div className="flex items-center gap-2">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Scale className="size-5" />
              </span>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Flixo Tool Benchmarks & Comparisons
              </h1>
            </div>
            <p className="max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
              Discover how Flixo’s 100% in-browser, privacy-first tools compare against popular
              cloud software, paid credit models, and sign-up paywalls.
            </p>
          </header>

          {/* Comparisons Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {comparisonRegistry.map((comp) => {
              const matchedTool = tools.find((t) => t.id === comp.toolId);
              return (
                <div
                  key={comp.id}
                  className="rounded-3xl border border-border/80 bg-card/80 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all"
                >
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
                      <ShieldCheck className="size-3.5" /> Client-Side Privacy Advantage
                    </span>
                    <h2 className="text-xl font-bold text-foreground leading-snug">
                      <Link
                        to="/compare/$slug"
                        params={{ slug: comp.slug }}
                        className="hover:text-primary transition-colors"
                      >
                        {comp.title}
                      </Link>
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {comp.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Tool:{" "}
                      {matchedTool
                        ? resolveToolName(matchedTool.slug || matchedTool.id, t)
                        : comp.toolId}
                    </span>
                    <Link
                      to="/compare/$slug"
                      params={{ slug: comp.slug }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      Read Comparison <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
