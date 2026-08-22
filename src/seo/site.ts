export const SUPPORTED_LOCALES = ['en', 'ar'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

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
  return first === 'ar' ? 'ar' : DEFAULT_LOCALE;
}

export function directionForLocale(locale: SupportedLocale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function alternateLinks(pathname: string): Array<{ rel: 'alternate'; hrefLang: string; href: string }> {
  if (pathname === '/en/image-compressor' || pathname === '/ar/image-compressor') {
    return [
      { rel: 'alternate', hrefLang: 'en', href: absoluteSiteUrl('/en/image-compressor') ?? '' },
      { rel: 'alternate', hrefLang: 'ar', href: absoluteSiteUrl('/ar/image-compressor') ?? '' },
      { rel: 'alternate', hrefLang: 'x-default', href: absoluteSiteUrl('/en/image-compressor') ?? '' },
    ];
  }
  return [];
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
