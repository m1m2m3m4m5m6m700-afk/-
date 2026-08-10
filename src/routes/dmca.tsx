import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCode2, Mail, Shield, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { usePageSeo } from "@/lib/usePageSeo";

export const Route = createFileRoute("/dmca")({
  component: DmcaRoute,
});

function DmcaRoute() {
  usePageSeo(undefined, {
    title: "DMCA Copyright & Takedown Policy — Flixo Tools",
    description:
      "DMCA copyright policy, intellectual property protection guidelines, and takedown notice submission process for Flixo Tools.",
    keywords: ["dmca policy", "copyright takedown", "intellectual property", "flixo dmca"],
  });

  return (
    <SiteLayout>
      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto flex max-w-4xl flex-col gap-10 px-5 py-16 md:px-8">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Shield className="size-3.5" /> Intellectual Property
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              DMCA & Copyright Takedown Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Flixo respects the intellectual property rights of creators and complies fully with
              the Digital Millennium Copyright Act (DMCA).
            </p>
          </header>

          <section className="space-y-6 rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                1. Client-Side Utility Guarantee
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Flixo is an online utility platform containing software tools, format converters,
                and text generators. Flixo does not host, store, or distribute copyrighted media
                files, pirated software, or unauthorized digital streams. User files processed via
                our tools remain strictly on the user's client machine or temporary session runtime.
              </p>
            </div>

            <hr className="border-border/50" />

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                2. Submitting a DMCA Takedown Notice
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If you believe that any material or content accessible on or through Flixo infringes
                your copyright, please send a formal DMCA notice containing:
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm space-y-1.5 text-muted-foreground">
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>Exact URL or location of the allegedly infringing material on Flixo.</li>
                <li>
                  Your contact information (full legal name, email address, physical address, and
                  telephone number).
                </li>
                <li>
                  A statement that you have a good faith belief that the disputed use is not
                  authorized by the copyright owner.
                </li>
                <li>
                  A statement under penalty of perjury that the information in your notification is
                  accurate.
                </li>
              </ul>
            </div>

            <hr className="border-border/50" />

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">3. DMCA Agent Contact</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Please submit DMCA notices directly to our designated copyright team via our
                official contact channel at:
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-surface/80 px-4 py-2 text-sm font-mono text-primary border border-border/60">
                <Mail className="size-4" /> dmca@flixotools.com
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Need general support?</h2>
              <p className="text-xs text-muted-foreground mt-1">
                For general feature inquiries, visit our contact page.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Contact Support <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
