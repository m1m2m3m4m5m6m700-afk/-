import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { getReadyToolRuntime } from "@/lib/tool-runtime/readyTools";
import { tools } from "@/data/tools";
import { getVerifiedDesktopTool } from "@/lib/desktop-tools/verifiedCatalog";
import { buildToolHeadMetadata } from "@/lib/seo/toolPageMetadata";
import { usePageSeo } from "@/lib/usePageSeo";
import { LocalI18nProvider, isSupportedLocale, useI18n, type LocaleCode } from "@/lib/i18n";
import { resolveCategoryName, resolveToolName } from "@/lib/i18n/keys";
import { trackPageView } from "@/lib/analytics";

export const Route = createFileRoute("/$locale/tools/$slug")({
  beforeLoad: ({ params }) => {
    if (!isSupportedLocale(params.locale) || params.locale === "en") throw notFound();
    const runtime = getReadyToolRuntime(params.slug);
    const toolRecord = tools.find((entry) => entry.slug === params.slug || entry.id === params.slug) ?? getVerifiedDesktopTool(params.slug);
    if (!runtime || !toolRecord || toolRecord.status !== "ready") throw notFound();
  },
  head: ({ params }) => {
    const validLocale: LocaleCode = isSupportedLocale(params.locale) ? params.locale : "ar";
    const runtime = getReadyToolRuntime(params.slug);
    return buildToolHeadMetadata(params.slug, runtime?.seoOverride, validLocale);
  },
  component: LocalizedToolPageRoute,
});

function LocalizedToolPageContent({ slug, locale }: { slug: string; locale: LocaleCode }) {
  const { t } = useI18n();

  useEffect(() => {
    trackPageView(`/${locale}/tools/${slug}`);
  }, [locale, slug]);

  const runtime = getReadyToolRuntime(slug);
  usePageSeo(slug, runtime?.seoOverride, locale);
  const toolRecord = tools.find((entry) => entry.slug === slug || entry.id === slug) ?? getVerifiedDesktopTool(slug);

  if (!runtime || !toolRecord || toolRecord.status !== "ready") throw notFound();

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

function LocalizedToolPageRoute() {
  const { locale, slug } = Route.useParams() as { locale?: string; slug: string };
  const validLocale: LocaleCode = isSupportedLocale(locale) ? locale : "ar";
  return <LocalI18nProvider locale={validLocale}><LocalizedToolPageContent slug={slug} locale={validLocale} /></LocalI18nProvider>;
}
