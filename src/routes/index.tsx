import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AITaskInterface } from "@/components/assistant/AITaskInterface";
import { CapabilityCards, SupportedFiles } from "@/components/assistant/HomeSignals";
import { PopularToolsSection } from "@/components/landing/PopularToolsSection";
import { NewToolsSection } from "@/components/landing/NewToolsSection";
import { TrendingToolsSection } from "@/components/seo/TrendingToolsSection";
import { WhyFlixo } from "@/components/landing/WhyFlixo";
import { FAQ } from "@/components/landing/FAQ";
import { SponsorSection } from "@/components/landing/SponsorSection";
import { RequestToolDialog } from "@/components/landing/RequestToolDialog";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { SITE_URL, getDefaultOgImageUrl } from "@/lib/seo/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flixo — One Workspace for Every AI Tool" },
      {
        name: "description",
        content:
          "Flixo is an AI task assistant that understands your intent, files, links, and media, and instantly selects the best workflow. No tool hunting needed.",
      },
      { property: "og:title", content: "Flixo — AI Task Assistant" },
      {
        property: "og:description",
        content:
          "Describe what you want to do and Flixo matches the right AI skill or workflow instantly, with file upload, links, and drag-and-drop support.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: getDefaultOgImageUrl() },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);

  const handleRequestTool = (prefillPrompt?: string) => {
    if (prefillPrompt) {
      setQuery(prefillPrompt);
    }
    setRequestOpen(true);
  };

  return (
    <SiteLayout onRequestTool={() => handleRequestTool()}>
      <div className="bg-hero-glow">
        <div className="mx-auto max-w-4xl space-y-16 px-5 py-20 sm:px-6 lg:px-8">
          {/* 1. Hero search + trust bar + quick access */}
          <AITaskInterface onRequestTool={handleRequestTool} />

          {/* 2. Most used tools */}
          <PopularToolsSection />

          {/* 3. Flixo capabilities */}
          <CapabilityCards />

          {/* 4. Supported file types */}
          <SupportedFiles />
        </div>
      </div>

      {/* 5. Why Flixo */}
      <WhyFlixo />

      <div className="mx-auto max-w-4xl space-y-16 px-5 py-20 sm:px-6 lg:px-8">
        {/* 6. Trending today */}
        <TrendingToolsSection />

        {/* 7. New tools */}
        <NewToolsSection />
      </div>

      {/* 8. FAQ */}
      <FAQ />

      {/* 9. Sponsor space */}
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
