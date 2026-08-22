import { SUPPORTED_LANGUAGES, RTL_LANGUAGES } from '../i18n/languages';
import type { SupportedLanguage } from '../i18n/schema';

export const SUPPORTED_LOCALES = SUPPORTED_LANGUAGES;
export type SupportedLocale = SupportedLanguage;
export const DEFAULT_LOCALE: SupportedLocale = 'en';

const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();

export function getSiteUrl(): string | null {
  if (!configuredSiteUrl) return null;
  try {
    const url = new URL(configuredSiteUrl);
    if (url.protocol !== 'https:' || url.hostname.endsWith('.vercel.app') || url.hostname === 'localhost') return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function absoluteSiteUrl(pathname: string): string | null {
  const origin = getSiteUrl();
  if (!origin) return null;
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${origin}${normalized}`;
}

export function localeFromPath(pathname: string): SupportedLocale {
  const first = pathname.split('/')[1];
  return SUPPORTED_LANGUAGES.includes(first as SupportedLocale) ? first as SupportedLocale : DEFAULT_LOCALE;
}

export function directionForLocale(locale: SupportedLocale): 'ltr' | 'rtl' {
  return RTL_LANGUAGES.has(locale) ? 'rtl' : 'ltr';
}

export function alternateLinks(pathname: string): Array<{ rel: 'alternate'; hrefLang: string; href: string }> {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length !== 2) return [];
  const toolId = parts[1];
  return [
    ...SUPPORTED_LANGUAGES.map((language) => ({
      rel: 'alternate' as const,
      hrefLang: language,
      href: absoluteSiteUrl(`/${language}/${toolId}`) ?? `/${language}/${toolId}`,
    })),
    { rel: 'alternate', hrefLang: 'x-default', href: absoluteSiteUrl(`/en/${toolId}`) ?? `/en/${toolId}` },
  ];
}

export function softwareApplicationSchema(input: {
  name: string;
  description: string;
  pathname: string;
  language: SupportedLocale;
  applicationCategory?: string;
}) {
  const url = absoluteSiteUrl(input.pathname);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: input.name,
    description: input.description,
    applicationCategory: input.applicationCategory ?? 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    isAccessibleForFree: true,
    inLanguage: input.language,
    ...(url ? { url } : {}),
  };
}
