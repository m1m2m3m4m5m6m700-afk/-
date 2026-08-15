import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { getReadyToolRuntime } from "@/lib/tool-runtime/readyTools";
import { tools } from "@/data/tools";
import { getVerifiedDesktopTool } from "@/lib/desktop-tools/verifiedCatalog";
import { categoryById } from "@/data/categories";
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

  useEffect(() => {
    trackPageView(`/${locale}/tools/${slug}`);
  }, [locale, slug]);

  const runtime = getReadyToolRuntime(slug);
  usePageSeo(slug, runtime?.seoOverride, locale);
  const toolRecord = tools.find((entry) => entry.slug === slug || entry.id === slug) ?? getVerifiedDesktopTool(slug);

  if (runtime && toolRecord?.status === "ready") {
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

  const category = toolRecord ? categoryById.get(toolRecord.categoryId) : undefined;
  const icon = category?.icon ?? Sparkles;
  const categoryName = category ? resolveCategoryName(category.id, t) : t("nav.tools");

  if (!toolRecord || toolRecord.status !== "ready") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground">{t("toolPage.notFound.missingTitle")}</h1>
          <p className="mt-4 text-muted-foreground">{t("toolPage.notFound.missingDescription")}</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/" className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10">{t("toolPage.notFound.backHome")}</Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <ToolLayout
        icon={icon}
        name={resolveToolName(toolRecord.slug || toolRecord.id, t)}
        description={toolRecord.description}
        category={categoryName}
        slug={toolRecord.slug}
      >
        <div className="rounded-3xl border border-border bg-card p-8 text-sm text-muted-foreground"><p className="text-base font-semibold text-foreground">{resolveToolName(toolRecord.slug || toolRecord.id, t)} ({locale.toUpperCase()})</p><p className="mt-2">{toolRecord.description}</p></div>
      </ToolLayout>
    </SiteLayout>
  );
}

function LocalizedToolPageRoute() {
  const { locale, slug } = Route.useParams() as { locale?: string; slug: string };
  const validLocale: LocaleCode = isSupportedLocale(locale) ? locale : "ar";
  return <LocalI18nProvider locale={validLocale}><LocalizedToolPageContent slug={slug} locale={validLocale} /></LocalI18nProvider>;
}
