import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { getReadyToolRuntime } from "@/lib/tool-runtime/readyTools";
import { getPublicToolRegistrationBySlug } from "@/lib/tool-platform";
import { buildToolHeadMetadata } from "@/lib/seo/toolPageMetadata";
import { usePageSeo } from "@/lib/usePageSeo";
import { LocalI18nProvider, isSupportedLocale, useI18n, type LocaleCode } from "@/lib/i18n";
import { resolveCategoryName, resolveToolName } from "@/lib/i18n/keys";
import { trackPageView } from "@/lib/analytics";

export const Route = createFileRoute("/$locale/tools/$slug")({
  beforeLoad: ({ params }) => {
    if (!isSupportedLocale(params.locale) || params.locale === "en") throw notFound();
  },
  head: ({ params }) => {
    const validLocale: LocaleCode = isSupportedLocale(params.locale) ? params.locale : "ar";
    const registration = getPublicToolRegistrationBySlug(params.slug);
    return buildToolHeadMetadata(
      params.slug,
      registration ? getReadyToolRuntime(params.slug)?.seoOverride : undefined,
      validLocale,
    );
  },
  component: LocalizedToolPageRoute,
});

function LocalizedToolPageContent({ slug, locale }: { slug: string; locale: LocaleCode }) {
  const { t } = useI18n();
  const runtime = getReadyToolRuntime(slug);
  const registration = getPublicToolRegistrationBySlug(slug);

  useEffect(() => {
    trackPageView(`/${locale}/tools/${slug}`);
  }, [locale, slug]);

  usePageSeo(slug, runtime?.seoOverride, locale);

  if (!runtime || !registration) throw notFound();

  const ToolComponent = runtime.component;
  const description = runtime.layoutDescriptionKey
    ? t(runtime.layoutDescriptionKey as never)
    : runtime.layoutDescription;

  return (
    <SiteLayout>
      <ToolLayout
        icon={runtime.icon}
        name={resolveToolName(registration.manifest.id, t)}
        description={description}
        category={resolveCategoryName(registration.manifest.category, t)}
        slug={registration.manifest.slug}
      >
        <ToolComponent />
      </ToolLayout>
    </SiteLayout>
  );
}

function LocalizedToolPageRoute() {
  const { locale, slug } = Route.useParams();
  const validLocale: LocaleCode = isSupportedLocale(locale) ? locale : "ar";
  return (
    <LocalI18nProvider locale={validLocale}>
      <LocalizedToolPageContent slug={slug} locale={validLocale} />
    </LocalI18nProvider>
  );
}
