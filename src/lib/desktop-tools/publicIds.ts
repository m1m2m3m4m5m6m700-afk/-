/**
 * Single source of truth for the public desktop/file tool surface.
 *
 * A tool is public only when its runtime is promoted in readyTools.ts and its
 * dedicated desktop browser regression is green.
 */
export const PUBLIC_DESKTOP_TOOL_IDS = Object.freeze([
  "zip-creator",
  "archive-extractor",
  "file-splitter",
  "metadata-viewer",
] as const);

export type PublicDesktopToolId = (typeof PUBLIC_DESKTOP_TOOL_IDS)[number];

export const isPublicDesktopToolId = (id: string): id is PublicDesktopToolId =>
  (PUBLIC_DESKTOP_TOOL_IDS as readonly string[]).includes(id);
