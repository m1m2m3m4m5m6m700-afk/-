import { categories, type CategoryId } from "./categories";

/**
 * Legacy catalog status. Public availability is controlled by the verified
 * runtime registry; this type remains for content and SEO consumers.
 */
export type ToolStatus = "placeholder" | "planned" | "ready";

export interface Tool {
  id: string;
  name: string;
  categoryId: CategoryId;
  description: string;
  status: ToolStatus;
  tags?: string[];
  slug?: string;
}

const PUBLIC_READY_TOOLS: readonly Tool[] = [
  {
    id: "zip-creator",
    name: "ZIP Creator",
    categoryId: "files",
    description: "Create a ZIP archive from multiple local files in your browser.",
    status: "ready",
    slug: "zip-creator",
    tags: ["zip", "archive", "files"],
  },
  {
    id: "archive-extractor",
    name: "Archive Extractor",
    categoryId: "files",
    description: "Extract files from ZIP archives directly in the browser.",
    status: "ready",
    slug: "archive-extractor",
    tags: ["zip", "extract", "archive"],
  },
  {
    id: "file-splitter",
    name: "File Splitter",
    categoryId: "files",
    description: "Split large local files into numbered chunks and download them as a ZIP archive.",
    status: "ready",
    slug: "file-splitter",
    tags: ["split", "files", "chunks"],
  },
  {
    id: "metadata-viewer",
    name: "Metadata Viewer",
    categoryId: "files",
    description: "Inspect supported local file metadata without uploading the file.",
    status: "ready",
    slug: "metadata-viewer",
    tags: ["metadata", "files", "inspect"],
  },
];

/**
 * Compatibility catalog consumed by legacy SEO/content pages.
 * It intentionally contains only the verified public-ready tool surface.
 */
export const tools: Tool[] = [...PUBLIC_READY_TOOLS];

export const readyTools = (): Tool[] => [...PUBLIC_READY_TOOLS];

export const toolById = new Map(tools.map((tool) => [tool.id, tool]));
export const toolBySlug = new Map(
  tools.filter((tool) => Boolean(tool.slug)).map((tool) => [tool.slug as string, tool]),
);

export function getTool(id: string): Tool | undefined {
  return toolById.get(id);
}

export function getToolBySlug(slug: string): Tool | undefined {
  return toolBySlug.get(slug);
}

export const getToolsByCategory = (categoryId: CategoryId): Tool[] =>
  tools.filter((tool) => tool.categoryId === categoryId);

/** Keep the module contract explicit for downstream catalog consumers. */
export const categoryCatalog = categories;
