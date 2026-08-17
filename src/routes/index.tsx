import { createFileRoute } from "@tanstack/react-router";
import { FAQ } from "@/components/landing/FAQ";
import { RequestToolDialog } from "@/components/landing/RequestToolDialog";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { SponsorSection } from "@/components/landing/SponsorSection";
import { WhyFlixo } from "@/components/landing/WhyFlixo";
import { DesktopToolsStatus } from "@/components/desktop/DesktopToolsStatus";
import { buildHomeHeadMetadata } from "@/lib/seo/homePageMetadata";

export const Route = createFileRoute("/")({
  head: () => buildHomeHeadMetadata("en"),
  component: Index,
});

function Index() {
  return (
    <SiteLayout showFloatingChat={false}>
      <div className="bg-hero-glow">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
          <DesktopToolsStatus />
        </div>
      </div>

      <WhyFlixo />
      <FAQ />

      <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-6 lg:px-8">
        <SponsorSection variant="compact" />
      </div>

      <RequestToolDialog open={false} onOpenChange={() => undefined} initialDescription="" />
    </SiteLayout>
  );
}
