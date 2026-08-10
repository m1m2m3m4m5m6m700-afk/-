import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, CheckCircle2, HeartHandshake, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { usePageSeo } from "@/lib/usePageSeo";

export const Route = createFileRoute("/accessibility")({
  component: AccessibilityRoute,
});

function AccessibilityRoute() {
  usePageSeo(undefined, {
    title: "Accessibility Statement (WCAG 2.1 AA) — Flixo Tools",
    description:
      "Flixo is committed to digital accessibility for everyone, complying with WCAG 2.1 Level AA guidelines, high contrast modes, and keyboard navigation.",
    keywords: ["accessibility statement", "wcag aa compliance", "a11y flixo"],
  });

  return (
    <SiteLayout>
      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto flex max-w-4xl flex-col gap-10 px-5 py-16 md:px-8">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Eye className="size-3.5" /> Inclusive Web
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Accessibility Statement & Standards
            </h1>
            <p className="text-lg text-muted-foreground">
              Flixo believes web productivity tools should be fully accessible to users of all
              abilities.
            </p>
          </header>

          <section className="space-y-6 rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                1. Conformance Target: WCAG 2.1 Level AA
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Flixo's user interface is designed in alignment with the Web Content Accessibility
                Guidelines (WCAG) 2.1 Level AA specifications.
              </p>
            </div>

            <hr className="border-border/50" />

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                2. Built-in Accessibility Features
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-surface/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="size-4 text-primary" /> Keyboard Navigation
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    All interactive buttons, input fields, and tab interfaces are navigable via
                    standard keyboard focus (`Tab`, `Shift+Tab`, `Space`, `Enter`).
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-surface/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="size-4 text-primary" /> High Contrast & Themes
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Text color ratios meet or exceed 4.5:1 WCAG AA standards. Toggle easily between
                    dark and light themes.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-surface/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="size-4 text-primary" /> Screen Reader Support
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Interactive controls utilize Semantic HTML, ARIA labels, and live region
                    notifications for screen readers.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-surface/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="size-4 text-primary" /> Responsive Text & Zoom
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Layouts gracefully reflow when browser text size is zoomed up to 200% without
                    horizontal scroll overflow.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-border/50" />

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">3. Feedback & Assistance</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We continuously test our tools with assistive technologies. If you encounter an
                accessibility barrier or need assistance using any Flixo utility, please let our
                accessibility team know.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Have accessibility feedback?
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Reach out to our accessibility team to report issues or suggest improvements.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Submit Feedback <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
