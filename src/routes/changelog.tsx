import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { History, ChevronRight, CheckCircle2, Sparkles, Tag } from "lucide-react";
import { changelogRegistry } from "@/data/seoEnterpriseData";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { LastUpdatedBadge } from "@/components/seo/LastUpdatedBadge";
import { SITE_URL } from "@/lib/seo/site";

export const Route = createFileRoute("/changelog")({
  component: ChangelogRoute,
});

function ChangelogRoute() {
  usePageSeo(undefined, {
    title: "Platform Changelog & Release History — Flixo Updates",
    description:
      "Track the latest platform updates, tool enhancements, performance speedups, and security upgrades on Flixo.",
    keywords: ["flixo changelog", "flixo platform updates", "release history", "tool upgrades"],
  });

  useEffect(() => {
    trackPageView("/changelog");
  }, []);

  const siteUrl = SITE_URL;
  const pageUrl = `${siteUrl}/changelog`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Changelog", item: pageUrl },
    ],
  };

  return (
    <SiteLayout>
      <JsonLd data={breadcrumbSchema} />

      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto max-w-4xl px-5 pb-20 pt-10 md:pt-14 space-y-10">
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
                Changelog
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="space-y-4">
            <LastUpdatedBadge />
            <div className="flex items-center gap-2">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <History className="size-5" />
              </span>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Flixo Platform Release History
              </h1>
            </div>
            <p className="max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
              Transparent, data-driven log of all features, AI model performance improvements,
              client-side optimizations, and SEO architecture upgrades.
            </p>
          </header>

          {/* Timeline Releases */}
          <div className="relative border-l-2 border-primary/20 ml-3 pl-6 space-y-10">
            {changelogRegistry.map((item, idx) => (
              <div key={idx} className="relative space-y-4">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground shadow-xs">
                  <Sparkles className="size-3" />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    {item.version}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    <time dateTime={item.date}>{item.date}</time>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <Tag className="size-3" /> {item.type} Release
                  </span>
                </div>

                <h2 className="text-xl font-bold text-foreground">{item.title}</h2>

                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.highlights.map((h, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
