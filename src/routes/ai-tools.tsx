import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage } from "@/components/landing/CategoryLandingPage";

export const Route = createFileRoute("/ai-tools")({
  component: AiToolsRoute,
});

function AiToolsRoute() {
  return <CategoryLandingPage categoryId="ai" />;
}
