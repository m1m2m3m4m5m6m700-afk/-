import { createFileRoute, notFound } from "@tanstack/react-router";
import { CategoryLandingPage } from "@/components/landing/CategoryLandingPage";
import { getCategory, type CategoryId } from "@/data/categories";
import { DEFAULT_ROBOTS, NOINDEX_ROBOTS, SITE_NAME, SITE_URL } from "@/lib/seo/site";

export const Route = createFileRoute("/categories/$slug")({
  head: ({ params }) => {
    const category = getCategory(params.slug as CategoryId);
    if (!category) {
      return {
        meta: [{ name: "robots", content: NOINDEX_ROBOTS }],
      };
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
  beforeLoad: ({ params }) => {
    const category = getCategory(params.slug as CategoryId);
    return category ? undefined : notFound();
  },
  component: CategorySlugRoute,
});

function CategorySlugRoute() {
  const { slug } = Route.useParams();
  return <CategoryLandingPage categoryId={slug as CategoryId} />;
}
