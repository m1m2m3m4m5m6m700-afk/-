import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { FileCode, ArrowRight, ChevronRight, CheckCircle2 } from "lucide-react";
import { fileTypeRegistry } from "@/data/seoEnterpriseData";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { LastUpdatedBadge } from "@/components/seo/LastUpdatedBadge";
import { SITE_URL } from "@/lib/seo/site";

export const Route = createFileRoute("/file-types/")({
  component: FileTypesIndexRoute,
});

function FileTypesIndexRoute() {
  usePageSeo(undefined, {
    title: "File-Type Tools Directory — PNG, JPG, WebP & PDF Utilities",
    description:
      "Explore Flixo browser tools by file format. Online tools for PNG, JPG, WebP, SVG, PDF, and TXT files with 100% in-browser processing.",
    keywords: ["png tools", "jpg tools", "webp utilities", "pdf browser tools"],
  });

  useEffect(() => {
    trackPageView("/file-types");
  }, []);

  const siteUrl = SITE_URL;
  const pageUrl = `${siteUrl}/file-types`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "File Types", item: pageUrl },
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
                File Types
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="space-y-4">
            <LastUpdatedBadge />
            <div className="flex items-center gap-2">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <FileCode className="size-5" />
              </span>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Browse Tools by File Format
              </h1>
            </div>
            <p className="max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
              Find dedicated client-side tools designed for your specific image, text, document, and
              vector file extensions.
            </p>
          </header>

          {/* File Types Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fileTypeRegistry.map((ft) => (
              <div
                key={ft.id}
                className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all"
              >
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    {ft.extension}
                  </span>
                  <h2 className="text-lg font-bold text-foreground leading-snug">
                    <Link
                      to="/file-types/$slug"
                      params={{ slug: ft.slug }}
                      className="hover:text-primary transition-colors"
                    >
                      {ft.title}
                    </Link>
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {ft.overview}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> Client-Side Engine
                  </span>
                  <Link
                    to="/file-types/$slug"
                    params={{ slug: ft.slug }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    View Format Tools <ArrowRight className="size-3.5" />
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
