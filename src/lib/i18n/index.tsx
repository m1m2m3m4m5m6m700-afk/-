import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ar } from "./locales/ar";
import { bn } from "./locales/bn";
import { cs } from "./locales/cs";
import { de } from "./locales/de";
import { el } from "./locales/el";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { fa } from "./locales/fa";
import { fr } from "./locales/fr";
import { he } from "./locales/he";
import { hi } from "./locales/hi";
import { id } from "./locales/id";
import { it } from "./locales/it";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { ms } from "./locales/ms";
import { nl } from "./locales/nl";
import { pl } from "./locales/pl";
import { pt } from "./locales/pt";
import { ro } from "./locales/ro";
import { ru } from "./locales/ru";
import { sv } from "./locales/sv";
import { th } from "./locales/th";
import { tr } from "./locales/tr";
import { uk } from "./locales/uk";
import { vi } from "./locales/vi";
import { zhCN } from "./locales/zh-CN";

export type LocaleCode = "en" | "ar" | "es" | "fr" | "de" | "pt" | "it" | "nl" | "pl" | "sv" | "tr" | "ro" | "uk" | "ru" | "ms" | "id" | "vi" | "zh-CN" | "ja" | "ko" | "el" | "cs" | "th" | "hi" | "he" | "fa" | "bn";
export type Dictionary = typeof en;

export const LOCALES: Array<{ code: LocaleCode; nativeName: string; dir: "ltr" | "rtl" }> = [
  { code: "en", nativeName: "English", dir: "ltr" }, { code: "ar", nativeName: "العربية", dir: "rtl" }, { code: "es", nativeName: "Español", dir: "ltr" }, { code: "fr", nativeName: "Français", dir: "ltr" }, { code: "de", nativeName: "Deutsch", dir: "ltr" }, { code: "pt", nativeName: "Português", dir: "ltr" }, { code: "it", nativeName: "Italiano", dir: "ltr" }, { code: "nl", nativeName: "Nederlands", dir: "ltr" }, { code: "pl", nativeName: "Polski", dir: "ltr" }, { code: "sv", nativeName: "Svenska", dir: "ltr" }, { code: "tr", nativeName: "Türkçe", dir: "ltr" }, { code: "ro", nativeName: "Română", dir: "ltr" }, { code: "uk", nativeName: "Українська", dir: "ltr" }, { code: "ru", nativeName: "Русский", dir: "ltr" }, { code: "ms", nativeName: "Bahasa Melayu", dir: "ltr" }, { code: "id", nativeName: "Bahasa Indonesia", dir: "ltr" }, { code: "vi", nativeName: "Tiếng Việt", dir: "ltr" }, { code: "zh-CN", nativeName: "简体中文", dir: "ltr" }, { code: "ja", nativeName: "日本語", dir: "ltr" }, { code: "ko", nativeName: "한국어", dir: "ltr" }, { code: "el", nativeName: "Ελληνικά", dir: "ltr" }, { code: "cs", nativeName: "Čeština", dir: "ltr" }, { code: "th", nativeName: "ไทย", dir: "ltr" }, { code: "hi", nativeName: "हिन्दी", dir: "ltr" }, { code: "he", nativeName: "עברית", dir: "rtl" }, { code: "fa", nativeName: "فارسی", dir: "rtl" }, { code: "bn", nativeName: "বাংলা", dir: "ltr" },
];

export const DICTIONARIES: Record<LocaleCode, Dictionary> = { en, ar, es, fr, de, pt, it, nl, pl, sv, tr, ro, uk, ru, ms, id, vi, "zh-CN": zhCN, ja, ko, el, cs, th, hi, he, fa, bn } as Record<LocaleCode, Dictionary>;
export const DEFAULT_LOCALE: LocaleCode = "en";
const LOCALE_STORAGE_KEY = "flixo_locale";
export const STRICT_DICTIONARY_LOCALES = new Set<LocaleCode>(LOCALES.filter(({ code }) => code !== "en").map(({ code }) => code));

export const localeMeta = (locale: LocaleCode) => LOCALES.find((item) => item.code === locale) ?? LOCALES[0];
export const isSupportedLocale = (value: string | undefined): value is LocaleCode => LOCALES.some(({ code }) => code === value);

function interpolate(value: string, vars?: Record<string, string | number>) {
  if (!vars) return value;
  return Object.entries(vars).reduce((result, [key, replacement]) => result.replace(new RegExp(`\\{${key}\\}`, "g"), String(replacement)), value);
}

function translateFromDictionary(locale: LocaleCode, dictionary: Dictionary, key: keyof Dictionary, vars?: Record<string, string | number>) {
  const value = dictionary[key];
  if (typeof value === "string") return interpolate(value, vars);
  if (STRICT_DICTIONARY_LOCALES.has(locale)) {
    const message = `[${locale}] Missing translation key: ${String(key)}`;
    if (import.meta.env?.DEV) console.error(message);
    return `[Missing translation: ${String(key)}]`;
  }
  return interpolate(en[key] ?? key, vars);
}

type I18nValue = { locale: LocaleCode; dir: "ltr" | "rtl"; setLocale: (code: LocaleCode) => void; t: (key: keyof Dictionary, vars?: Record<string, string | number>) => string };
const I18nContext = createContext<I18nValue | null>(null);

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within I18nProvider");
  return value;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  useEffect(() => {
    let next: LocaleCode | null = null;
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as LocaleCode | null;
      if (stored && LOCALES.some((l) => l.code === stored)) next = stored;
    } catch (cause) {
      if (import.meta.env?.DEV) console.debug("Could not read saved locale", cause);
    }
    if (!next) next = detectBrowserLocale();
    if (next && next !== DEFAULT_LOCALE) setLocaleState(next);
  }, []);
  const dir = localeMeta(locale).dir;
  useEffect(() => { document.documentElement.setAttribute("lang", locale); document.documentElement.setAttribute("dir", dir); }, [locale, dir]);
  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, code);
    } catch (cause) {
      if (import.meta.env?.DEV) console.debug("Could not save locale", cause);
    }
  }, []);
  const value = useMemo<I18nValue>(() => {
    const dict = DICTIONARIES[locale];
    return { locale, dir, setLocale, t: (key, vars) => translateFromDictionary(locale, dict, key, vars) };
  }, [locale, dir, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function detectBrowserLocale(): LocaleCode | null {
  if (typeof navigator === "undefined") return null;
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    const exact = candidate as LocaleCode;
    if (isSupportedLocale(exact)) return exact;
    const base = candidate.split("-")[0] as LocaleCode;
    if (isSupportedLocale(base)) return base;
  }
  return null;
}

export function LocalI18nProvider({ locale, children }: { locale: LocaleCode; children: ReactNode }) {
  const dict = DICTIONARIES[locale];
  const dir = localeMeta(locale).dir;
  useEffect(() => { document.documentElement.setAttribute("lang", locale); document.documentElement.setAttribute("dir", dir); }, [locale, dir]);
  const setLocale = useCallback(() => undefined, []);
  const value = useMemo<I18nValue>(() => ({ locale, dir, setLocale, t: (key, vars) => translateFromDictionary(locale, dict, key, vars) }), [locale, dir, setLocale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
