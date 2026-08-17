import type { PublicToolRegistration } from "./types";
import { publicToolTestContracts } from "./testContracts";

const manifestData = [
  {
    id: "zip-creator",
    slug: "zip-creator",
    name: "ZIP Creator",
    category: "files" as const,
    description: "Create a standard ZIP archive from multiple local files in your browser.",
    lifecycle: "public" as const,
    capabilities: { input: "files" as const, output: "download" as const, localOnly: true },
  },
  {
    id: "archive-extractor",
    slug: "archive-extractor",
    name: "Archive Extractor",
    category: "files" as const,
    description: "Open ZIP archives and extract individual files directly in the browser.",
    lifecycle: "public" as const,
    capabilities: { input: "file" as const, output: "download" as const, localOnly: true },
  },
  {
    id: "file-splitter",
    slug: "file-splitter",
    name: "File Splitter",
    category: "files" as const,
    description: "Split large local files into numbered chunks and download them as a ZIP archive.",
    lifecycle: "public" as const,
    capabilities: { input: "file" as const, output: "download" as const, localOnly: true },
  },
  {
    id: "metadata-viewer",
    slug: "metadata-viewer",
    name: "Metadata Viewer",
    category: "files" as const,
    description: "Inspect basic local file metadata without uploading the file to a server.",
    lifecycle: "public" as const,
    capabilities: { input: "file" as const, output: "preview" as const, localOnly: true },
  },
] as const;

export const publicToolRegistrations: readonly PublicToolRegistration[] = Object.freeze(
  manifestData.map((manifest) => {
    const test = publicToolTestContracts.find((entry) => entry.toolId === manifest.id);
    if (!test) throw new Error(`Missing test contract: ${manifest.id}`);
    return Object.freeze({ manifest, test });
  }),
);

export const getPublicToolRegistration = (toolId: string): PublicToolRegistration | undefined =>
  publicToolRegistrations.find((entry) => entry.manifest.id === toolId);

export const getPublicToolRegistrationBySlug = (slug: string): PublicToolRegistration | undefined =>
  publicToolRegistrations.find((entry) => entry.manifest.slug === slug);
