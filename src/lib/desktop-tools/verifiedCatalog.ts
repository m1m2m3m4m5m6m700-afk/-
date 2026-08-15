import type { Tool } from "@/data/tools";

/**
 * Verified desktop/file tools that extend the legacy catalog without editing
 * the large generated tools.ts file. These entries are public only when a real
 * runtime is registered and covered by the desktop browser tests.
 */
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
  {
    id: "archive-extractor",
    name: "Archive Extractor",
    categoryId: "files",
    description: "Open ZIP archives in the browser and extract individual files.",
    status: "ready",
    tags: ["unzip", "zip", "extract", "archive"],
    slug: "archive-extractor",
  },
  {
    id: "file-splitter",
    name: "File Splitter",
    categoryId: "files",
    description: "Split a large file into numbered chunks and download them as a ZIP archive.",
    status: "ready",
    tags: ["split", "file", "chunks", "large file"],
    slug: "file-splitter",
  },
  {
    id: "metadata-viewer",
    name: "File Metadata Viewer",
    categoryId: "files",
    description: "Inspect basic file metadata such as name, size, type, and modified date locally.",
    status: "ready",
    tags: ["metadata", "file", "properties", "details"],
    slug: "metadata-viewer",
  },
];

export const verifiedDesktopToolById = new Map(verifiedDesktopTools.map((tool) => [tool.id, tool]));
export const verifiedDesktopToolBySlug = new Map(verifiedDesktopTools.map((tool) => [tool.slug!, tool]));

export function getVerifiedDesktopTool(slugOrId: string): Tool | undefined {
  return verifiedDesktopToolBySlug.get(slugOrId) ?? verifiedDesktopToolById.get(slugOrId);
}
