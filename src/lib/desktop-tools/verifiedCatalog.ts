import type { Tool } from "@/data/tools";

/**
 * Verified desktop/file tools that are currently public.
 * Tool Platform is the authoritative public lifecycle; this adapter keeps the
 * legacy catalog consumers aligned with that same public set.
 */
export const verifiedDesktopTools: Tool[] = [
  {
    id: "image-compressor",
    name: "Image Compressor",
    categoryId: "images",
    description: "Compress images locally in the browser with quality and format controls.",
    status: "ready",
    tags: ["compress", "image", "jpg", "png", "webp"],
    slug: "image-compressor",
  },
  {
    id: "image-enhancer",
    name: "Image Enhancer",
    categoryId: "images",
    description: "Enhance image resolution and visual quality locally with adjustable controls.",
    status: "ready",
    tags: ["enhance", "upscale", "image", "sharpness"],
    slug: "image-enhancer",
  },
  {
    id: "video-compressor",
    name: "Video Compressor",
    categoryId: "video",
    description: "Compress supported videos locally with adjustable H.264 quality settings.",
    status: "ready",
    tags: ["compress", "video", "mp4", "ffmpeg"],
    slug: "video-compressor",
  },
  {
    id: "video-trimmer",
    name: "Video Trimmer",
    categoryId: "video",
    description: "Trim supported videos to precise start and end times locally in the browser.",
    status: "ready",
    tags: ["trim", "cut", "video", "ffmpeg"],
    slug: "video-trimmer",
  },
];

export const verifiedDesktopToolById = new Map(verifiedDesktopTools.map((tool) => [tool.id, tool]));
export const verifiedDesktopToolBySlug = new Map(verifiedDesktopTools.map((tool) => [tool.slug!, tool]));

export function getVerifiedDesktopTool(slugOrId: string): Tool | undefined {
  return verifiedDesktopToolBySlug.get(slugOrId) ?? verifiedDesktopToolById.get(slugOrId);
}
