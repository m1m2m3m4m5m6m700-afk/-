import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { HelpCircle, ArrowRight, ChevronRight, BookOpen } from "lucide-react";
import { questionRegistry } from "@/data/seoEnterpriseData";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { LastUpdatedBadge } from "@/components/seo/LastUpdatedBadge";
import { SITE_URL } from "@/lib/seo/site";

export const Route = createFileRoute("/questions/")({
  component: QuestionsIndexRoute,
});

function QuestionsIndexRoute() {
  usePageSeo(undefined, {
    title: "Question-Based How-To SEO Guides — Flixo Help Center",
    description:
      "Step-by-step answers and free online tool guides for upscaling photos, removing backgrounds, creating Wi-Fi QR codes, and generating passwords.",
    keywords: [
      "how to upscale image",
      "how to remove background free",
      "how to generate password",
      "flixo how-to guides",
    ],
  });

  useEffect(() => {
    trackPageView("/questions");
  }, []);

  const siteUrl = SITE_URL;
  const pageUrl = `${siteUrl}/questions`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Questions & Guides", item: pageUrl },
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
                Questions & How-To Guides
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="space-y-4">
            <LastUpdatedBadge />
            <div className="flex items-center gap-2">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <HelpCircle className="size-5" />
              </span>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Question-Based How-To Guides
              </h1>
            </div>
            <p className="max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
              Clear, step-by-step tutorials and answers to common online tool questions with zero ad
              clutter.
            </p>
          </header>

          {/* Questions Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {questionRegistry.map((q) => (
              <div
                key={q.id}
                className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all"
              >
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-wider">
                    <BookOpen className="size-3.5" /> Step-by-Step Tutorial
                  </span>
                  <h2 className="text-lg font-bold text-foreground leading-snug">
                    <Link
                      to="/questions/$slug"
                      params={{ slug: q.slug }}
                      className="hover:text-primary transition-colors"
                    >
                      {q.question}
                    </Link>
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {q.shortAnswer}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {q.stepByStep.length} Steps Guide
                  </span>
                  <Link
                    to="/questions/$slug"
                    params={{ slug: q.slug }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Read Guide <ArrowRight className="size-3.5" />
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
