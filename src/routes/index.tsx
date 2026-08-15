import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AITaskInterface } from "@/components/assistant/AITaskInterface";
import { CategoryGrid } from "@/components/landing/CategoryGrid";
import { MegaToolHub } from "@/components/landing/MegaToolHub";
import { WhyFlixo } from "@/components/landing/WhyFlixo";
import { FAQ } from "@/components/landing/FAQ";
import { SponsorSection } from "@/components/landing/SponsorSection";
import { RequestToolDialog } from "@/components/landing/RequestToolDialog";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { buildHomeHeadMetadata } from "@/lib/seo/homePageMetadata";

export const Route = createFileRoute("/")({
  head: () => buildHomeHeadMetadata("en"),
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);

  const handleRequestTool = (prefillPrompt?: string) => {
    if (prefillPrompt) setQuery(prefillPrompt);
    setRequestOpen(true);
  };

  return (
    <SiteLayout onRequestTool={() => handleRequestTool()}>
      <div className="bg-hero-glow">
        <div className="mx-auto max-w-7xl space-y-14 px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
          <AITaskInterface />
          <CategoryGrid />
        </div>
      </div>

      <WhyFlixo />

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <MegaToolHub />
      </div>

      <FAQ />

      <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-6 lg:px-8">
        <SponsorSection variant="compact" />
      </div>

      <RequestToolDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        initialDescription={query}
      />
    </SiteLayout>
  );
}