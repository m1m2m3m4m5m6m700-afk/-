import type { LocaleCode } from '../config/i18n';

export interface ToolTranslation { title: string; description: string }
export interface LocaleDictionary {
  code: LocaleCode;
  siteName: string;
  eyebrow: string;
  homeTitle: string;
  homeLead: string;
  tools: Record<string, ToolTranslation>;
}
