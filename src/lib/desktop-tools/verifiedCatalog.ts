import type { PublicToolRegistration } from "@/lib/tool-platform/types";
import { publicToolRegistrations } from "@/lib/tool-platform/publicDesktopTools";

/**
 * Verified desktop/file tools that are currently public.
 *
 * Tool Platform owns the canonical manifest and lifecycle. This module keeps
 * the historical verified-desktop lookup API without depending on the legacy
 * src/data/tools catalog.
 */
export type VerifiedDesktopTool = PublicToolRegistration["manifest"] & {
  readonly tags?: readonly string[];
};

export const verifiedDesktopTools: readonly VerifiedDesktopTool[] = Object.freeze(
  publicToolRegistrations.map(({ manifest }) => manifest),
);

export const verifiedDesktopToolById = new Map(
  verifiedDesktopTools.map((tool) => [tool.id, tool]),
);

export const verifiedDesktopToolBySlug = new Map(
  verifiedDesktopTools.map((tool) => [tool.slug, tool]),
);

export function getVerifiedDesktopTool(
  slugOrId: string,
): VerifiedDesktopTool | undefined {
  return verifiedDesktopToolBySlug.get(slugOrId) ?? verifiedDesktopToolById.get(slugOrId);
}
