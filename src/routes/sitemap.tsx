import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Globe, FileCode2, ChevronRight, Sparkles, ExternalLink } from "lucide-react";
import { readyTools } from "@/data/tools";
import { categories } from "@/data/categories";
import { blogPosts } from "@/data/blogData";
import {
  comparisonRegistry,
  useCaseRegistry,
  fileTypeRegistry,
  questionRegistry,
  collectionRegistry,
} from "@/data/seoEnterpriseData";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";

export const Route = createFileRoute("/sitemap")({
  component: SitemapRoute,
});

function SitemapRoute() {
  const [viewMode, setViewMode] = useState<"html" | "xml">("html");

  usePageSeo(undefined, {
    title: "XML & HTML Sitemap — All Pages, Comparisons & Tools | Flixo",
    description:
      "Complete sitemap indexing every tool, category landing page, comparison benchmark, use case, file type, question guide, and blog article on Flixo.",
    keywords: ["flixo sitemap", "xml sitemap", "all ai tools list", "flixo tool directory"],
  });

  useEffect(() => {
    trackPageView("/sitemap");
  }, []);

  const siteUrl = "https://flixotools.com";

  const allPages = [
    { url: "/", title: "Homepage", type: "Core Page" },
    { url: "/about", title: "About Flixo", type: "Brand" },
    { url: "/contact", title: "Contact Owner & Community", type: "Community" },
    { url: "/privacy", title: "Privacy Policy", type: "Brand" },
    { url: "/terms", title: "Terms of Use", type: "Brand" },
    { url: "/ai-tools", title: "AI Tools Landing Page", type: "Category" },
    { url: "/image-tools", title: "Image Tools Landing Page", type: "Category" },
    { url: "/pdf-tools", title: "PDF Tools Landing Page", type: "Category" },
    { url: "/translation-tools", title: "Translation Tools Landing Page", type: "Category" },
    { url: "/blog", title: "Flixo Blog Index", type: "Blog" },
    { url: "/changelog", title: "Flixo Release Changelog", type: "Changelog" },
    { url: "/compare", title: "Tool Comparisons Index", type: "SEO Benchmark" },
    { url: "/use-cases", title: "Use-Case Workflows Index", type: "Solutions" },
    { url: "/file-types", title: "File Format Directory Index", type: "Formats" },
    { url: "/questions", title: "How-To Question Guides Index", type: "Guides" },
    { url: "/collections", title: "Tool Collections Hub Index", type: "Collections" },
    { url: "/sitemap", title: "HTML & XML Sitemap", type: "SEO" },
    { url: "/robots.txt", title: "Robots.txt Directive", type: "SEO" },
    ...categories.map((c) => ({
      url: `/categories/${c.id}`,
      title: `${c.name} Category Landing Page`,
      type: "Category",
    })),
    ...comparisonRegistry.map((comp) => ({
      url: `/compare/${comp.slug}`,
      title: `Comparison: ${comp.title}`,
      type: "Comparison Page",
    })),
    ...useCaseRegistry.map((uc) => ({
      url: `/use-cases/${uc.slug}`,
      title: `Use Case: ${uc.title}`,
      type: "Use Case Page",
    })),
    ...fileTypeRegistry.map((ft) => ({
      url: `/file-types/${ft.slug}`,
      title: `Format: ${ft.title}`,
      type: "File Format Page",
    })),
    ...questionRegistry.map((q) => ({
      url: `/questions/${q.slug}`,
      title: `How-To Guide: ${q.question}`,
      type: "Question Guide",
    })),
    ...collectionRegistry.map((col) => ({
      url: `/collections/${col.slug}`,
      title: `Collection: ${col.title}`,
      type: "Tool Collection",
    })),
    ...readyTools().map((t) => ({
      url: t.slug ? `/tools/${t.slug}` : `/#${t.categoryId}`,
      title: `${t.name} (${t.status.toUpperCase()})`,
      type: `Tool (${t.categoryId})`,
    })),
    ...blogPosts.map((b) => ({
      url: `/blog/${b.slug}`,
      title: `Blog: ${b.title}`,
      type: "Blog Article",
    })),
  ];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${siteUrl}${p.url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.url === "/" ? "1.0" : p.url.startsWith("/tools/") ? "0.9" : "0.7"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return (
    <SiteLayout>
      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 md:pt-14 space-y-8">
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
                Sitemap
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Flixo Site Index & Sitemap
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total Indexed Endpoints:{" "}
                <span className="font-bold text-primary">{allPages.length} pages</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("html")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "html"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="size-3.5" /> HTML View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("xml")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "xml"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileCode2 className="size-3.5" /> XML Markup
              </button>
            </div>
          </div>

          {viewMode === "html" ? (
            <div className="space-y-8">
              {/* Categories */}
              <section className="rounded-2xl border border-border/80 bg-card/60 p-6 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Sparkles className="size-4 text-primary" /> Category Landing Pages
                </h2>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to="/categories/$slug"
                      params={{ slug: c.id }}
                      className="rounded-xl border border-border/60 bg-surface/50 p-3 text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-all flex items-center justify-between"
                    >
                      <span>{c.name}</span>
                      <ChevronRight className="size-3.5 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </section>

              {/* Tools Index */}
              <section className="rounded-2xl border border-border/80 bg-card/60 p-6 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Globe className="size-4 text-primary" /> All AI & Utility Tools (
                  {readyTools().length})
                </h2>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 max-h-[400px] overflow-y-auto pr-2">
                  {readyTools().map((t) => (
                    <Link
                      key={t.id}
                      to={(t.slug ? `/tools/${t.slug}` : `/#${t.categoryId}`) as never}
                      className="rounded-xl border border-border/60 bg-surface/50 p-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-between"
                    >
                      <span className="truncate">{t.name}</span>
                      <span className="text-[10px] font-mono text-primary font-bold">
                        {t.status}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Blog Posts */}
              <section className="rounded-2xl border border-border/80 bg-card/60 p-6 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <BookOpenIcon className="size-4 text-primary" /> Blog Guides ({blogPosts.length})
                </h2>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {blogPosts.map((b) => (
                    <Link
                      key={b.id}
                      to="/blog/$slug"
                      params={{ slug: b.slug }}
                      className="rounded-xl border border-border/60 bg-surface/50 p-3 text-xs font-semibold text-foreground hover:text-primary hover:border-primary/50 transition-all flex items-center justify-between"
                    >
                      <span className="truncate">{b.title}</span>
                      <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Standard sitemap.xml format for Googlebot & Bingbot</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(xmlContent)}
                  className="text-primary hover:underline font-bold"
                >
                  Copy XML Code
                </button>
              </div>
              <pre className="rounded-2xl border border-border bg-card p-4 text-xs font-mono text-foreground overflow-x-auto leading-relaxed">
                {xmlContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
