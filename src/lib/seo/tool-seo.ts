import { getReadyToolConfigs, getToolConfig, type ToolConfig } from '../../config/tools';
import { LOCALES, SITE_ORIGIN, TRANSLATION_BUNDLES, type Locale, normalizeLocale } from '../i18n';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'Online tool', ar: 'أداة عبر الإنترنت', es: 'Herramienta en línea', fr: 'Outil en ligne',
  de: 'Online-Tool', ru: 'Онлайн-инструмент', zh: '在线工具', hi: 'ऑनलाइन टूल', id: 'Alat online',
  ur: 'آن لائن ٹول', ja: 'オンラインツール', pt: 'Ferramenta online', it: 'Strumento online',
  ko: '온라인 도구', nl: 'Online tool', pl: 'Narzędzie online', tr: 'Çevrimiçi araç',
  vi: 'Công cụ trực tuyến', th: 'เครื่องมือออนไลน์', sv: 'Onlineverktyg',
};

export const READY_TOOL_IDS = Object.freeze(getReadyToolConfigs().map((tool) => tool.id));

export function getLocalizedToolUrl(locale: Locale, toolId: string): string {
  return `${SITE_ORIGIN}/${locale}/${toolId}`;
}

export function getToolSeo(localeInput: string, toolId: string) {
  const locale = normalizeLocale(localeInput);
  const tool = getToolConfig(toolId);

  if (!tool || !tool.isReady) return null;

  const bundle = TRANSLATION_BUNDLES[locale];
  const label = LOCALE_LABELS[locale];
  const url = getLocalizedToolUrl(locale, tool.id);
  const title = `${tool.title} | FLIXO`;
  const description = `${label} FLIXO: ${tool.description}`;

  return {
    locale,
    tool,
    url,
    title,
    description,
    languageTag: bundle.languageTag,
    direction: bundle.direction,
    alternates: LOCALES.map((alternateLocale) => ({
      locale: alternateLocale,
      languageTag: TRANSLATION_BUNDLES[alternateLocale].languageTag,
      url: getLocalizedToolUrl(alternateLocale, tool.id),
    })),
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: title,
      description,
      url,
      inLanguage: bundle.languageTag,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any',
    },
  } as const;
}

export function getReadyToolsForSeo(): readonly ToolConfig[] {
  return getReadyToolConfigs();
}
