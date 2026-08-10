import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage } from "@/components/landing/CategoryLandingPage";
import type { CategoryId } from "@/data/categories";

export const Route = createFileRoute("/categories/$slug")({
  component: CategorySlugRoute,
});

function CategorySlugRoute() {
  const { slug } = Route.useParams();
  return <CategoryLandingPage categoryId={slug as CategoryId} />;
}
