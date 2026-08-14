import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { getReadyToolRuntime } from "@/lib/tool-runtime/readyTools";
import { tools } from "@/data/tools";
import { trackPageView } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { resolveCategoryName, resolveToolName } from "@/lib/i18n/keys";
import { buildToolHeadMetadata } from "@/lib/seo/toolPageMetadata";
import { usePageSeo } from "@/lib/usePageSeo";

export const Route = createFileRoute("/tools/$slug")({
  // The generic catch-all only serves genuinely ready tools (a real runtime
  // exists AND the registry status is "ready"). Unknown, planned and
  // placeholder slugs throw a real 404 — never a pseudo-success "template" page
  // and never a fake generic output.
  head: ({ params }) =>
    buildToolHeadMetadata(params.slug, getReadyToolRuntime(params.slug)?.seoOverride),
  component: ToolSlugRoute,
});

function ToolSlugRoute() {
  const { t } = useI18n();
  const { slug } = Route.useParams() as { slug: string };

  const runtime = getReadyToolRuntime(slug);
  usePageSeo(slug, runtime?.seoOverride, "en");

  useEffect(() => {
    trackPageView(`/tools/${slug}`);
  }, [slug]);

  // Only render a tool implementation when both a real runtime exists AND the
  // registry confirms the tool is public-ready. Anything else is not found.
  const toolRecord = tools.find((tool) => tool.slug === slug || tool.id === slug);
  if (!runtime || !toolRecord || toolRecord.status !== "ready") {
    throw notFound();
  }

  const ToolComponent = runtime.component;
  const description = runtime.layoutDescriptionKey
    ? t(runtime.layoutDescriptionKey as never)
    : runtime.layoutDescription;

  return (
    <SiteLayout>
      <ToolLayout
        icon={runtime.icon}
        name={resolveToolName(runtime.toolId, t)}
        description={description}
        category={resolveCategoryName(runtime.categoryId, t)}
        slug={runtime.slug}
      >
        <ToolComponent />
      </ToolLayout>
    </SiteLayout>
  );
}
