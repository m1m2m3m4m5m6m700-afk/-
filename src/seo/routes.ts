import { getReadyToolConfigs } from '../config/tools';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';

export const INDEXABLE_ROUTES = Object.freeze([
  '/',
  ...SUPPORTED_LANGUAGES.flatMap((language) =>
    getReadyToolConfigs().map((tool) => `/${language}/${tool.id}`),
  ),
]);

export const LOCALIZED_ROUTE_COUNT = SUPPORTED_LANGUAGES.length * 22;

export function canonicalToolPath(language: string, toolId: string) {
  return `/${language}/${toolId}`;
}

export function localeForPath(pathname: string) {
  const language = pathname.split('/')[1] ?? 'en';
  return SUPPORTED_LANGUAGES.includes(language as (typeof SUPPORTED_LANGUAGES)[number]) ? language : 'en';
}
