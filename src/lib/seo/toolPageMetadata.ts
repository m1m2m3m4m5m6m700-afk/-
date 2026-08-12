import { getToolBySlug } from "@/data/tools";
import { getToolSeo, type ToolSeoData } from "@/data/toolSeo";
import { ar } from "@/lib/i18n/locales/ar";
import type { LocaleCode } from "@/lib/i18n";
import {
  DEFAULT_ROBOTS,
  NOINDEX_ROBOTS,
  SITE_NAME,
  SITE_TWITTER_HANDLE,
  SITE_URL,
  getDefaultOgImageUrl,
  getToolCanonicalUrl,
  stripQueryAndHash,
} from "./site";

export interface SeoMetaTag {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
  charSet?: string;
}

export interface ResolvedPageSeo {
  title: string;
  description: string;
  keywords: string[];
  robots: string;
  pageUrl: string;
  canonicalUrl: string;
  ogImage: string;
  locale: LocaleCode;
}

export function resolvePageSeo(
  slug?: string,
  customData?: Partial<ToolSeoData>,
  locale: LocaleCode = "en",
): ResolvedPageSeo {
  const seoData = slug ? getToolSeo(slug) : null;

  let title = customData?.title || seoData?.title || "Flixo — Free Online Tools & Utilities";
  let description =
    customData?.description ||
    seoData?.description ||
    "Flixo provides free, private, browser-based online tools for images, text, translation, PDFs, and developer utilities with zero sign-up.";

  if (locale === "ar" && slug && !customData?.title) {
    const arName = ar[`tool.${slug}.name` as keyof typeof ar];
    const arTagline = ar[`tool.${slug}.tagline` as keyof typeof ar];
    if (arName) {
      title = `${arName} — أداة مجانية أونلاين | فليكسو`;
      description = arTagline
        ? `${arTagline} استخدم ${arName} أونلاين مجانًا وسريعًا وآمنًا مباشرة عبر المتصفح في فليكسو بدون تسجيل.`
        : `استخدم أداة ${arName} أونلاين مجانًا وسريعًا وآمنًا مباشرة في متصفحك عبر فليكسو بدون تسجيل.`;
    } else {
      title = "أدوات فليكسو المجانية أونلاين | Flixo Tools";
      description =
        "استخدم أدوات فليكسو المجانية والآمنة أونلاين مباشرة عبر المتصفح بدون الحاجة لتسجيل حساب.";
    }
  }

  const keywords = customData?.keywords ||
    seoData?.keywords || ["flixo", "online tools", "free utilities", "browser tools"];

  const fallbackPageUrl = slug ? getToolCanonicalUrl(slug, locale) : SITE_URL;
  const pageUrl =
    typeof window !== "undefined" && window.location?.href ? window.location.href : fallbackPageUrl;
  const canonicalUrl = slug ? getToolCanonicalUrl(slug, locale) : stripQueryAndHash(pageUrl);
  const origin =
    typeof window !== "undefined" && window.location?.origin ? window.location.origin : SITE_URL;

  // Hidden / non-ready tools must never be indexed. Direct URLs still resolve
  // to a not-found page, but search engines are told to drop the URL.
  const tool = slug ? getToolBySlug(slug) : undefined;
  const isPublicTool = !slug || tool?.status === "ready";
  const robots = isPublicTool ? DEFAULT_ROBOTS : NOINDEX_ROBOTS;

  return {
    title,
    description,
    keywords,
    robots,
    pageUrl,
    canonicalUrl,
    ogImage: getDefaultOgImageUrl(origin),
    locale,
  };
}

export function buildToolHeadMetadata(
  slug: string,
  overrides?: Partial<ToolSeoData>,
  locale: LocaleCode = "en",
) {
  const seo = resolvePageSeo(slug, overrides, locale);
  const ogLocale = locale === "ar" ? "ar_AR" : "en_US";

  const links = [
    { rel: "canonical", href: seo.canonicalUrl },
    { rel: "alternate", hrefLang: "en", href: getToolCanonicalUrl(slug, "en") },
    { rel: "alternate", hrefLang: "ar", href: getToolCanonicalUrl(slug, "ar") },
    { rel: "alternate", hrefLang: "x-default", href: getToolCanonicalUrl(slug) },
  ];

  return {
    meta: [
      { title: seo.title },
      { name: "description", content: seo.description },
      { name: "keywords", content: seo.keywords.join(", ") },
      { name: "robots", content: seo.robots },
      { property: "og:title", content: seo.title },
      { property: "og:description", content: seo.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: seo.canonicalUrl },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:image", content: seo.ogImage },
      { property: "og:locale", content: ogLocale },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: SITE_TWITTER_HANDLE },
      { name: "twitter:title", content: seo.title },
      { name: "twitter:description", content: seo.description },
      { name: "twitter:image", content: seo.ogImage },
    ] satisfies SeoMetaTag[],
    links,
  };
}
