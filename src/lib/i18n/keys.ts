import type { CategoryId } from "@/data/categories";
import type { TranslationKey } from "./locales/en";
import type { LocaleCode } from "./index";

/** Translation-key helpers for labels backed by the canonical data registry. */
export const toolNameKey = (slug: string) => `tool.${slug}.name` as TranslationKey;
export const toolTaglineKey = (slug: string) => `tool.${slug}.tagline` as TranslationKey;
export const categoryNameKey = (id: CategoryId) => `category.${id}.name` as TranslationKey;
export const categoryBlurbKey = (id: CategoryId) => `category.${id}.blurb` as TranslationKey;
export const categoryToolsKey = (id: CategoryId) => `category.${id}.tools` as TranslationKey;

/**
 * Resolve a localized tool name without silently falling back to the English
 * registry name. The registry is the identifier/source of truth for the tool,
 * but visible copy must come from the active locale dictionary.
 *
 * The caller supplies `locale` so the rule stays explicit at call sites and can
 * later be enforced for every production locale, not just Arabic.
 */
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

/**
 * Resolve a localized category name. As with tools, a non-English locale never
 * falls back to the canonical English registry label.
 */
export function resolveCategoryName(
  categoryId: CategoryId,
  translate: (key: TranslationKey) => string,
  locale: LocaleCode = "en",
): string {
  const key = categoryNameKey(categoryId);
  const value = translate(key);
  if (value && value !== key && !value.startsWith("ترجمة مفقودة:")) return value;
  if (locale === "en") return categoryId;
  return `ترجمة مفقودة: ${key}`;
}
