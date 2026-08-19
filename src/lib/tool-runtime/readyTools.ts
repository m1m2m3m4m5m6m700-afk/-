import { getPublicToolRegistration } from "@/lib/tool-platform/publicDesktopTools";
import { assertPublicRegistration } from "@/lib/tool-platform/promotion";
import { imageCompressorRuntime } from "./tools/image-compressor";
import { imageEnhancerRuntime } from "./tools/image-enhancer";
import { VideoCompressorRuntime } from "./tools/video-compressor";
import { VideoTrimmerRuntime } from "./tools/video-trimmer";
import { qrGeneratorRuntime } from "./tools/qr-generator";
import type { ReadyToolRuntimeDefinition } from "./types";

/**
 * Runtime bindings for the tools currently public.
 * Identity, lifecycle, and regression requirements are owned by the Tool Platform.
 */
export const readyToolRuntimes = [
  imageCompressorRuntime,
  imageEnhancerRuntime,
  VideoCompressorRuntime,
  VideoTrimmerRuntime,
  qrGeneratorRuntime,
] as const satisfies readonly ReadyToolRuntimeDefinition[];

for (const runtime of readyToolRuntimes) {
  const registration = getPublicToolRegistration(runtime.toolId);
  if (!registration) {
    throw new Error(`Missing public Tool Platform registration: ${runtime.toolId}`);
  }
  assertPublicRegistration(registration);
  if (registration.manifest.slug !== runtime.slug) {
    throw new Error(`Runtime slug mismatch for ${runtime.toolId}`);
  }
  if (registration.manifest.category !== runtime.categoryId) {
    throw new Error(`Runtime category mismatch for ${runtime.toolId}`);
  }
}

export type PublicToolSlug = (typeof readyToolRuntimes)[number]["slug"];

export const readyToolRuntimeBySlug = new Map<string, ReadyToolRuntimeDefinition>(
  readyToolRuntimes.map((runtime) => [runtime.slug, runtime]),
);

export const getReadyToolRuntime = (slug: string): ReadyToolRuntimeDefinition | undefined =>
  readyToolRuntimeBySlug.get(slug);

export const VERIFIED_TOOL_SLUGS = Object.freeze(
  readyToolRuntimes.map((runtime) => runtime.slug),
);
