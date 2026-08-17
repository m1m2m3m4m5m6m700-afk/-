import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Dictionary, type TranslationKey } from "./locales/en";
export type { Dictionary };

export type LocaleCode = "en" | "ar" | "es" | "zh-CN" | "hi" | "pt" | "fr" | "de" | "ja" | "ko" | "tr" | "it" | "vi" | "id" | "th" | "pl" | "nl" | "sv" | "uk" | "ro" | "el" | "cs" | "he" | "bn" | "fa" | "ru" | "ms";
export type Direction = "ltr" | "rtl";
export interface LocaleMeta { code: LocaleCode; label: string; dir: Direction; }

export const LOCALES: LocaleMeta[] = [
  { code: "en", label: "English", dir: "ltr" }, { code: "ar", label: "العربية", dir: "rtl" }, { code: "es", label: "Español", dir: "ltr" }, { code: "zh-CN", label: "中文", dir: "ltr" }, { code: "hi", label: "हिन्दी", dir: "ltr" }, { code: "pt", label: "Português", dir: "ltr" }, { code: "fr", label: "Français", dir: "ltr" }, { code: "de", label: "Deutsch", dir: "ltr" }, { code: "ja", label: "日本語", dir: "ltr" }, { code: "ko", label: "한국어", dir: "ltr" }, { code: "tr", label: "Türkçe", dir: "ltr" }, { code: "it", label: "Italiano", dir: "ltr" }, { code: "vi", label: "Tiếng Việt", dir: "ltr" }, { code: "id", label: "Bahasa Indonesia", dir: "ltr" }, { code: "th", label: "ไทย", dir: "ltr" }, { code: "pl", label: "Polski", dir: "ltr" }, { code: "nl", label: "Nederlands", dir: "ltr" }, { code: "sv", label: "Svenska", dir: "ltr" }, { code: "uk", label: "Українська", dir: "ltr" }, { code: "ro", label: "Română", dir: "ltr" }, { code: "el", label: "Ελληνικά", dir: "ltr" }, { code: "cs", label: "Čeština", dir: "ltr" }, { code: "he", label: "עברית", dir: "rtl" }, { code: "bn", label: "বাংলা", dir: "ltr" }, { code: "fa", label: "فارسی", dir: "rtl" }, { code: "ru", label: "Русский", dir: "ltr" }, { code: "ms", label: "Bahasa Melayu", dir: "ltr" },
];

export const DEFAULT_LOCALE: LocaleCode = "en";
export const LOCALE_STORAGE_KEY = "flixo-lang";
const LOCALE_CODES = new Set<string>(LOCALES.map((l) => l.code));
export const STRICT_DICTIONARY_LOCALES = new Set<LocaleCode>(LOCALES.filter((l) => l.code !== "en").map((l) => l.code));

const LOCALE_LOADERS: Record<Exclude<LocaleCode, "en">, () => Promise<Partial<Dictionary>>> = {
  ar: () => import("./locales/ar").then(({ ar }) => ar), es: () => import("./locales/es").then(({ es }) => es), fr: () => import("./locales/fr").then(({ fr }) => fr), de: () => import("./locales/de").then(({ de }) => de), pt: () => import("./locales/pt").then(({ pt }) => pt), it: () => import("./locales/it").then(({ it }) => it), nl: () => import("./locales/nl").then(({ nl }) => nl), sv: () => import("./locales/sv").then(({ sv }) => sv), pl: () => import("./locales/pl").then(({ pl }) => pl), tr: () => import("./locales/tr").then(({ tr }) => tr), ro: () => import("./locales/ro").then(({ ro }) => ro), cs: () => import("./locales/cs").then(({ cs }) => cs), uk: () => import("./locales/uk").then(({ uk }) => uk), el: () => import("./locales/el").then(({ el }) => el), he: () => import("./locales/he").then(({ he }) => he), fa: () => import("./locales/fa").then(({ fa }) => fa), ru: () => import("./locales/ru").then(({ ru }) => ru), ms: () => import("./locales/ms").then(({ ms }) => ms), "zh-CN": () => import("./locales/zh-CN").then(({ zhCN }) => zhCN), ja: () => import("./locales/ja").then(({ ja }) => ja), ko: () => import("./locales/ko").then(({ ko }) => ko), hi: () => import("./locales/hi").then(({ hi }) => hi), bn: () => import("./locales/bn").then(({ bn }) => bn), th: () => import("./locales/th").then(({ th }) => th), vi: () => import("./locales/vi").then(({ vi }) => vi), id: () => import("./locales/id").then(({ id }) => id),
};

export function localeMeta(code: LocaleCode): LocaleMeta { return LOCALES.find((l) => l.code === code) ?? LOCALES[0]; }
export function isSupportedLocale(code: string | undefined | null): code is LocaleCode { return typeof code === "string" && LOCALE_CODES.has(code); }
export function localeFromPathname(pathname: string): LocaleCode { if (!pathname || pathname === "/") return DEFAULT_LOCALE; const candidate = pathname.split("/").filter(Boolean)[0]; return isSupportedLocale(candidate) && candidate !== DEFAULT_LOCALE ? candidate : DEFAULT_LOCALE; }

type Vars = Record<string, string | number>;
interface I18nValue { locale: LocaleCode; dir: Direction; setLocale: (code: LocaleCode) => void; t: (key: TranslationKey, vars?: Vars) => string; }
const I18nContext = createContext<I18nValue>({ locale: DEFAULT_LOCALE, dir: "ltr", setLocale: () => {}, t: (key) => en[key] ?? key });
function interpolate(template: string, vars?: Vars) { return !vars ? template : template.replace(/\{(\w+)\}/g, (match, name: string) => name in vars ? String(vars[name]) : match); }
function translateFromDictionary(locale: LocaleCode, dict: Dictionary, key: TranslationKey, vars?: Vars): string { const localized = dict[key]; if (localized !== undefined && localized !== "") return interpolate(localized, vars); if (STRICT_DICTIONARY_LOCALES.has(locale)) { const message = `[${locale}] Missing translation key: ${String(key)}`; if (import.meta.env?.DEV) console.error(message); return `[Missing translation: ${String(key)}]`; } return interpolate(en[key] ?? key, vars); }
function loadedDictionary(module: Partial<Dictionary>): Dictionary { return module as Dictionary; }

function useDictionaries(locale: LocaleCode) {
  const [dictionaries, setDictionaries] = useState<Record<string, Dictionary>>({ en });
  useEffect(() => {
    if (locale === "en" || dictionaries[locale]) return;
    let active = true;
    const loader = LOCALE_LOADERS[locale as Exclude<LocaleCode, "en">];
    if (!loader) return;
    void loader().then((module) => { if (active) setDictionaries((current) => ({ ...current, [locale]: loadedDictionary(module) })); });
    return () => { active = false; };
  }, [locale, dictionaries]);
  return dictionaries[locale] ?? en;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  useEffect(() => { let next: LocaleCode | null = null; try { const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as LocaleCode | null; if (stored && LOCALES.some((l) => l.code === stored)) next = stored; } catch (cause) { if (import.meta.env?.DEV) console.debug("Could not read saved locale", cause); } if (!next) next = detectBrowserLocale(); if (next && next !== DEFAULT_LOCALE) setLocaleState(next); }, []);
  const dir = localeMeta(locale).dir;
  const dict = useDictionaries(locale);
  useEffect(() => { document.documentElement.setAttribute("lang", locale); document.documentElement.setAttribute("dir", dir); }, [locale, dir]);
  const setLocale = useCallback((code: LocaleCode) => { setLocaleState(code); try { localStorage.setItem(LOCALE_STORAGE_KEY, code); } catch (cause) { if (import.meta.env?.DEV) console.debug("Could not save locale", cause); } }, []);
  const value = useMemo<I18nValue>(() => ({ locale, dir, setLocale, t: (key, vars) => translateFromDictionary(locale, dict, key, vars) }), [locale, dir, setLocale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function detectBrowserLocale(): LocaleCode | null { if (typeof navigator === "undefined") return null; const candidates = navigator.languages?.length ? navigator.languages : [navigator.language]; for (const raw of candidates) { if (!raw) continue; const normalized = raw.toLowerCase(); const exact = LOCALES.find((l) => l.code.toLowerCase() === normalized); if (exact) return exact.code; const primary = normalized.split("-")[0]; const prefix = LOCALES.find((l) => l.code.toLowerCase() === primary); if (prefix) return prefix.code; } return null; }

export function LocalI18nProvider({ locale, children }: { locale: LocaleCode; children: ReactNode }) {
  const parent = useI18n();
  const dir = localeMeta(locale).dir;
  const dict = useDictionaries(locale);
  useEffect(() => { if (typeof document !== "undefined") { document.documentElement.setAttribute("lang", locale); document.documentElement.setAttribute("dir", dir); } }, [locale, dir]);
  const value = useMemo<I18nValue>(() => ({ locale, dir, setLocale: parent.setLocale, t: (key, vars) => translateFromDictionary(locale, dict, key, vars) }), [locale, dir, parent.setLocale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
export type { TranslationKey };