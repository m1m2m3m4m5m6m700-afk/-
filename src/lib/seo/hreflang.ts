/**
 * Centralized hreflang generation. Emits reciprocal `alternate` links for
 * every supported locale plus `x-default`, so each localized page declares
 * the full set of alternates (required by Google for correct locale pairing).
 *
 * English always points at the root (`SITE_URL` / `/tools/<slug>`), never
 * `/en`. Every emitted URL targets a route that resolves to HTTP 200:
 *  - homepage: `/` (en) or `/<locale>` (others)
 *  - tool page: `/tools/<slug>` (en) or `/<locale>/tools/<slug>` (others)
 *
 * Only locales whose localized route actually renders are advertised — all
 * supported locales have a `/$locale` and `/$locale/tools/$slug` route that
 * returns 200, so the full set is always emitted.
 */

import { LOCALES, DEFAULT_LOCALE, type LocaleCode } from "@/lib/i18n";
import { SITE_URL, getToolCanonicalUrl, getHomeUrl } from "./site";

export interface AlternateLink {
  rel: "alternate";
  hrefLang: string;
  href: string;
}

/**
 * Alternate links for a tool page: one entry per supported locale + x-default.
 * `x-default` points to the English (root) version.
 */
export function buildToolHreflang(slug: string): AlternateLink[] {
  const links: AlternateLink[] = LOCALES.map((l) => ({
    rel: "alternate",
    hrefLang: l.code,
    href: getToolCanonicalUrl(slug, l.code),
  }));
  links.push({
    rel: "alternate",
    hrefLang: "x-default",
    href: getToolCanonicalUrl(slug, DEFAULT_LOCALE),
  });
  return links;
}

/**
 * Alternate links for the localized homepage: one entry per supported locale +
 * x-default. English → root, every other locale → `/<locale>`.
 */
export function buildHomeHreflang(): AlternateLink[] {
  const links: AlternateLink[] = LOCALES.map((l) => ({
    rel: "alternate",
    hrefLang: l.code,
    href: getHomeUrl(l.code),
  }));
  links.push({
    rel: "alternate",
    hrefLang: "x-default",
    href: SITE_URL,
  });
  return links;
}

/** All supported locale codes (handy for callers that iterate locales). */
export const ALL_LOCALE_CODES: LocaleCode[] = LOCALES.map((l) => l.code);
