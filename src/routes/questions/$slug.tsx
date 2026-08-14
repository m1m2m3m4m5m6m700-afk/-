import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, HelpCircle, Check, ArrowRight, ChevronDown, BookOpen } from "lucide-react";
import { questionRegistry } from "@/data/seoEnterpriseData";
import { tools } from "@/data/tools";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { LastUpdatedBadge } from "@/components/seo/LastUpdatedBadge";
import { SITE_URL } from "@/lib/seo/site";
import { useI18n } from "@/lib/i18n";
import { resolveToolName } from "@/lib/i18n/keys";

export const Route = createFileRoute("/questions/$slug")({
  component: QuestionSlugRoute,
});

function QuestionSlugRoute() {
  const { t } = useI18n();
  const { slug } = Route.useParams();
  const q = questionRegistry.find((item) => item.slug === slug || item.id === slug);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  usePageSeo(undefined, {
    title: q ? `${q.title} | Flixo Guides` : "Question Guide Not Found | Flixo",
    description: q?.metaDescription || "Flixo how-to question guide.",
    keywords: ["flixo question guide", q?.question || ""],
  });

  useEffect(() => {
    trackPageView(`/questions/${slug}`);
  }, [slug]);

  if (!q) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h1 className="text-2xl font-bold">Guide Not Found</h1>
          <p className="mt-2 text-muted-foreground">The requested question guide does not exist.</p>
          <Link to="/questions" className="mt-4 inline-block font-semibold text-primary underline">
            Back to Questions Index
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const recommendedTool = tools.find((t) => t.id === q.recommendedToolId);
  const siteUrl = SITE_URL;
  const pageUrl = `${siteUrl}/questions/${q.slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Questions & Guides",
        item: `${siteUrl}/questions`,
      },
      { "@type": "ListItem", position: 3, name: q.question, item: pageUrl },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: q.question,
    description: q.shortAnswer,
    step: q.stepByStep.map((stepText, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: `Step ${idx + 1}`,
      text: stepText,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: q.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <SiteLayout>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={howToSchema} />
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
                <Link to="/questions" className="hover:text-foreground transition-colors">
                  Questions & Guides
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 opacity-60 rtl:rotate-180" />
              </li>
              <li
                className="font-semibold text-foreground truncate max-w-[200px]"
                aria-current="page"
              >
                {q.question}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="space-y-4">
            <LastUpdatedBadge />
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              <BookOpen className="size-4" /> Flixo Verified Answer & Tutorial
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground leading-tight">
              {q.question}
            </h1>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs sm:text-sm text-foreground font-medium leading-relaxed">
              <strong className="text-primary block font-bold mb-1">Quick Answer:</strong>
              {q.shortAnswer}
            </div>
          </header>

          {/* Detailed Explanation */}
          <section className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <h2 className="text-lg font-bold text-foreground">Overview & Technical Background</h2>
            <p>{q.detailedGuide}</p>
          </section>

          {/* Step-by-Step Instructions */}
          <section className="rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-foreground">Step-by-Step Guide</h2>
            <ol className="space-y-3">
              {q.stepByStep.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface/40 border border-border/40 text-xs sm:text-sm"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-foreground leading-relaxed font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Recommended Tool Launcher */}
          {recommendedTool && (
            <div className="rounded-3xl border border-primary/30 bg-primary/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-foreground text-base sm:text-lg">
                  Use{" "}
                  {recommendedTool
                    ? resolveToolName(recommendedTool.slug || recommendedTool.id, t)
                    : ""}{" "}
                  Now
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Follow this guide directly inside our 100% free browser tool.
                </p>
              </div>
              {recommendedTool.slug && recommendedTool.status === "ready" && (
                <Link
                  to={`/tools/${recommendedTool.slug}` as never}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all shrink-0"
                >
                  Launch{" "}
                  {recommendedTool
                    ? resolveToolName(recommendedTool.slug || recommendedTool.id, t)
                    : ""}{" "}
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          )}

          {/* FAQs */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="size-5 text-primary" />
              <h2 className="text-lg font-bold tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {q.faqs.map((faq, index) => {
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
