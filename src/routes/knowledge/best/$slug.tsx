import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, HelpCircle, ChevronDown, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { getBestToolsPage } from "@/data/knowledgeHub";
import { tools } from "@/data/tools";

export const Route = createFileRoute("/knowledge/best/$slug")({
  component: BestToolsPageRoute,
});

function BestToolsPageRoute() {
  const { slug } = Route.useParams();
  const page = getBestToolsPage(slug);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  usePageSeo(undefined, {
    title: page ? `${page.title} | Flixo` : "Best Tools Page Not Found | Flixo",
    description:
      page?.metaDescription || "Discover Flixo’s best browser-based tools for focused workflows.",
    keywords: page?.keywords || ["best tools"],
  });

  useEffect(() => {
    trackPageView(`/knowledge/best/${slug}`);
  }, [slug]);

  if (!page) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The requested best-tools page does not exist.
          </p>
          <Link to="/knowledge" className="mt-4 inline-block font-semibold text-primary underline">
            Back to Knowledge Hub
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const siteUrl = "https://flixotools.com";
  const pageUrl = `${siteUrl}/knowledge/best/${page.slug}`;
  const recommendedTools = tools.filter(
    (tool) => page.recommendedToolIds.includes(tool.id) && tool.status === "ready",
  );

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Knowledge Hub", item: `${siteUrl}/knowledge` },
      { "@type": "ListItem", position: 3, name: page.title, item: pageUrl },
    ],
  };

  const faqSchema = page.faqs
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  return (
    <SiteLayout>
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <div className="bg-hero-glow min-h-screen">
        <article className="mx-auto max-w-4xl px-5 pb-20 pt-10 md:pt-14 space-y-8">
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
                <Link to="/knowledge" className="hover:text-foreground transition-colors">
                  Knowledge Hub
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 opacity-60 rtl:rotate-180" />
              </li>
              <li className="font-semibold text-foreground" aria-current="page">
                {page.title}
              </li>
            </ol>
          </nav>

          <header className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{page.title}</h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {page.summary}
            </p>
          </header>

          <section className="rounded-3xl border border-border/80 bg-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Recommended tools</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {recommendedTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={`/tools/${tool.slug}` as never}
                  className="rounded-2xl border border-border/70 bg-surface/60 p-4 transition-all hover:border-primary/50"
                >
                  <div className="font-semibold text-foreground">{tool.name}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {page.faqs && page.faqs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-5 text-primary" />
                <h2 className="text-lg font-bold tracking-tight">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-3">
                {page.faqs.map((faq, index) => {
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
                          className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-border/50 px-4 pb-4 pt-2 text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </article>
      </div>
    </SiteLayout>
  );
}
