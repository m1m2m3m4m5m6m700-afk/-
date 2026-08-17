import { ZipCreatorRuntime } from "./tools/zip-creator";
import type { ReadyToolRuntimeDefinition } from "./types";

/**
 * Public runtime registry.
 *
 * Only explicitly promoted tools are public. Legacy runtime files remain in the
 * repository unchanged and are ignored until they are promoted with their own
 * browser regression coverage.
 */
export const readyToolRuntimes = [
  ZipCreatorRuntime,
] as const satisfies readonly ReadyToolRuntimeDefinition[];

export type PublicToolSlug = (typeof readyToolRuntimes)[number]["slug"];

export const readyToolRuntimeBySlug = new Map<string, ReadyToolRuntimeDefinition>(
  readyToolRuntimes.map((runtime) => [runtime.slug, runtime]),
);

export const getReadyToolRuntime = (slug: string): ReadyToolRuntimeDefinition | undefined =>
  readyToolRuntimeBySlug.get(slug);

export const VERIFIED_TOOL_SLUGS = Object.freeze(
  readyToolRuntimes.map((runtime) => runtime.slug),
);

export const hasPublicToolsInCategory = (categoryId: ReadyToolRuntimeDefinition["categoryId"]): boolean =>
  readyToolRuntimes.some((runtime) => runtime.categoryId === categoryId);
