import { ArchiveExtractorRuntime } from "./tools/archive-extractor";
import { FileSplitterRuntime } from "./tools/file-splitter";
import { MetadataViewerRuntime } from "./tools/metadata-viewer";
import { ZipCreatorRuntime } from "./tools/zip-creator";
import type { ReadyToolRuntimeDefinition } from "./types";

/**
 * Public desktop/file tool registry.
 *
 * Only browser-local desktop tools are published in this phase.
 * A runtime becomes public only after its dedicated regression test passes.
 * Legacy runtimes remain isolated until explicitly promoted.
 */
export const readyToolRuntimes = [
  ZipCreatorRuntime,
  ArchiveExtractorRuntime,
  FileSplitterRuntime,
  MetadataViewerRuntime,
] as const satisfies readonly ReadyToolRuntimeDefinition[];

export const readyToolRuntimeBySlug = new Map<string, ReadyToolRuntimeDefinition>(
  readyToolRuntimes.map((runtime) => [runtime.slug, runtime]),
);

export const getReadyToolRuntime = (slug: string): ReadyToolRuntimeDefinition | undefined =>
  readyToolRuntimeBySlug.get(slug);

export const VERIFIED_TOOL_SLUGS = Object.freeze(
  readyToolRuntimes.map((runtime) => runtime.slug),
);
