import { ArchiveExtractorRuntime } from "./tools/archive-extractor";
import { FileSplitterRuntime } from "./tools/file-splitter";
import { MetadataViewerRuntime } from "./tools/metadata-viewer";
import { ZipCreatorRuntime } from "./tools/zip-creator";
import type { ReadyToolRuntimeDefinition } from "./types";

/**
 * Public desktop/file runtime registry.
 *
 * This is the only runtime registry exposed to public routes. Legacy runtimes
 * remain in the repository but are not public until explicitly promoted here.
 */
export const readyToolRuntimes = [
  ZipCreatorRuntime,
  ArchiveExtractorRuntime,
  FileSplitterRuntime,
  MetadataViewerRuntime,
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
