export interface DeprecatedMegaTool {
  readonly slug: string;
  readonly category: "images" | "video" | "audio" | "pdf";
  readonly removedAt: string;
  readonly reason: string;
  readonly pr: number;
}

export const DEPRECATED_MEGA_TOOLS: readonly DeprecatedMegaTool[] = [
  {
    slug: "mega-video-inspect-quick",
    category: "video",
    removedAt: "2026-08-17",
    reason: "Failed repeated strict Chromium operational runs; video metadata loading was not reliable in the CI environment.",
    pr: 63,
  },
  {
    slug: "mega-video-frame-75-quick",
    category: "video",
    removedAt: "2026-08-17",
    reason: "Failed repeated strict Chromium operational runs; frame extraction did not complete reliably in the CI environment.",
    pr: 63,
  },
  {
    slug: "mega-video-inspect-small",
    category: "video",
    removedAt: "2026-08-17",
    reason: "Failed repeated strict Chromium operational runs; video metadata loading was not reliable in the CI environment.",
    pr: 63,
  },
  {
    slug: "mega-video-frame-75-medium",
    category: "video",
    removedAt: "2026-08-17",
    reason: "Failed repeated strict Chromium operational runs; frame extraction did not complete reliably in the CI environment.",
    pr: 63,
  },
] as const;

export const DEPRECATED_MEGA_TOOL_SLUGS = new Set(
  DEPRECATED_MEGA_TOOLS.map((tool) => tool.slug),
);
