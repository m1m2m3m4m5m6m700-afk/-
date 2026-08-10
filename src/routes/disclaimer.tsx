import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { usePageSeo } from "@/lib/usePageSeo";

export const Route = createFileRoute("/disclaimer")({
  component: DisclaimerRoute,
});

function DisclaimerRoute() {
  usePageSeo(undefined, {
    title: "Legal & Tool Usage Disclaimer — Flixo Tools",
    description:
      "Important legal disclaimer regarding tool outputs, calculated results, file processing, and service terms on Flixo Tools.",
    keywords: ["disclaimer", "tool usage disclaimer", "flixo terms", "legal notice"],
  });

  return (
    <SiteLayout>
      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto flex max-w-4xl flex-col gap-10 px-5 py-16 md:px-8">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
              <AlertTriangle className="size-3.5" /> Legal Notice
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Disclaimer of Liability & Usage Terms
            </h1>
            <p className="text-lg text-muted-foreground">
              Please read this disclaimer carefully before using any tool or converter hosted on
              Flixo.
            </p>
          </header>

          <section className="space-y-6 rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                1. Informational Purpose Only
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                All utilities, calculators, converters, and generators provided on Flixo are
                intended for general productivity, educational, and informational purposes. Outputs
                produced by financial calculators, text transformers, or document processors should
                be verified independently before use in legal, medical, or high-stakes financial
                transactions.
              </p>
            </div>

            <hr className="border-border/50" />

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                2. Client-Side Data Handling
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                While Flixo implements browser-native processing (e.g. Canvas API, WebAssembly, Web
                Crypto API) to avoid server uploads where possible, users are responsible for
                maintaining backups of their original files and sensitive documents.
              </p>
            </div>

            <hr className="border-border/50" />

            <div>
              <h2 className="text-xl font-semibold text-foreground">3. No Professional Advice</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                None of the content or calculated results on Flixo constitute formal financial,
                legal, tax, or medical advice.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Need to review our complete terms?
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Read our full Terms of Service for more details regarding service availability and
                user rights.
              </p>
            </div>
            <Link
              to="/terms"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
            >
              Terms of Service <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
