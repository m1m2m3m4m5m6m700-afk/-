import type { Tool } from "@/data/tools";

/** Publicly promoted desktop tools only. */
export const verifiedDesktopTools: Tool[] = [
  {
    id: "zip-creator",
    name: "ZIP Creator",
    categoryId: "files",
    description: "Create a ZIP archive from multiple files directly in the browser.",
    status: "ready",
    tags: ["zip", "archive", "files", "compress"],
    slug: "zip-creator",
  },
];

export const verifiedDesktopToolById = new Map(verifiedDesktopTools.map((tool) => [tool.id, tool]));
export const verifiedDesktopToolBySlug = new Map(verifiedDesktopTools.map((tool) => [tool.slug!, tool]));

export function getVerifiedDesktopTool(slugOrId: string): Tool | undefined {
  return verifiedDesktopToolBySlug.get(slugOrId) ?? verifiedDesktopToolById.get(slugOrId);
}
