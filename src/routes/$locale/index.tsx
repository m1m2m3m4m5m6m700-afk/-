import { createFileRoute, notFound } from "@tanstack/react-router";
import { FAQ } from "@/components/landing/FAQ";
import { SponsorSection } from "@/components/landing/SponsorSection";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { LocalI18nProvider, isSupportedLocale, type LocaleCode } from "@/lib/i18n";
import { buildHomeHeadMetadata } from "@/lib/seo/homePageMetadata";

export const Route = createFileRoute("/$locale/")({
  beforeLoad: ({ params }) => { if (!isSupportedLocale(params.locale) || params.locale === "en") throw notFound(); },
  head: ({ params }) => { const locale = isSupportedLocale(params.locale) ? params.locale : "ar"; return buildHomeHeadMetadata(locale); },
  component: LocalizedIndexRoute,
});

function LocalizedIndexContent() {
  return (
    <SiteLayout showFloatingChat={false}>
      <main className="mx-auto flex min-h-[65vh] max-w-5xl items-center justify-center px-5 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-70">Flixo</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">A clean workspace is being prepared.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 opacity-80">Public tools are intentionally disabled. The technical foundation remains intact while every new tool is rebuilt and verified before release.</p>
        </div>
      </main>
      <FAQ />
      <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-6 lg:px-8"><SponsorSection variant="compact" /></div>
    </SiteLayout>
  );
}

function LocalizedIndexRoute() {
  const { locale } = Route.useParams() as { locale?: string };
  const validLocale: LocaleCode = isSupportedLocale(locale) ? locale : "ar";
  return <LocalI18nProvider locale={validLocale}><LocalizedIndexContent /></LocalI18nProvider>;
}
