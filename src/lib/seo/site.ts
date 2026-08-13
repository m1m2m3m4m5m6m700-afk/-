export const SITE_URL = "https://flixoai.vercel.app";
export const SITE_NAME = "Flixo";
export const SITE_DISPLAY_NAME = "Flixo Tools";
export const SITE_TWITTER_HANDLE = "@FlixoTools";
export const DEFAULT_OG_IMAGE_PATH = "/og-image.png";
export const DEFAULT_ROBOTS =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
export const NOINDEX_ROBOTS = "noindex, nofollow";

export const getDefaultOgImageUrl = (origin: string = SITE_URL) =>
  `${origin}${DEFAULT_OG_IMAGE_PATH}`;
export const stripQueryAndHash = (url: string) => url.split("?")[0].split("#")[0];
// English is served at the site root (`/tools/<slug>`), so the "en" locale
// maps to no path segment. Non-en locales use `/<locale>/tools/<slug>`.
export const getToolCanonicalUrl = (slug: string, locale?: string) =>
  locale && locale !== "en" ? `${SITE_URL}/${locale}/tools/${slug}` : `${SITE_URL}/tools/${slug}`;
export const getCategoryCanonicalUrl = (slug: string) => `${SITE_URL}/categories/${slug}`;
export const getAbsoluteUrl = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * Build the localized URL for a homepage (the root for English, `/<locale>`
 * for every other supported locale). English is served at `/`, never `/en`.
 */
export const getHomeUrl = (locale: string) =>
  locale && locale !== "en" ? `${SITE_URL}/${locale}` : SITE_URL;

/**
 * og:locale values per locale (BCP-47 / Facebook convention). Falls back to
 * `en_US` for any unmapped locale so a valid value is always emitted.
 */
const OG_LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  ar: "ar_AR",
  es: "es_ES",
  "zh-CN": "zh_CN",
  hi: "hi_IN",
  pt: "pt_PT",
  fr: "fr_FR",
  de: "de_DE",
  ja: "ja_JP",
  ko: "ko_KR",
  tr: "tr_TR",
  it: "it_IT",
  vi: "vi_VN",
  id: "id_ID",
  th: "th_TH",
  pl: "pl_PL",
  nl: "nl_NL",
  sv: "sv_SE",
  uk: "uk_UA",
  ro: "ro_RO",
  el: "el_GR",
  cs: "cs_CZ",
  he: "he_IL",
  bn: "bn_IN",
  fa: "fa_IR",
  ru: "ru_RU",
  ms: "ms_MY",
};

export const getOgLocale = (locale: string): string => OG_LOCALE_MAP[locale] ?? "en_US";
