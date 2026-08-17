import type { CategoryId } from "@/data/categories";
import type { ReadyToolRuntimeDefinition } from "./types";
import { publicToolRegistrations } from "@/lib/tool-platform/public-registry";

/**
 * Compatibility adapter only.
 *
 * The Tool Platform public registry is the single source of truth. This file
 * exists so existing route code can continue using the legacy runtime shape
 * while the platform migration proceeds without touching legacy tools.
 */
export const readyToolRuntimes = publicToolRegistrations.map(({ manifest, runtime }) => ({
  toolId: manifest.id as ReadyToolRuntimeDefinition["toolId"],
  slug: manifest.slug,
  categoryId: manifest.category as CategoryId,
  icon: runtime.icon,
  component: runtime.component,
  layoutDescription: runtime.layoutDescription,
  seoOverride: runtime.seoOverride,
})) satisfies readonly ReadyToolRuntimeDefinition[];

export type PublicToolSlug = (typeof readyToolRuntimes)[number]["slug"];

export const readyToolRuntimeBySlug = new Map<string, ReadyToolRuntimeDefinition>(
  readyToolRuntimes.map((runtime) => [runtime.slug, runtime]),
);

export const getReadyToolRuntime = (slug: string): ReadyToolRuntimeDefinition | undefined =>
  readyToolRuntimeBySlug.get(slug);

export const VERIFIED_TOOL_SLUGS = Object.freeze(
  readyToolRuntimes.map((runtime) => runtime.slug),
);

export const hasPublicToolsInCategory = (categoryId: CategoryId): boolean =>
  readyToolRuntimes.some((runtime) => runtime.categoryId === categoryId);
