import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { getReadyToolRuntime } from "@/lib/tool-runtime/readyTools";
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
    const runtime = getReadyToolRuntime(params.slug);
    return buildToolHeadMetadata(params.slug, runtime?.seoOverride, validLocale);
  },
  component: LocalizedToolPageRoute,
});

function LocalizedToolPageContent({ slug, locale }: { slug: string; locale: LocaleCode }) {
  const { t } = useI18n();
  const runtime = getReadyToolRuntime(slug);

  useEffect(() => {
    trackPageView(`/${locale}/tools/${slug}`);
  }, [locale, slug]);

  usePageSeo(slug, runtime?.seoOverride, locale);

  if (!runtime) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground">{t("toolPage.notFound.missingTitle")}</h1>
          <p className="mt-4 text-muted-foreground">{t("toolPage.notFound.missingDescription")}</p>
          <Link to="/" className="mt-8 inline-flex rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10">
            {t("toolPage.notFound.backHome")}
          </Link>
        </div>
      </SiteLayout>
    );
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

function LocalizedToolPageRoute() {
  const { locale, slug } = Route.useParams() as { locale?: string; slug: string };
  const validLocale: LocaleCode = isSupportedLocale(locale) ? locale : "ar";
  return (
    <LocalI18nProvider locale={validLocale}>
      <LocalizedToolPageContent slug={slug} locale={validLocale} />
    </LocalI18nProvider>
  );
}
