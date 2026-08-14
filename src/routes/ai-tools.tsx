import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage } from "@/components/landing/CategoryLandingPage";
import { SITE_URL } from "@/lib/seo/site";

export const Route = createFileRoute("/ai-tools")({
  head: () => ({
    meta: [
      { title: "AI Tools — Free Online AI Tools | Flixo" },
      {
        name: "description",
        content:
          "Explore Flixo's free browser-based AI tools for writing, research, summarization, translation, and everyday productivity.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/categories/ai` }],
  }),
  component: AiToolsRoute,
});

function AiToolsRoute() {
  return <CategoryLandingPage categoryId="ai" />;
}
