import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { comparisonRegistry } from "@/data/seoEnterpriseData";
import { tools } from "@/data/tools";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { LastUpdatedBadge } from "@/components/seo/LastUpdatedBadge";
import { DEFAULT_ROBOTS, NOINDEX_ROBOTS, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { useI18n } from "@/lib/i18n";
import { resolveToolName } from "@/lib/i18n/keys";

export const Route = createFileRoute("/compare/$slug")({
  head: ({ params }) => {
    const comp = comparisonRegistry.find((c) => c.slug === params.slug || c.id === params.slug);
    if (!comp) {
      return { meta: [{ name: "robots", content: NOINDEX_ROBOTS }] };
    }
    const title = comp.title;
    return {
      meta: [
        { title },
        { name: "description", content: comp.metaDescription },
        { name: "robots", content: DEFAULT_ROBOTS },
        { property: "og:title", content: title },
        { property: "og:description", content: comp.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${SITE_URL}/compare/${comp.slug}` },
        { property: "og:site_name", content: SITE_NAME },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: comp.metaDescription },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/compare/${comp.slug}` }],
    };
  },
  beforeLoad: ({ params }) => {
    const comp = comparisonRegistry.find((c) => c.slug === params.slug || c.id === params.slug);
    if (!comp) throw notFound();
  },
  component: ComparisonSlugRoute,
});

function ComparisonSlugRoute() {
  const { t } = useI18n();
  const { slug } = Route.useParams();
  const comp = comparisonRegistry.find((c) => c.slug === slug || c.id === slug);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  usePageSeo(undefined, {
    title: comp ? `${comp.title}` : "Comparison Not Found | Flixo",
    description: comp?.metaDescription || "Compare Flixo tools against traditional software.",
    keywords: ["flixo comparison", comp?.competitorName || "", "free online alternative"],
  });

  useEffect(() => {
    trackPageView(`/compare/${slug}`);
  }, [slug]);

  if (!comp) {
    throw notFound();
  }

  const matchedTool = tools.find((t) => t.id === comp.toolId);
  const siteUrl = SITE_URL;
  const pageUrl = `${siteUrl}/compare/${comp.slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Comparisons", item: `${siteUrl}/compare` },
      { "@type": "ListItem", position: 3, name: comp.title, item: pageUrl },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: comp.faqs.map((faq) => ({
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
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <ol className="flex items-center flex-wrap gap-1.5">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              </li>
              <li><ChevronRight className="size-3 opacity-60 rtl:rotate-180" /></li>
              <li>
                <Link to="/compare" className="hover:text-foreground transition-colors">Comparisons</Link>
              </li>
              <li><ChevronRight className="size-3 opacity-60 rtl:rotate-180" /></li>
              <li className="font-semibold text-foreground truncate max-w-[200px]" aria-current="page">
                {comp.competitorName}
              </li>
            </ol>
          </nav>

          <header className="space-y-4">
            <LastUpdatedBadge />
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground leading-tight">
              {comp.title}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{comp.summary}</p>
          </header>

          <section className="rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-foreground">Feature-by-Feature Comparison Matrix</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="py-3 px-4 font-bold">Feature</th>
                    <th className="py-3 px-4 font-bold text-primary">
                      Flixo {matchedTool ? resolveToolName(matchedTool.slug || matchedTool.id, t) : "Tool"}
                    </th>
                    <th className="py-3 px-4 font-bold">{comp.competitorName}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {comp.matrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground">{row.feature}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Check className="size-4 shrink-0" /> {row.flixo}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {row.competitor.includes("No") || row.competitor.includes("Paid") ? (
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <X className="size-4 shrink-0 text-amber-500" /> {row.competitor}
                          </span>
                        ) : row.competitor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="size-5" /> Why Flixo Wins
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm">
              {comp.advantages.map((adv, idx) => (
                <li key={idx} className="flex items-start gap-2 text-foreground font-medium">
                  <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </section>

          {matchedTool && matchedTool.slug && matchedTool.status === "ready" && (
            <div className="rounded-3xl border border-primary/30 bg-primary/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-foreground text-base sm:text-lg">
                  Ready to test Flixo {resolveToolName(matchedTool.slug || matchedTool.id, t)}?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">No sign-up required. Runs instantly inside your browser canvas.</p>
              </div>
              <Link
                to={`/tools/${matchedTool.slug}` as never}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all shrink-0"
              >
                Launch {resolveToolName(matchedTool.slug || matchedTool.id, t)} <ArrowRight className="size-4" />
              </Link>
            </div>
          )}

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="size-5 text-primary" />
              <h2 className="text-lg font-bold tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {comp.faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="rounded-2xl border border-border/80 bg-surface/30 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-foreground focus:outline-none"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
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
