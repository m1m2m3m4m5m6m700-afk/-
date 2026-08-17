import type { CategoryId } from "@/data/categories";
import type { ReadyToolRuntimeDefinition } from "./types";

/**
 * Public runtime registry.
 *
 * CLEAN BASELINE: no legacy tool is public. Existing runtime files remain in
 * the repository unchanged and can be promoted one-by-one after passing the
 * desktop-tool contract and browser regression test.
 */
export const readyToolRuntimes = [] as const satisfies readonly ReadyToolRuntimeDefinition[];

export type PublicToolSlug = never;

export const readyToolRuntimeBySlug = new Map<string, ReadyToolRuntimeDefinition>();

export const getReadyToolRuntime = (slug: string): ReadyToolRuntimeDefinition | undefined =>
  readyToolRuntimeBySlug.get(slug);

export const VERIFIED_TOOL_SLUGS = Object.freeze([] as string[]);

export const hasPublicToolsInCategory = (categoryId: CategoryId): boolean =>
  readyToolRuntimes.some((runtime) => runtime.categoryId === categoryId);
