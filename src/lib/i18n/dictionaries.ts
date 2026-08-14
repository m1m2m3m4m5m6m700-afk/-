import { en, type Dictionary } from "./locales/en";
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
import { uk } from "./locales/uk";
import { ru } from "./locales/ru";
import { ms } from "./locales/ms";
import { id } from "./locales/id";
import { vi } from "./locales/vi";
import { zhCN } from "./locales/zh-CN";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { el } from "./locales/el";
import { cs } from "./locales/cs";
import { th } from "./locales/th";
import { hi } from "./locales/hi";
import { he } from "./locales/he";
import { fa } from "./locales/fa";
import { bn } from "./locales/bn";

export const DICTIONARIES: Readonly<Record<string, Dictionary>> = Object.freeze({
  en,
  ar,
  es,
  fr,
  de,
  pt,
  it,
  nl,
  sv,
  pl,
  tr,
  ro,
  uk,
  ru,
  ms,
  id,
  vi,
  "zh-CN": zhCN,
  ja,
  ko,
  el,
  cs,
  th,
  hi,
  he,
  fa,
  bn,
});

export function getDictionary(locale: string): Dictionary {
  return DICTIONARIES[locale] ?? en;
}
