import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { CategoryGrid } from "@/components/landing/CategoryGrid";
import { FeaturedTools } from "@/components/landing/FeaturedTools";
import { WhyFlixo } from "@/components/landing/WhyFlixo";
import { FAQ } from "@/components/landing/FAQ";
import { SponsorSection } from "@/components/landing/SponsorSection";
import { RequestToolDialog } from "@/components/landing/RequestToolDialog";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { buildHomeHeadMetadata } from "@/lib/seo/homePageMetadata";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => buildHomeHeadMetadata("en"),
  component: Index,
});

function Index() {
  const [requestOpen, setRequestOpen] = useState(false);

  return (
    <SiteLayout onRequestTool={() => setRequestOpen(true)} showFloatingChat={false}>
      <section className="relative overflow-hidden bg-hero-glow">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-30 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-14 text-center sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-1.5 text-xs font-bold text-primary shadow-sm">
            <Sparkles className="size-3.5" />
            AI tools, without the clutter
          </span>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            One workspace for the tools you actually need.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Fast browser-based tools for images, translation, files, text, and everyday utilities. No account required.
          </p>

          <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-border/80 bg-card/85 p-2 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3 rounded-2xl bg-background px-4 py-3 text-start">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="flex-1 text-sm text-muted-foreground sm:text-base">
                Search for a tool, e.g. “compress an image”
              </span>
              <Link
                to="/tools"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90"
              >
                Browse
                <ArrowRight className="size-4 rtl:-scale-x-100" />
              </Link>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
            <span>Free</span><span aria-hidden="true">·</span><span>No registration</span><span aria-hidden="true">·</span><span>Privacy-first processing</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <FeaturedTools />
        <CategoryGrid />
      </div>

      <WhyFlixo />
      <FAQ />

      <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-6 lg:px-8">
        <SponsorSection variant="compact" />
      </div>

      <RequestToolDialog open={requestOpen} onOpenChange={setRequestOpen} />
    </SiteLayout>
  );
}
