import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage } from "@/components/landing/CategoryLandingPage";
import { FreeAIHub } from "@/components/tools/FreeAIHub";

export const Route = createFileRoute("/ai-tools")({
  component: AiToolsRoute,
});

function AiToolsRoute() {
  return (
    <div className="space-y-10">
      <FreeAIHub />
      <CategoryLandingPage categoryId="ai" />
    </div>
  );
}
