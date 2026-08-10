import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { usePageSeo } from "@/lib/usePageSeo";

export const Route = createFileRoute("/terms")({
  component: TermsRoute,
});

function TermsRoute() {
  usePageSeo(undefined, {
    title: "Terms of Use — Flixo Tools and Services",
    description:
      "Read the simple terms of use for Flixo's browser-based tools, content, and site features.",
    keywords: ["flixo terms", "tool terms of use", "browser tools policy"],
  });

  return (
    <SiteLayout>
      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-16 md:px-8 lg:px-10">
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <FileText className="size-3.5" /> Terms of Use
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Using Flixo responsibly and with clarity.
            </h1>
          </header>

          <section className="rounded-3xl border border-border/70 bg-card/70 p-6 text-sm text-muted-foreground">
            <p>
              Flixo provides browser-based tools and informational content for personal,
              educational, and professional use. Users are expected to use the services in a lawful
              and respectful manner.
            </p>
            <p className="mt-4">
              You may use the site to explore tools, review content, and interact with available
              workflows. Reproducing or redistributing proprietary content without permission is not
              permitted.
            </p>
            <p className="mt-4">
              If you have questions about site usage or feature availability, please contact the
              Flixo team.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Contact Flixo <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
