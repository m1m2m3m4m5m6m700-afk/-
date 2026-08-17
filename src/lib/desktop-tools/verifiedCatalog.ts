import type { Tool } from "@/data/tools";

/**
 * Verified desktop/file tools that extend the legacy catalog without editing
 * the large generated tools.ts file. Entries are public only when a real
 * runtime is registered and covered by browser verification.
 */
export const verifiedDesktopTools: Tool[] = [];

export const verifiedDesktopToolById = new Map<string, Tool>();
export const verifiedDesktopToolBySlug = new Map<string, Tool>();

export function getVerifiedDesktopTool(slugOrId: string): Tool | undefined {
  return verifiedDesktopToolBySlug.get(slugOrId) ?? verifiedDesktopToolById.get(slugOrId);
}
