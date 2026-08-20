import { getToolBySlug } from "@/data/tools";
import { getVerifiedDesktopTool } from "@/lib/desktop-tools/verifiedCatalog";
import { getToolSeo, type ToolSeoData } from "@/data/toolSeo";
import { en } from "@/lib/i18n/locales/en";
import { ar } from "@/lib/i18n/locales/ar";
import { es } from "@/lib/i18n/locales/es";
import { fr } from "@/lib/i18n/locales/fr";
import { de } from "@/lib/i18n/locales/de";
import { pt } from "@/lib/i18n/locales/pt";
import { it } from "@/lib/i18n/locales/it";
import { nl } from "@/lib/i18n/locales/nl";
import { pl } from "@/lib/i18n/locales/pl";
import { sv } from "@/lib/i18n/locales/sv";
import { tr } from "@/lib/i18n/locales/tr";
import { ro } from "@/lib/i18n/locales/ro";
import { uk } from "@/lib/i18n/locales/uk";
import { ru } from "@/lib/i18n/locales/ru";
import { ms } from "@/lib/i18n/locales/ms";
import { id } from "@/lib/i18n/locales/id";
import { vi } from "@/lib/i18n/locales/vi";
import { zhCN as zhCNDict } from "@/lib/i18n/locales/zh-CN";
import { ja } from "@/lib/i18n/locales/ja";
import { ko } from "@/lib/i18n/locales/ko";
import { el } from "@/lib/i18n/locales/el";
import { cs } from "@/lib/i18n/locales/cs";
import { th } from "@/lib/i18n/locales/th";
import { hi } from "@/lib/i18n/locales/hi";
import { he } from "@/lib/i18n/locales/he";
import { fa } from "@/lib/i18n/locales/fa";
import { bn } from "@/lib/i18n/locales/bn";
import type { Dictionary, LocaleCode } from "@/lib/i18n";
import {
  DEFAULT_ROBOTS,
  NOINDEX_ROBOTS,
  SITE_NAME,
  SITE_TWITTER_HANDLE,
  SITE_URL,
  getDefaultOgImageUrl,
  getOgLocale,
  getToolCanonicalUrl,
  stripQueryAndHash,
} from "./site";
import { buildToolHreflang } from "./hreflang";
import { SEO_TEMPLATES } from "./seoTemplates";

const SEO_DICTIONARIES: Partial<Record<LocaleCode, Dictionary>> = {
  ar, es, fr, de, pt, it, nl, pl, sv, tr, ro, uk, ru, ms, id, vi,
  "zh-CN": zhCNDict, ja, ko, el, cs, th, hi, he, fa, bn,
};

export interface SeoMetaTag { title?: string; name?: string; property?: string; content?: string; charSet?: string; }
export interface ResolvedPageSeo { title: string; description: string; keywords: string[]; robots: string; pageUrl: string; canonicalUrl: string; ogImage: string; locale: LocaleCode; }

function getToolRecord(slug: string) {
  return getToolBySlug(slug) ?? getVerifiedDesktopTool(slug);
}

function getLocalizedToolCopy(slug: string, locale: LocaleCode) {
  if (locale === "en") return null;
  const dict = SEO_DICTIONARIES[locale];
  const tpl = SEO_TEMPLATES[locale];
  if (!dict || !tpl) return { missing: true } as const;
  const nameKey = `tool.${slug}.name` as keyof Dictionary;
  const taglineKey = `tool.${slug}.tagline` as keyof Dictionary;
  const locName = dict[nameKey];
  const locTagline = dict[taglineKey];
  const enName = en[nameKey];
  const enTagline = en[taglineKey];
  if (!locName || locName === enName) return { missing: true } as const;
  const hasLocalizedTagline = Boolean(locTagline && locTagline !== enTagline);
  if (!hasLocalizedTagline) return { missing: true, name: locName } as const;
  return { missing: false, name: locName, title: tpl.title(locName), description: tpl.description(locName, locTagline) } as const;
}

export function resolvePageSeo(slug?: string, customData?: Partial<ToolSeoData>, locale: LocaleCode = "en"): ResolvedPageSeo {
  const seoData = slug ? getToolSeo(slug) : null;
  let title = customData?.title || seoData?.title || "Flixo — Free Online Tools & Utilities";
  let description = customData?.description || seoData?.description || "Flixo provides free, private, browser-based online tools for images, text, translation, PDFs, and developer utilities with zero sign-up.";
  let localizationComplete = true;

  if (slug && !customData?.title) {
    const localizedCopy = getLocalizedToolCopy(slug, locale);
    if (locale !== "en" && localizedCopy?.missing) {
      localizationComplete = false;
      title = `Missing localization — ${locale}`;
      description = `This ${locale} page is hidden from search until its localized title and description are completed.`;
    } else if (localizedCopy && !localizedCopy.missing) {
      title = localizedCopy.title;
      description = localizedCopy.description;
    }
  }

  const keywords = customData?.keywords || seoData?.keywords || ["flixo", "online tools", "free utilities", "browser tools"];
  const fallbackPageUrl = slug ? getToolCanonicalUrl(slug, locale) : SITE_URL;
  const pageUrl = typeof window !== "undefined" && window.location?.href ? window.location.href : fallbackPageUrl;
  const canonicalUrl = slug ? getToolCanonicalUrl(slug, locale) : stripQueryAndHash(pageUrl);
  const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : SITE_URL;
  const tool = slug ? getToolRecord(slug) : undefined;
  const isPublicTool = !slug || !tool || !("status" in tool) || tool.status === "ready";
  const robots = isPublicTool && localizationComplete ? DEFAULT_ROBOTS : NOINDEX_ROBOTS;

  return { title, description, keywords, robots, pageUrl, canonicalUrl, ogImage: getDefaultOgImageUrl(origin), locale };
}

export function buildToolHeadMetadata(slug: string, overrides?: Partial<ToolSeoData>, locale: LocaleCode = "en") {
  const seo = resolvePageSeo(slug, overrides, locale);
  const ogLocale = getOgLocale(locale);
  const tool = getToolRecord(slug);
  const localizedCopy = getLocalizedToolCopy(slug, locale);
  const shortTitle = locale !== "en" && localizedCopy?.missing ? `Missing localization — ${locale}` : `${localizedCopy?.name ?? tool?.name ?? slug} | Flixo Tools`;
  const links = [
    { rel: "icon", href: "/flixo-mark.svg", type: "image/svg+xml" },
    { rel: "canonical", href: seo.canonicalUrl },
    ...buildToolHreflang(slug),
  ];
  return {
    meta: [
      { title: shortTitle },
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
