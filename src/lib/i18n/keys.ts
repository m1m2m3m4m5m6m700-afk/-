import type { CategoryId } from "@/data/categories";
import { getCategory } from "@/data/categories";
import { getTool } from "@/data/tools";
import type { TranslationKey } from "./locales/en";

/** Translation-key helpers for labels backed by the canonical data registry. */
export const toolNameKey = (slug: string) => `tool.${slug}.name` as TranslationKey;
export const toolTaglineKey = (slug: string) => `tool.${slug}.tagline` as TranslationKey;
export const categoryNameKey = (id: CategoryId) => `category.${id}.name` as TranslationKey;
export const categoryBlurbKey = (id: CategoryId) => `category.${id}.blurb` as TranslationKey;
export const categoryToolsKey = (id: CategoryId) => `category.${id}.tools` as TranslationKey;

/**
 * Resolve a tool's display name. Most tools ship a `tool.<slug>.name`
 * translation entry, but when one is absent `t()` returns the raw key. Fall
 * back to the tool's canonical registry name so the H1/breadcrumb never render
 * a literal key like `tool.json-formatter.name`.
 */
export function resolveToolName(
  toolId: string,
  translate: (key: TranslationKey) => string,
): string {
  const key = toolNameKey(toolId);
  const value = translate(key);
  if (value && value !== key) return value;
  return getTool(toolId)?.name ?? toolId;
}

/**
 * Resolve a category's display name, falling back to the canonical registry
 * name when no `category.<id>.name` translation entry exists (same guard as
 * `resolveToolName`).
 */
export function resolveCategoryName(
  categoryId: CategoryId,
  translate: (key: TranslationKey) => string,
): string {
  const key = categoryNameKey(categoryId);
  const value = translate(key);
  if (value && value !== key) return value;
  return getCategory(categoryId)?.name ?? categoryId;
}
