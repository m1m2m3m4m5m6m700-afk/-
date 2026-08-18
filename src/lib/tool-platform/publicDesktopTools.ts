import type { PublicToolRegistration } from "./types";
import { certificationRequirements, publicToolTestContracts } from "./testContracts";
import { toolBaseManifestSchema } from "./schemas";

const manifestData = [
  {
    id: "image-compressor",
    slug: "image-compressor",
    name: "Image Compressor",
    category: "images" as const,
    description: "Compress images locally in your browser with quality and format controls.",
    lifecycle: "public" as const,
    capabilities: { input: "file" as const, output: "download" as const, localOnly: true },
  },
  {
    id: "image-enhancer",
    slug: "image-enhancer",
    name: "Image Enhancer",
    category: "images" as const,
    description: "Enhance image resolution and visual quality locally with adjustable controls.",
    lifecycle: "public" as const,
    capabilities: { input: "file" as const, output: "download" as const, localOnly: true },
  },
  {
    id: "video-compressor",
    slug: "video-compressor",
    name: "Video Compressor",
    category: "video" as const,
    description: "Compress supported videos locally with adjustable H.264 quality settings.",
    lifecycle: "public" as const,
    capabilities: { input: "file" as const, output: "download" as const, localOnly: true },
  },
  {
    id: "video-trimmer",
    slug: "video-trimmer",
    name: "Video Trimmer",
    category: "video" as const,
    description: "Trim supported videos to precise start and end times locally in your browser.",
    lifecycle: "public" as const,
    capabilities: { input: "file" as const, output: "download" as const, localOnly: true },
  },
] as const;

const validatedManifestData = manifestData.map((manifest) => toolBaseManifestSchema.parse(manifest));

export const publicToolRegistrations: readonly PublicToolRegistration[] = Object.freeze(
  validatedManifestData.map((manifest) => {
    const test = publicToolTestContracts.find((entry) => entry.toolId === manifest.id);
    if (!test) throw new Error(`Missing test contract: ${manifest.id}`);
    return Object.freeze({
      manifest: Object.freeze({ ...manifest, certification: certificationRequirements }),
      test,
    });
  }),
);

export const getPublicToolRegistration = (toolId: string): PublicToolRegistration | undefined =>
  publicToolRegistrations.find((entry) => entry.manifest.id === toolId);

export const getPublicToolRegistrationBySlug = (slug: string): PublicToolRegistration | undefined =>
  publicToolRegistrations.find((entry) => entry.manifest.slug === slug);
