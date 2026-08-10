import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Copy, Check, ChevronRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { usePageSeo } from "@/lib/usePageSeo";

export const Route = createFileRoute("/robots/txt")({
  component: RobotsTxtRoute,
});

function RobotsTxtRoute() {
  const [copied, setCopied] = useState(false);

  usePageSeo(undefined, {
    title: "Robots.txt Directives — Flixo SEO Engine",
    description:
      "Dynamic Robots.txt configuration allowing search engines and AI crawlers to index Flixo.",
    keywords: ["robots.txt", "flixo crawler settings", "googlebot index", "ai crawler rules"],
  });

  const robotsContent = `# Flixo Dynamic Robots.txt
# Optimized for Google, Bing, DuckDuckGo, Yahoo & AI Search Engines

User-agent: *
Allow: /
Allow: /tools/
Allow: /categories/
Allow: /blog/
Allow: /sitemap.xml

# AI Search Engine Crawlers (Perplexity, ChatGPT, Claude, Gemini)
User-agent: PerplexityBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://flixotools.com/sitemap.xml
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(robotsContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SiteLayout>
      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto max-w-4xl px-5 pb-20 pt-10 md:pt-14 space-y-6">
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
                robots.txt
              </li>
            </ol>
          </nav>

          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Robots.txt Directive</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Dynamic crawler instructions for search engines and AI agents.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:border-primary/50 transition-all shadow-xs"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? "Copied to Clipboard" : "Copy Directive"}
            </button>
          </header>

          <section className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
              <ShieldCheck className="size-4" /> Crawl Status: Public & Indexable
            </div>
            <pre className="rounded-xl bg-surface p-4 text-xs font-mono leading-relaxed text-foreground overflow-x-auto">
              {robotsContent}
            </pre>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
