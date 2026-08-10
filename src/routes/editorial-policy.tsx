import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, CheckCircle2, Award, FileText, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { usePageSeo } from "@/lib/usePageSeo";

export const Route = createFileRoute("/editorial-policy")({
  component: EditorialPolicyRoute,
});

function EditorialPolicyRoute() {
  usePageSeo(undefined, {
    title: "Editorial Policy & E-E-A-T Standards — Flixo Tools",
    description:
      "Learn about Flixo's editorial principles, tool accuracy standards, data security protocols, and commitment to Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T).",
    keywords: ["editorial policy", "e-e-a-t standards", "flixo trust", "fact checking"],
  });

  return (
    <SiteLayout>
      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto flex max-w-4xl flex-col gap-10 px-5 py-16 md:px-8">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Award className="size-3.5" /> Quality & Trust
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Flixo Editorial Policy & E-E-A-T Standards
            </h1>
            <p className="text-lg text-muted-foreground">
              Our commitment to accuracy, privacy, user-first tool design, and continuous
              engineering validation.
            </p>
          </header>

          <section className="space-y-6 rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">1. Core Philosophy</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  At Flixo, every web tool and browser utility is engineered to execute client-side
                  or through secure, high-performance runtime environments. We adhere strictly to
                  Google's Search Essentials and Helpful Content guidelines, ensuring our web
                  utilities provide genuine functional utility rather than generic content wrappers.
                </p>
              </div>
            </div>

            <hr className="border-border/50" />

            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  2. Verification & Testing Standards
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  All 1,000+ browser tools undergo automated runtime verification prior to release.
                  Our continuous integration workflow checks:
                </p>
                <ul className="mt-3 list-disc pl-5 text-sm space-y-1.5 text-muted-foreground">
                  <li>Client-side code safety and WASM/JS execution reliability.</li>
                  <li>Zero unhandled runtime exceptions or broken user interfaces.</li>
                  <li>
                    Strict privacy guarantees: files, images, and documents remain inside the user's
                    browser memory whenever technically feasible.
                  </li>
                  <li>W3C WCAG 2.1 AA accessibility compliance across all interactive controls.</li>
                </ul>
              </div>
            </div>

            <hr className="border-border/50" />

            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <FileText className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  3. Editorial Oversight & Peer Review
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Tool explanations, mathematical formulas, file format specifications, and
                  technical guides on Flixo are authored and reviewed by experienced software
                  engineers, security specialists, and digital workflow experts.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">Questions or Feedback?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If you discover an inaccuracy in a tool's output or calculated result, our engineering
              team prioritizes rapid fix cycles.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Contact Technical Support <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
