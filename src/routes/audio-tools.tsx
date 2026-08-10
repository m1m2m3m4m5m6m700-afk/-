import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage } from "@/components/landing/CategoryLandingPage";

export const Route = createFileRoute("/audio-tools")({
  component: AudioToolsRoute,
});

function AudioToolsRoute() {
  return <CategoryLandingPage categoryId="audio" />;
}
