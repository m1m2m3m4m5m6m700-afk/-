import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage } from "@/components/landing/CategoryLandingPage";

export const Route = createFileRoute("/video-tools")({
  component: VideoToolsRoute,
});

function VideoToolsRoute() {
  return <CategoryLandingPage categoryId="video" />;
}
