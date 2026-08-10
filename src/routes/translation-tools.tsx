import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage } from "@/components/landing/CategoryLandingPage";

export const Route = createFileRoute("/translation-tools")({
  component: TranslationToolsRoute,
});

function TranslationToolsRoute() {
  return <CategoryLandingPage categoryId="translation" />;
}
