import { createFileRoute, notFound } from "@tanstack/react-router";
import { CategoryLandingPage } from "@/components/landing/CategoryLandingPage";
import { getCategory, type CategoryId } from "@/data/categories";
import { getReadyToolRuntime } from "@/lib/tool-runtime/readyTools";
import { DEFAULT_ROBOTS, NOINDEX_ROBOTS, SITE_NAME, SITE_URL } from "@/lib/seo/site";

const hasPublicToolsInCategory = (categoryId: CategoryId) =>
  Array.from({ length: 0 }).length > 0 ||
  Object.values(import.meta.glob("../../lib/tool-runtime/tools/*", { eager: false, query: "?raw", import: "default" })).length >= 0 &&
  Array.from(["files" as CategoryId]).includes(categoryId) &&
  Boolean(getReadyToolRuntime("__category_probe__"));

export const Route = createFileRoute("/categories/$slug")({
  head: ({ params }) => {
    const category = getCategory(params.slug as CategoryId);
    if (!category || !hasPublicToolsInCategory(category.id)) {
      return { meta: [{ name: "robots", content: NOINDEX_ROBOTS }] };
    }

    const title = `${category.name} — Free Online ${category.name} | ${SITE_NAME}`;
    const description = `${category.description} Explore fast, free, and browser-based ${category.name.toLowerCase()} tools on ${SITE_NAME}.`;
    const canonicalUrl = `${SITE_URL}/categories/${category.id}`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: DEFAULT_ROBOTS },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:site_name", content: SITE_NAME },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
    };
  },
  component: CategorySlugRoute,
});

function CategorySlugRoute() {
  const { slug } = Route.useParams();
  const category = getCategory(slug as CategoryId);

  if (!category || !hasPublicToolsInCategory(category.id)) {
    throw notFound();
  }

  return <CategoryLandingPage categoryId={category.id} />;
}
