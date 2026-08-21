import { TOOLS_REGISTRY } from './tools';
import { getLanguageConfig, isLocaleCode, SUPPORTED_LANGUAGES, type LocaleCode } from './i18n';

export interface RouteContractEntry {
  lang: LocaleCode;
  toolId: string;
  path: string;
  dir: 'rtl' | 'ltr';
  expectedStatus: 200;
}

export const ROUTE_CONTRACT_440: readonly RouteContractEntry[] = Object.freeze(
  SUPPORTED_LANGUAGES.flatMap((language) =>
    TOOLS_REGISTRY.map((tool) => ({
      lang: language.code as LocaleCode,
      toolId: tool.id,
      path: `/${language.code}/${tool.id}`,
      dir: language.dir,
      expectedStatus: 200 as const,
    })),
  ),
);

export const ROUTE_CONTRACT_SIZE = 20 * 22;

export function isValidRoute(lang: string, toolId: string): boolean {
  return isLocaleCode(lang) && TOOLS_REGISTRY.some((tool) => tool.id === toolId);
}

export function getRouteContractEntry(lang: string, toolId: string): RouteContractEntry | undefined {
  if (!isValidRoute(lang, toolId)) return undefined;
  return ROUTE_CONTRACT_440.find((route) => route.lang === lang && route.toolId === toolId);
}

export function getRouteDirection(lang: string): 'rtl' | 'ltr' {
  return getLanguageConfig(lang).dir;
}
