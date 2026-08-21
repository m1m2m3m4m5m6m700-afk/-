import { getReadyToolConfigs } from "@/config/tools";
import { getPublicToolRegistration } from "@/lib/tool-platform/publicDesktopTools";
import { assertPublicRegistration } from "@/lib/tool-platform/promotion";
import { toolConfigToRuntime } from "./adapters";
import type { ReadyToolRuntimeDefinition } from "./types";

/** Compatibility adapter: the canonical tool definitions now live in @/config/tools. */
export const readyToolRuntimes: readonly ReadyToolRuntimeDefinition[] = Object.freeze(
  getReadyToolConfigs().map(toolConfigToRuntime),
);

for (const runtime of readyToolRuntimes) {
  const registration = getPublicToolRegistration(runtime.toolId);
  if (!registration) {
    throw new Error(`Missing public Tool Platform registration: ${runtime.toolId}`);
  }
  assertPublicRegistration(registration);
  if (registration.manifest.slug !== runtime.slug) {
    throw new Error(`Runtime slug mismatch for ${runtime.toolId}`);
  }
  if (registration.manifest.category !== runtime.categoryId) {
    throw new Error(`Runtime category mismatch for ${runtime.toolId}`);
  }
}

export type PublicToolSlug = (typeof readyToolRuntimes)[number]["slug"];

export const readyToolRuntimeBySlug = new Map<string, ReadyToolRuntimeDefinition>(
  readyToolRuntimes.map((runtime) => [runtime.slug, runtime]),
);

export const getReadyToolRuntime = (slug: string): ReadyToolRuntimeDefinition | undefined =>
  readyToolRuntimeBySlug.get(slug);

export const getReadyTools = (): readonly ReadyToolRuntimeDefinition[] => readyToolRuntimes;

export const VERIFIED_TOOL_SLUGS = Object.freeze(
  readyToolRuntimes.map((runtime) => runtime.slug),
);
