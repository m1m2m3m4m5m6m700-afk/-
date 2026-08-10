import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, EyeOff, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { usePageSeo } from "@/lib/usePageSeo";

export const Route = createFileRoute("/privacy")({
  component: PrivacyRoute,
});

function PrivacyRoute() {
  usePageSeo(undefined, {
    title: "Privacy Policy — Flixo Browser-Based Tools",
    description:
      "Flixo is committed to privacy-first workflows. Learn how browser-based tools handle your files, text, and data.",
    keywords: ["flixo privacy policy", "browser privacy tools", "no upload tools"],
  });

  return (
    <SiteLayout>
      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-16 md:px-8 lg:px-10">
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <ShieldCheck className="size-3.5" /> Privacy Policy
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Privacy-first tools, without unnecessary data collection.
            </h1>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card/70 p-5">
              <Lock className="size-5 text-primary" />
              <h2 className="mt-3 font-semibold text-foreground">What stays local</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Many Flixo tools process content directly in the browser for faster, more private
                workflows.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-5">
              <EyeOff className="size-5 text-primary" />
              <h2 className="mt-3 font-semibold text-foreground">What we avoid</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Flixo does not rely on unnecessary tracking or invasive account requirements for
                basic usage.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-5">
              <ArrowRight className="size-5 text-primary" />
              <h2 className="mt-3 font-semibold text-foreground">Contact us</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Questions about privacy or tool behavior can be sent through our contact page.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-card/70 p-6 text-sm text-muted-foreground">
            <p>
              Flixo is dedicated to building tools that respect user privacy and minimize
              unnecessary data handling. When possible, tools operate locally in your browser and
              avoid sending sensitive files to external servers.
            </p>
            <p className="mt-4">
              If you have questions about how a specific tool behaves, please visit our contact page
              and we will be happy to help.
            </p>
            <div className="mt-5">
              <Link
                to="/contact"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Contact Flixo
              </Link>
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
