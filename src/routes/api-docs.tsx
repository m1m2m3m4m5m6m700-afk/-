import { createFileRoute, Link } from "@tanstack/react-router";
import { Code2, Terminal, Cpu, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { usePageSeo } from "@/lib/usePageSeo";

export const Route = createFileRoute("/api-docs")({
  component: ApiDocsRoute,
});

function ApiDocsRoute() {
  usePageSeo(undefined, {
    title: "Developer API & Integration Guide — Flixo Tools",
    description:
      "Documentation for integrating Flixo conversion utilities, translation endpoints, and developer tools into your workflows.",
    keywords: ["api docs", "flixo api", "developer integration", "rest api"],
  });

  return (
    <SiteLayout>
      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto flex max-w-4xl flex-col gap-10 px-5 py-16 md:px-8">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Code2 className="size-3.5" /> Developers
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Flixo Developer API & Integration
            </h1>
            <p className="text-lg text-muted-foreground">
              Integrate fast, private tool functions and data transformers directly into your
              applications.
            </p>
          </header>

          <section className="space-y-6 rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                1. Client-First Architecture
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Flixo's design favors client-side execution using browser native WebAssembly, Web
                Crypto, and Canvas APIs. Most processing can be run directly inside your client
                application without external network latency.
              </p>
            </div>

            <hr className="border-border/50" />

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                2. Example REST API Endpoint (Translation Proxy)
              </h2>
              <div className="rounded-2xl border border-border/80 bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
                <div className="text-slate-400">// POST /api/translate</div>
                <div className="mt-1 text-emerald-400">
                  curl -X POST https://flixotools.com/api/translate \<br />
                  &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                  &nbsp;&nbsp;-d '&#123;"text": "Hello world", "source": "en", "target": "es"&#125;'
                </div>
              </div>
            </div>

            <hr className="border-border/50" />

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                3. Open Access & Rate Limits
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Public endpoints are protected with standard IP rate limiting (100 requests per
                minute) to ensure high availability for all users.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Need custom enterprise API access?
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Contact our engineering team to discuss dedicated API rate limits or self-hosted
                tool runtimes.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Contact Developers <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
