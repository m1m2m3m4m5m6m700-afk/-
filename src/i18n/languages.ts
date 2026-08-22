import type { SupportedLanguage } from './schema';

export const SUPPORTED_LANGUAGES = [
  'en','ar','zh','es','fr','de','pt','ja','ko','ru','it','nl','pl','tr','sv','id','hi','ur','vi','th',
] as const satisfies readonly SupportedLanguage[];

export type { SupportedLanguage };

export const RTL_LANGUAGES = new Set<SupportedLanguage>(['ar', 'ur']);

export const isSupportedLanguage = (value: string): value is SupportedLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
