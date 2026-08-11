import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { getReadyToolRuntime } from "@/lib/tool-runtime/readyTools";
import { tools } from "@/data/tools";
import { categoryById } from "@/data/categories";
import { buildToolHeadMetadata } from "@/lib/seo/toolPageMetadata";
import { usePageSeo } from "@/lib/usePageSeo";
import { LocalI18nProvider, isSupportedLocale, useI18n, type LocaleCode } from "@/lib/i18n";
import { resolveCategoryName, resolveToolName } from "@/lib/i18n/keys";
import { trackPageView } from "@/lib/analytics";

export const Route = createFileRoute("/$locale/tools/$slug")({
  // Validate the `:locale` segment against the 25 supported locales. Unknown
  // locales throw a 404 (no redirect, no English fallback). The tool slug is
  // preserved across locales (e.g. /ar/tools/calculator → /es/tools/calculator
  // keeps the same slug). English tool pages live at /tools/<slug>.
  beforeLoad: ({ params }) => {
    if (!isSupportedLocale(params.locale) || params.locale === "en") {
      throw notFound();
    }
  },
  head: ({ params }) => {
    const { slug } = params;
    // Guarded by beforeLoad: params.locale is a supported non-en LocaleCode.
    const validLocale: LocaleCode = isSupportedLocale(params.locale) ? params.locale : "ar";
    const runtime = getReadyToolRuntime(slug);
    return buildToolHeadMetadata(slug, runtime?.seoOverride, validLocale);
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

  // Hidden / non-ready tools must never render their implementation, even when
  // a runtime is registered. Block direct URLs to stub/mock tools.
  const toolRecord = tools.find((t) => t.slug === slug || t.id === slug);
  if (runtime && (!toolRecord || toolRecord.status === "ready")) {
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

  const tool = toolRecord;
  const category = tool ? categoryById?.get(tool.categoryId) : undefined;
  const icon = category?.icon ?? Sparkles;
  const categoryName = category ? resolveCategoryName(category.id, t) : t("nav.tools");

  if (!tool || tool.status !== "ready") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            {t("toolPage.notFound.missingTitle")}
          </h1>
          <p className="mt-4 text-muted-foreground">{t("toolPage.notFound.missingDescription")}</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              {t("toolPage.notFound.backHome")}
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <ToolLayout
        icon={icon}
        name={resolveToolName(tool.slug || tool.id, t)}
        description={tool.description}
        category={categoryName}
        slug={tool.slug}
      >
        <div className="rounded-3xl border border-border bg-card p-8 space-y-6 text-sm text-muted-foreground">
          <p className="text-base text-foreground font-semibold">
            {resolveToolName(tool.slug || tool.id, t)} ({locale.toUpperCase()})
          </p>
          <p>{tool.description}</p>
        </div>
      </ToolLayout>
    </SiteLayout>
  );
}

function LocalizedToolPageRoute() {
  const { locale, slug } = Route.useParams() as { locale?: string; slug: string };
  // beforeLoad guarantees a supported non-en locale here; guard keeps TS happy.
  const validLocale: LocaleCode = isSupportedLocale(locale) ? locale : "ar";

  return (
    <LocalI18nProvider locale={validLocale}>
      <LocalizedToolPageContent slug={slug} locale={validLocale} />
    </LocalI18nProvider>
  );
}
