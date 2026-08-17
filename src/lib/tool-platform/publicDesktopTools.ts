import type { PublicToolRegistration } from "./types";

const publicDesktopTools: readonly PublicToolRegistration[] = [
  {
    manifest: {
      id: "zip-creator",
      slug: "zip-creator",
      name: "ZIP Creator",
      category: "files",
      description: "Create a standard ZIP archive from multiple local files in your browser.",
      lifecycle: "public",
      capabilities: { input: "files", output: "download", localOnly: true },
    },
    test: {
      toolId: "zip-creator",
      route: "/tools/zip-creator",
      requiredChecks: ["render", "interaction", "output"],
    },
  },
  {
    manifest: {
      id: "archive-extractor",
      slug: "archive-extractor",
      name: "Archive Extractor",
      category: "files",
      description: "Open ZIP archives and extract individual files directly in the browser.",
      lifecycle: "public",
      capabilities: { input: "file", output: "download", localOnly: true },
    },
    test: {
      toolId: "archive-extractor",
      route: "/tools/archive-extractor",
      requiredChecks: ["render", "interaction", "output"],
    },
  },
  {
    manifest: {
      id: "file-splitter",
      slug: "file-splitter",
      name: "File Splitter",
      category: "files",
      description: "Split large local files into numbered chunks and download them as a ZIP archive.",
      lifecycle: "public",
      capabilities: { input: "file", output: "download", localOnly: true },
    },
    test: {
      toolId: "file-splitter",
      route: "/tools/file-splitter",
      requiredChecks: ["render", "interaction", "output"],
    },
  },
  {
    manifest: {
      id: "metadata-viewer",
      slug: "metadata-viewer",
      name: "Metadata Viewer",
      category: "files",
      description: "Inspect basic local file metadata without uploading the file to a server.",
      lifecycle: "public",
      capabilities: { input: "file", output: "preview", localOnly: true },
    },
    test: {
      toolId: "metadata-viewer",
      route: "/tools/metadata-viewer",
      requiredChecks: ["render", "interaction", "output"],
    },
  },
];

export const publicToolRegistrations = Object.freeze(publicDesktopTools);

export const getPublicToolRegistration = (toolId: string): PublicToolRegistration | undefined =>
  publicToolRegistrations.find((entry) => entry.manifest.id === toolId);
