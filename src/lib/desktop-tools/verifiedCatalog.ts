import type { Tool } from "@/data/tools";

/** Publicly promoted desktop tools only. Legacy tools remain preserved but unpromoted. */
export const verifiedDesktopTools: Tool[] = [];

export const verifiedDesktopToolById = new Map<string, Tool>();
export const verifiedDesktopToolBySlug = new Map<string, Tool>();

export function getVerifiedDesktopTool(slugOrId: string): Tool | undefined {
  return verifiedDesktopToolBySlug.get(slugOrId) ?? verifiedDesktopToolById.get(slugOrId);
}
