import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ContactOwnerPage } from "@/components/communication/ContactOwnerPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Owner — Owner Communication Center | Flixo" },
      {
        name: "description",
        content:
          "Communicate directly with the Flixo owner and team. Submit tool requests, report bugs, ask questions, or inquire about sponsorships.",
      },
      { property: "og:title", content: "Contact Owner — Flixo Communication Center" },
      {
        property: "og:description",
        content:
          "Direct line to Flixo founder. No automated bot gates, 100% private and fast response.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ContactRoute,
});

function ContactRoute() {
  return (
    <SiteLayout>
      <ContactOwnerPage />
    </SiteLayout>
  );
}
