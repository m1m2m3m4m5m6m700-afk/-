import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { getReadyToolRuntime } from "@/lib/tool-runtime/readyTools";
import { desktopToolCatalog } from "@/lib/desktop-tools/catalog";
import { tools } from "@/data/tools";
import { trackPageView } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { resolveCategoryName, resolveToolName } from "@/lib/i18n/keys";
import { buildToolHeadMetadata } from "@/lib/seo/toolPageMetadata";
import { usePageSeo } from "@/lib/usePageSeo";

export const Route = createFileRoute("/tools/$slug")({
  head: ({ params }) =>
    buildToolHeadMetadata(params.slug, getReadyToolRuntime(params.slug)?.seoOverride),
  component: ToolSlugRoute,
});

const desktopCategoryNames: Record<string, string> = {
  utilities: "Utilities",
  converters: "Converters",
  developer: "Developer Tools",
  calculators: "Calculators",
};

function ToolSlugRoute() {
  const { t } = useI18n();
  const { slug } = Route.useParams() as { slug: string };
  const runtime = getReadyToolRuntime(slug);
  const desktopTool = desktopToolCatalog.find((tool) => tool.slug === slug);

  usePageSeo(slug, runtime?.seoOverride, "en");

  useEffect(() => {
    trackPageView(`/tools/${slug}`);
  }, [slug]);

  const toolRecord = tools.find((tool) => tool.slug === slug || tool.id === slug);
  const isReadyClassicTool = Boolean(toolRecord && toolRecord.status === "ready");
  const isReadyDesktopTool = Boolean(desktopTool && runtime);

  if (!runtime || (!isReadyClassicTool && !isReadyDesktopTool)) {
    throw notFound();
  }

  const ToolComponent = runtime.component;
  const name = desktopTool?.name ?? resolveToolName(runtime.toolId, t);
  const category = desktopTool
    ? desktopCategoryNames[desktopTool.categoryId] ?? "Utilities"
    : resolveCategoryName(runtime.categoryId, t);
  const description = runtime.layoutDescriptionKey
    ? t(runtime.layoutDescriptionKey as never)
    : runtime.layoutDescription;

  return (
    <SiteLayout>
      <ToolLayout
        icon={runtime.icon}
        name={name}
        description={description}
        category={category}
        slug={runtime.slug}
      >
        <ToolComponent />
      </ToolLayout>
    </SiteLayout>
  );
}