import type { TranslationKey } from "./locales/en";
import type { LocaleCode } from "./index";

/** Translation-key helpers for labels backed by canonical tool/platform identifiers. */
export const toolNameKey = (slug: string) => `tool.${slug}.name` as TranslationKey;
export const toolTaglineKey = (slug: string) => `tool.${slug}.tagline` as TranslationKey;
export const categoryNameKey = (id: string) => `category.${id}.name` as TranslationKey;
export const categoryBlurbKey = (id: string) => `category.${id}.blurb` as TranslationKey;
export const categoryToolsKey = (id: string) => `category.${id}.tools` as TranslationKey;

export function resolveToolName(
  toolId: string,
  translate: (key: TranslationKey) => string,
  locale: LocaleCode = "en",
): string {
  const key = toolNameKey(toolId);
  const value = translate(key);
  if (value && value !== key && !value.startsWith("ترجمة مفقودة:")) return value;
  if (locale === "en") return toolId;
  return `ترجمة مفقودة: ${key}`;
}

export function resolveCategoryName(
  categoryId: string,
  translate: (key: TranslationKey) => string,
  locale: LocaleCode = "en",
): string {
  const key = categoryNameKey(categoryId);
  const value = translate(key);
  if (value && value !== key && !value.startsWith("ترجمة مفقودة:")) return value;
  if (locale === "en") return categoryId;
  return `ترجمة مفقودة: ${key}`;
}
