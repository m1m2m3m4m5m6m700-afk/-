import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage } from "@/components/landing/CategoryLandingPage";

export const Route = createFileRoute("/image-tools")({
  component: ImageToolsRoute,
});

function ImageToolsRoute() {
  return <CategoryLandingPage categoryId="images" />;
}
