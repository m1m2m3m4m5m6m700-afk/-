import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useCaseRegistry } from "@/data/seoEnterpriseData";
import { tools } from "@/data/tools";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { LastUpdatedBadge } from "@/components/seo/LastUpdatedBadge";
import { SITE_URL } from "@/lib/seo/site";
import { useI18n } from "@/lib/i18n";
import { resolveToolName } from "@/lib/i18n/keys";

export const Route = createFileRoute("/use-cases/$slug")({
  component: UseCaseSlugRoute,
});

function UseCaseSlugRoute() {
  const { t } = useI18n();
  const { slug } = Route.useParams();
  const uc = useCaseRegistry.find((u) => u.slug === slug || u.id === slug);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  usePageSeo(undefined, {
    title: uc ? `${uc.title} | Flixo Use-Cases` : "Use Case Not Found | Flixo",
    description: uc?.metaDescription || "Flixo use case solution workflow.",
    keywords: ["flixo use cases", uc?.targetAudience || ""],
  });

  useEffect(() => {
    trackPageView(`/use-cases/${slug}`);
  }, [slug]);

  if (!uc) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h1 className="text-2xl font-bold">Use Case Page Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The requested use case workflow does not exist.
          </p>
          <Link to="/use-cases" className="mt-4 inline-block font-semibold text-primary underline">
            Back to Use Cases Index
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const recommendedTools = tools.filter(
    (t) => uc.recommendedToolIds.includes(t.id) && t.status === "ready",
  );

  const siteUrl = SITE_URL;
  const pageUrl = `${siteUrl}/use-cases/${uc.slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Use Cases", item: `${siteUrl}/use-cases` },
      { "@type": "ListItem", position: 3, name: uc.title, item: pageUrl },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: uc.faqs.map((faq) => ({
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
                <Link to="/use-cases" className="hover:text-foreground transition-colors">
                  Use Cases
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 opacity-60 rtl:rotate-180" />
              </li>
              <li
                className="font-semibold text-foreground truncate max-w-[200px]"
                aria-current="page"
              >
                {uc.title}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="space-y-4">
            <LastUpdatedBadge />
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Briefcase className="size-3.5" /> Ideal for {uc.targetAudience}
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground leading-tight">
              {uc.title}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {uc.solutionSummary}
            </p>
          </header>

          {/* Problem Statement Card */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-2">
            <h2 className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
              The Challenge
            </h2>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed">
              {uc.problemStatement}
            </p>
          </div>

          {/* Step by Step Workflow */}
          <section className="rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-foreground">Recommended Step-by-Step Workflow</h2>
            <div className="space-y-3">
              {uc.workflowSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface/50 border border-border/40 text-xs sm:text-sm"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-foreground leading-relaxed font-medium">{step}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended Tools */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Featured Tools in this Solution</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {recommendedTools.map((tool) => (
                <div
                  key={tool.id}
                  className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {resolveToolName(tool.slug || tool.id, t)}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                  {tool.slug && (
                    <Link
                      to={`/tools/${tool.slug}` as never}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      Open Tool <ArrowRight className="size-3.5" />
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
              {uc.faqs.map((faq, index) => {
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
