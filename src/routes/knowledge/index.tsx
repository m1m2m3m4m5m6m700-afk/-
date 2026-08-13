import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { BookOpen, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { knowledgeHubArticles, bestToolsPages } from "@/data/knowledgeHub";
import { SITE_URL } from "@/lib/seo/site";

export const Route = createFileRoute("/knowledge/")({
  component: KnowledgeHubRoute,
});

function KnowledgeHubRoute() {
  usePageSeo(undefined, {
    title: "Knowledge Hub — Flixo Guides, Comparisons & Best Tool Lists",
    description:
      "Explore Flixo's Knowledge Hub for how-to guides, best tools lists, comparisons, and practical browser-based workflow articles.",
    keywords: ["flixo knowledge hub", "tool guides", "browser workflow guides"],
  });

  useEffect(() => {
    trackPageView("/knowledge");
  }, []);

  const siteUrl = SITE_URL;
  const pageUrl = `${siteUrl}/knowledge`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Knowledge Hub", item: pageUrl },
    ],
  };

  return (
    <SiteLayout>
      <JsonLd data={breadcrumbSchema} />

      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 md:pt-14 space-y-10">
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
                Knowledge Hub
              </li>
            </ol>
          </nav>

          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <BookOpen className="size-3.5" />
              Flixo Knowledge Hub
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Guides, comparisons, and best-tool pages built for topical authority.
            </h1>
            <p className="max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
              This hub groups practical articles around the same tool families and categories that
              power Flixo’s product experience.
            </p>
          </header>

          <section className="rounded-3xl border border-border/80 bg-card/80 p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">How-to and guide articles</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {knowledgeHubArticles.map((article) => (
                <article
                  key={article.id}
                  className="rounded-2xl border border-border/70 bg-surface/60 p-5 space-y-3"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                    {article.templateId}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">{article.summary}</p>
                  <Link
                    to="/knowledge/article/$slug"
                    params={{ slug: article.slug }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    Read article <ArrowRight className="size-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border/80 bg-card/80 p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Best tools pages</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {bestToolsPages.map((page) => (
                <article
                  key={page.id}
                  className="rounded-2xl border border-border/70 bg-surface/60 p-5 space-y-3"
                >
                  <h3 className="text-base font-semibold text-foreground">{page.title}</h3>
                  <p className="text-sm text-muted-foreground">{page.summary}</p>
                  <Link
                    to="/knowledge/best/$slug"
                    params={{ slug: page.slug }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    View category guide <ArrowRight className="size-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
