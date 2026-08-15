import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Dictionary, type TranslationKey } from "./locales/en";
export type { Dictionary };
import { ar } from "./locales/ar";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { de } from "./locales/de";
import { pt } from "./locales/pt";
import { it } from "./locales/it";
import { nl } from "./locales/nl";
import { sv } from "./locales/sv";
import { pl } from "./locales/pl";
import { tr } from "./locales/tr";
import { ro } from "./locales/ro";
import { cs } from "./locales/cs";
import { uk } from "./locales/uk";
import { el } from "./locales/el";
import { he } from "./locales/he";
import { fa } from "./locales/fa";
import { ru } from "./locales/ru";
import { ms } from "./locales/ms";
import { zhCN } from "./locales/zh-CN";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { hi } from "./locales/hi";
import { bn } from "./locales/bn";
import { th } from "./locales/th";
import { vi } from "./locales/vi";
import { id } from "./locales/id";

export type LocaleCode = "en" | "ar" | "es" | "zh-CN" | "hi" | "pt" | "fr" | "de" | "ja" | "ko" | "tr" | "it" | "vi" | "id" | "th" | "pl" | "nl" | "sv" | "uk" | "ro" | "el" | "cs" | "he" | "bn" | "fa" | "ru" | "ms";
export type Direction = "ltr" | "rtl";
export interface LocaleMeta { code: LocaleCode; label: string; dir: Direction; }

export const LOCALES: LocaleMeta[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "zh-CN", label: "中文", dir: "ltr" },
  { code: "hi", label: "हिन्दी", dir: "ltr" },
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "ja", label: "日本語", dir: "ltr" },
  { code: "ko", label: "한국어", dir: "ltr" },
  { code: "tr", label: "Türkçe", dir: "ltr" },
  { code: "it", label: "Italiano", dir: "ltr" },
  { code: "vi", label: "Tiếng Việt", dir: "ltr" },
  { code: "id", label: "Bahasa Indonesia", dir: "ltr" },
  { code: "th", label: "ไทย", dir: "ltr" },
  { code: "pl", label: "Polski", dir: "ltr" },
  { code: "nl", label: "Nederlands", dir: "ltr" },
  { code: "sv", label: "Svenska", dir: "ltr" },
  { code: "uk", label: "Українська", dir: "ltr" },
  { code: "ro", label: "Română", dir: "ltr" },
  { code: "el", label: "Ελληνικά", dir: "ltr" },
  { code: "cs", label: "Čeština", dir: "ltr" },
  { code: "he", label: "עברית", dir: "rtl" },
  { code: "bn", label: "বাংলা", dir: "ltr" },
  { code: "fa", label: "فارسی", dir: "rtl" },
  { code: "ru", label: "Русский", dir: "ltr" },
  { code: "ms", label: "Bahasa Melayu", dir: "ltr" },
];

const DICTIONARIES: Record<LocaleCode, Dictionary> = { en, ar, es, "zh-CN": zhCN, hi, pt, fr, de, ja, ko, tr, it, vi, id, th, pl, nl, sv, uk, ro, el, cs, he, bn, fa, ru, ms };
export const DEFAULT_LOCALE: LocaleCode = "en";
export const LOCALE_STORAGE_KEY = "flixo-lang";
const LOCALE_CODES = new Set<string>(LOCALES.map((l) => l.code));

/**
 * Multilingual is a production invariant: every non-English locale must have
 * an explicit value for every key in the English master dictionary. English is
 * the only locale allowed to be a source-of-truth fallback.
 */
const STRICT_DICTIONARY_LOCALES = new Set<LocaleCode>(LOCALES.filter((l) => l.code !== "en").map((l) => l.code));

export function localeMeta(code: LocaleCode): LocaleMeta { return LOCALES.find((l) => l.code === code) ?? LOCALES[0]; }
export function isSupportedLocale(code: string | undefined | null): code is LocaleCode { return typeof code === "string" && LOCALE_CODES.has(code); }
export function localeFromPathname(pathname: string): LocaleCode {
  if (!pathname || pathname === "/") return DEFAULT_LOCALE;
  const candidate = pathname.split("/").filter(Boolean)[0];
  return isSupportedLocale(candidate) && candidate !== DEFAULT_LOCALE ? candidate : DEFAULT_LOCALE;
}

type Vars = Record<string, string | number>;
interface I18nValue { locale: LocaleCode; dir: Direction; setLocale: (code: LocaleCode) => void; t: (key: TranslationKey, vars?: Vars) => string; }
const I18nContext = createContext<I18nValue>({ locale: DEFAULT_LOCALE, dir: "ltr", setLocale: () => {}, t: (key) => en[key] ?? key });
function interpolate(template: string, vars?: Vars) { return !vars ? template : template.replace(/\{(\w+)\}/g, (match, name: string) => name in vars ? String(vars[name]) : match); }
function detectBrowserLocale(): LocaleCode | null {
  if (typeof navigator === "undefined") return null;
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const raw of candidates) {
    if (!raw) continue;
    const normalized = raw.toLowerCase();
    const exact = LOCALES.find((l) => l.code.toLowerCase() === normalized);
    if (exact) return exact.code;
    const primary = normalized.split("-")[0];
    const prefix = LOCALES.find((l) => l.code.toLowerCase() === primary);
    if (prefix) return prefix.code;
  }
  return null;
}
function translateFromDictionary(locale: LocaleCode, dict: Dictionary, key: TranslationKey, vars?: Vars): string {
  const localized = dict[key];
  if (localized !== undefined && localized !== "") return interpolate(localized, vars);
  if (STRICT_DICTIONARY_LOCALES.has(locale)) {
    const message = `[${locale}] Missing translation key: ${String(key)}`;
    if (import.meta.env?.DEV) console.error(message);
    return `[Missing translation: ${String(key)}]`;
  }
  return interpolate(en[key] ?? key, vars);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  useEffect(() => {
    let next: LocaleCode | null = null;
    try { const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as LocaleCode | null; if (stored && LOCALES.some((l) => l.code === stored)) next = stored; } catch {}
    if (!next) next = detectBrowserLocale();
    if (next && next !== DEFAULT_LOCALE) setLocaleState(next);
  }, []);
  const dir = localeMeta(locale).dir;
  useEffect(() => { document.documentElement.setAttribute("lang", locale); document.documentElement.setAttribute("dir", dir); }, [locale, dir]);
  const setLocale = useCallback((code: LocaleCode) => { setLocaleState(code); try { localStorage.setItem(LOCALE_STORAGE_KEY, code); } catch {} }, []);
  const value = useMemo<I18nValue>(() => { const dict = DICTIONARIES[locale]; return { locale, dir, setLocale, t: (key, vars) => translateFromDictionary(locale, dict, key, vars) }; }, [locale, dir, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function LocalI18nProvider({ locale, children }: { locale: LocaleCode; children: ReactNode }) {
  const parent = useI18n();
  const dir = localeMeta(locale).dir;
  useEffect(() => { if (typeof document !== "undefined") { document.documentElement.setAttribute("lang", locale); document.documentElement.setAttribute("dir", dir); } }, [locale, dir]);
  const value = useMemo<I18nValue>(() => { const dict = DICTIONARIES[locale]; return { locale, dir, setLocale: parent.setLocale, t: (key, vars) => translateFromDictionary(locale, dict, key, vars) }; }, [locale, dir, parent.setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
export type { TranslationKey };