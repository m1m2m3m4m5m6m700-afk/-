import { createFileRoute, Link } from "@tanstack/react-router";
import { Cookie, ShieldCheck, Check, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { usePageSeo } from "@/lib/usePageSeo";

export const Route = createFileRoute("/cookie-policy")({
  component: CookiePolicyRoute,
});

function CookiePolicyRoute() {
  usePageSeo(undefined, {
    title: "Cookie Policy & Privacy Preferences — Flixo Tools",
    description:
      "Learn how Flixo respects user privacy through minimal cookies, local browser storage, and privacy-preserving preferences.",
    keywords: ["cookie policy", "privacy preferences", "flixo cookies"],
  });

  return (
    <SiteLayout>
      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto flex max-w-4xl flex-col gap-10 px-5 py-16 md:px-8">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Cookie className="size-3.5" /> Privacy First
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Flixo Cookie Policy & Local Storage
            </h1>
            <p className="text-lg text-muted-foreground">
              We prioritize user privacy by using localStorage for dark mode and user preferences
              instead of intrusive tracking cookies.
            </p>
          </header>

          <section className="space-y-6 rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                1. Strictly Necessary Storage
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Flixo utilizes browser localStorage exclusively to persist your selected interface
                theme (Light / Dark mode), active language preference (RTL / LTR layout), and recent
                tool settings. No personal identifiers are transmitted to external ad brokers.
              </p>
            </div>

            <hr className="border-border/50" />

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                2. Third-Party Analytics & Advertising
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We may use privacy-conscious analytics services (such as Google Analytics with IP
                anonymization) and Google AdSense to sustain our free tools platform. These partners
                may set cookies to measure aggregate traffic and serve non-intrusive advertisements
                in compliance with GDPR and CCPA.
              </p>
            </div>

            <hr className="border-border/50" />

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                3. Managing Your Preferences
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You can clear your browser cookies or local storage at any time through your web
                browser's privacy settings. Doing so will simply reset Flixo to its default
                light/dark theme without losing access to any tool functionality.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Questions about our privacy policy?
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Read our complete Privacy Policy for detailed information on data security.
              </p>
            </div>
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
            >
              Privacy Policy <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
