import type { TranslationSchema, SupportedLanguage } from './schema';

const loaders: Record<SupportedLanguage, () => Promise<{ default: TranslationSchema }>> = {
  en: () => import('./locales/en'),
  ar: () => import('./locales/ar'),
  zh: () => import('./locales/zh'),
  es: () => import('./locales/es'),
  fr: () => import('./locales/fr'),
  de: () => import('./locales/de'),
  pt: () => import('./locales/pt'),
  ja: () => import('./locales/ja'),
  ko: () => import('./locales/ko'),
  ru: () => import('./locales/ru'),
  it: () => import('./locales/it'),
  nl: () => import('./locales/nl'),
  pl: () => import('./locales/pl'),
  tr: () => import('./locales/tr'),
  sv: () => import('./locales/sv'),
  id: () => import('./locales/id'),
  hi: () => import('./locales/hi'),
  ur: () => import('./locales/ur'),
  vi: () => import('./locales/vi'),
  th: () => import('./locales/th'),
};

const cache = new Map<SupportedLanguage, Promise<TranslationSchema>>();

export async function loadLocale(language: SupportedLanguage): Promise<TranslationSchema> {
  const cached = cache.get(language);
  if (cached) return cached;

  const promise = loaders[language]().then((module) => module.default).catch(async (error) => {
    if (language === 'en') throw error;
    return loadLocale('en');
  });

  cache.set(language, promise);
  return promise;
}
