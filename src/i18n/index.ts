import type { LocaleCode } from '../config/i18n';
import { DEFAULT_LOCALE, getLanguageConfig, SUPPORTED_LANGUAGES } from '../config/i18n';
import type { LocaleDictionary } from './types';
import en from './locales/en'; import zh from './locales/zh'; import hi from './locales/hi'; import es from './locales/es'; import fr from './locales/fr'; import ar from './locales/ar'; import bn from './locales/bn'; import pt from './locales/pt'; import ru from './locales/ru'; import ur from './locales/ur'; import id from './locales/id'; import de from './locales/de'; import ja from './locales/ja'; import sw from './locales/sw'; import mr from './locales/mr'; import te from './locales/te'; import tr from './locales/tr'; import ta from './locales/ta'; import ko from './locales/ko'; import vi from './locales/vi';

export const LOCALES: Record<LocaleCode, LocaleDictionary> = { en, zh, hi, es, fr, ar, bn, pt, ru, ur, id, de, ja, sw, mr, te, tr, ta, ko, vi };
export const getLocale = (code: string): LocaleDictionary => LOCALES[(SUPPORTED_LANGUAGES.some((language) => language.code === code) ? code : DEFAULT_LOCALE) as LocaleCode];
export const localePath = (locale: LocaleCode, toolPath: string) => `/${locale}/${toolPath.replace(/^\/(?:[a-z]{2})\//, '')}`;
export const alternateLinks = (toolPath: string) => SUPPORTED_LANGUAGES.map((language) => ({ code: language.code, href: localePath(language.code, toolPath) }));
export const localeMeta = (code: string) => getLanguageConfig(code);
