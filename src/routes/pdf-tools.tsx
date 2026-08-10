import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage } from "@/components/landing/CategoryLandingPage";

export const Route = createFileRoute("/pdf-tools")({
  component: PdfToolsRoute,
});

function PdfToolsRoute() {
  return <CategoryLandingPage categoryId="pdf" />;
}
