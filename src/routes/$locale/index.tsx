import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AITaskInterface } from "@/components/assistant/AITaskInterface";
import { CapabilityCards, SupportedFiles } from "@/components/assistant/HomeSignals";
import { PopularToolsSection } from "@/components/landing/PopularToolsSection";
import { NewToolsSection } from "@/components/landing/NewToolsSection";
import { TrendingToolsSection } from "@/components/seo/TrendingToolsSection";
import { WhyFlixo } from "@/components/landing/WhyFlixo";
import { FAQ } from "@/components/landing/FAQ";
import { SponsorSection } from "@/components/landing/SponsorSection";
import { RequestToolDialog } from "@/components/landing/RequestToolDialog";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { LocalI18nProvider, isSupportedLocale, type LocaleCode } from "@/lib/i18n";

export const Route = createFileRoute("/$locale/")({
  // Validate the `:locale` segment against the 25 supported locales. Unknown
  // locales throw a 404 (no redirect, no English fallback under a foreign URL —
  // keeps the URL space clean for crawlers). Supported locales (incl. zh-CN,
  // ar/he/fa) proceed and render the localized home. Note: English has no
  // localized route here — it lives at `/` (`src/routes/index.tsx`).
  beforeLoad: ({ params }) => {
    if (!isSupportedLocale(params.locale) || params.locale === "en") {
      throw notFound();
    }
  },
  head: ({ params }) => {
    // Guarded by beforeLoad, so params.locale is a supported non-en LocaleCode.
    const locale = isSupportedLocale(params.locale) ? params.locale : "ar";
    const isAr = locale === "ar";
    return {
      meta: [
        {
          title: isAr
            ? "فليكسو — منصة واحدة لجميع أدوات الذكاء الاصطناعي والمستندات"
            : "Flixo — One Workspace for Every AI Tool",
        },
        {
          name: "description",
          content: isAr
            ? "فليكسو يقدم أدوات مجانية وسريعة للترجمة وتعديل الصور وملفات PDF وتحسين الكتابة مباشرة عبر المتصفح بدون تسجيل."
            : "Flixo is an AI task assistant that understands your intent, files, links, and media, and instantly selects the best workflow.",
        },
        {
          property: "og:title",
          content: isAr ? "فليكسو — أدوات الذكاء الاصطناعي" : "Flixo — AI Task Assistant",
        },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: isAr ? "ar_AR" : "en_US" },
      ],
      links: [
        { rel: "canonical", href: `https://flixotools.com/${locale}` },
        { rel: "alternate", hrefLang: "en", href: "https://flixotools.com/en" },
        { rel: "alternate", hrefLang: "ar", href: "https://flixotools.com/ar" },
        { rel: "alternate", hrefLang: "x-default", href: "https://flixotools.com" },
      ],
    };
  },
  component: LocalizedIndexRoute,
});

function LocalizedIndexContent() {
  const [query, setQuery] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);

  const handleRequestTool = (prefillPrompt?: string) => {
    if (prefillPrompt) {
      setQuery(prefillPrompt);
    }
    setRequestOpen(true);
  };

  return (
    <SiteLayout onRequestTool={() => handleRequestTool()}>
      <div className="bg-hero-glow">
        <div className="mx-auto max-w-4xl space-y-16 px-5 py-20 sm:px-6 lg:px-8">
          <AITaskInterface onRequestTool={handleRequestTool} />
          <PopularToolsSection />
          <CapabilityCards />
          <SupportedFiles />
        </div>
      </div>

      <WhyFlixo />

      <div className="mx-auto max-w-4xl space-y-16 px-5 py-20 sm:px-6 lg:px-8">
        <TrendingToolsSection />
        <NewToolsSection />
      </div>

      <FAQ />

      <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-6 lg:px-8">
        <SponsorSection variant="compact" />
      </div>

      <RequestToolDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        initialDescription={query}
      />
    </SiteLayout>
  );
}

function LocalizedIndexRoute() {
  const { locale } = Route.useParams() as { locale?: string };
  // beforeLoad guarantees a supported non-en locale here; guard keeps TS happy.
  const validLocale: LocaleCode = isSupportedLocale(locale) ? locale : "ar";

  return (
    <LocalI18nProvider locale={validLocale}>
      <LocalizedIndexContent />
    </LocalI18nProvider>
  );
}
