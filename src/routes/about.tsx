import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { usePageSeo } from "@/lib/usePageSeo";
import { categories } from "@/data/categories";
import { useI18n } from "@/lib/i18n";
import { resolveCategoryName } from "@/lib/i18n/keys";

export const Route = createFileRoute("/about")({
  component: AboutRoute,
});

function AboutRoute() {
  const { t } = useI18n();
  usePageSeo(undefined, {
    title: "About Flixo — Privacy-First AI Tools & Browser Utilities",
    description:
      "Learn how Flixo brings fast, private browser-based AI tools and utilities together in one simple workspace for creators, students, and professionals.",
    keywords: ["about flixo", "flixo privacy tools", "browser ai tools"],
  });

  return (
    <SiteLayout>
      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-16 md:px-8 lg:px-10">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="size-3.5" /> About Flixo
            </div>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
              Flixo helps people use useful tools without friction, uploads, or clutter.
            </h1>
            <p className="max-w-3xl text-lg text-muted-foreground">
              We focus on browser-first utilities that are fast, private, and practical — from image
              cleanup and translation to document workflows and everyday helpers.
            </p>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card/70 p-5">
              <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <h2 className="font-semibold text-foreground">Privacy-first by design</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Many Flixo tools run directly in your browser, helping keep files and text local.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-5">
              <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                <Zap className="size-5" />
              </div>
              <h2 className="font-semibold text-foreground">Built for speed</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The experience is intentionally simple so users can focus on getting the job done.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-5">
              <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                <Sparkles className="size-5" />
              </div>
              <h2 className="font-semibold text-foreground">One workspace, many workflows</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Flixo brings categories like image tools, PDF tools, translation tools, and more
                under one roof.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-card/70 p-6">
            <h2 className="text-xl font-semibold text-foreground">
              Explore the main Flixo categories
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to="/categories/$slug"
                  params={{ slug: category.id }}
                  className="rounded-xl border border-border/70 bg-surface/70 p-3 text-sm font-medium text-foreground transition hover:border-primary/50 hover:text-primary"
                >
                  {resolveCategoryName(category.id, t)}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-card/70 p-6">
            <h2 className="text-xl font-semibold text-foreground">Ready to get started?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Visit the tool directory, browse the most popular workflows, or contact the Flixo team
              with a request.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Open Flixo <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
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
