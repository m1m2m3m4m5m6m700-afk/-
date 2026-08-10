import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  FileCode,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { fileTypeRegistry } from "@/data/seoEnterpriseData";
import { tools } from "@/data/tools";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { LastUpdatedBadge } from "@/components/seo/LastUpdatedBadge";

export const Route = createFileRoute("/file-types/$slug")({
  component: FileTypeSlugRoute,
});

function FileTypeSlugRoute() {
  const { slug } = Route.useParams();
  const ft = fileTypeRegistry.find((f) => f.slug === slug || f.id === slug);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  usePageSeo(undefined, {
    title: ft ? `${ft.title}` : "File Type Not Found | Flixo",
    description: ft?.metaDescription || "Flixo file format tools.",
    keywords: ["flixo file tools", ft?.extension || ""],
  });

  useEffect(() => {
    trackPageView(`/file-types/${slug}`);
  }, [slug]);

  if (!ft) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h1 className="text-2xl font-bold">File Format Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The requested file type category does not exist.
          </p>
          <Link to="/file-types" className="mt-4 inline-block font-semibold text-primary underline">
            Back to File Types Index
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const compatibleTools = tools.filter(
    (t) => ft.compatibleToolIds.includes(t.id) && t.status === "ready",
  );

  const siteUrl = "https://flixotools.com";
  const pageUrl = `${siteUrl}/file-types/${ft.slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "File Types", item: `${siteUrl}/file-types` },
      { "@type": "ListItem", position: 3, name: ft.title, item: pageUrl },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ft.faqs.map((faq) => ({
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
                <Link to="/file-types" className="hover:text-foreground transition-colors">
                  File Types
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 opacity-60 rtl:rotate-180" />
              </li>
              <li
                className="font-semibold text-foreground truncate max-w-[200px]"
                aria-current="page"
              >
                {ft.extension}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="space-y-4">
            <LastUpdatedBadge />
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-mono font-bold text-primary">
              <FileCode className="size-4" /> Extension {ft.extension}
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground leading-tight">
              {ft.title}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {ft.overview}
            </p>
          </header>

          {/* Supported Operations */}
          <section className="rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-foreground">
              Supported {ft.extension} Processing Operations
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {ft.supportedOperations.map((op, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium p-3 rounded-xl bg-surface/40 border border-border/40"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  <span>{op}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Compatible Tools */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              Compatible Flixo Utilities for {ft.extension}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {compatibleTools.map((tool) => (
                <div
                  key={tool.id}
                  className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{tool.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                  {tool.slug && (
                    <Link
                      to={`/tools/${tool.slug}` as never}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      Open Utility <ArrowRight className="size-3.5" />
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
              {ft.faqs.map((faq, index) => {
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
