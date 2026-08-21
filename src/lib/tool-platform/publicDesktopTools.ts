import type { PublicToolRegistration } from "./types";
import { certificationRequirements, publicToolTestContracts } from "./testContracts";
import { getToolSeoMetadata } from "./seoRegistry";
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
    seo: getToolSeoMetadata("image-compressor"),
  },
  {
    id: "image-enhancer",
    slug: "image-enhancer",
    name: "Image Enhancer",
    category: "images" as const,
    description: "Enhance image resolution and visual quality locally with adjustable controls.",
    lifecycle: "public" as const,
    capabilities: { input: "file" as const, output: "download" as const, localOnly: true },
    seo: getToolSeoMetadata("image-enhancer"),
  },
  {
    id: "video-compressor",
    slug: "video-compressor",
    name: "Video Compressor",
    category: "video" as const,
    description: "Compress supported videos locally with adjustable H.264 quality settings.",
    lifecycle: "public" as const,
    capabilities: { input: "file" as const, output: "download" as const, localOnly: true },
    seo: getToolSeoMetadata("video-compressor"),
  },
  {
    id: "video-trimmer",
    slug: "video-trimmer",
    name: "Video Trimmer",
    category: "video" as const,
    description: "Trim supported videos to precise start and end times locally in your browser.",
    lifecycle: "public" as const,
    capabilities: { input: "file" as const, output: "download" as const, localOnly: true },
    seo: getToolSeoMetadata("video-trimmer"),
  },
  {
    id: "qr-generator",
    slug: "qr-generator",
    name: "QR Generator",
    category: "utilities" as const,
    description: "Create QR codes locally for links, text, Wi-Fi, email, and phone numbers.",
    lifecycle: "public" as const,
    capabilities: {
      input: "text" as const,
      output: "download" as const,
      localOnly: true,
      policy: { requiresNetwork: false, requiresStorage: false, sensitiveInput: false },
    },
    dependencies: [],
    seo: getToolSeoMetadata("qr-generator"),
  },
] as const;

const validatedManifestData = manifestData.map((manifest) => {
  if (!manifest.seo) throw new Error(`Missing canonical SEO metadata: ${manifest.id}`);
  return toolBaseManifestSchema.parse({
    ...manifest,
    seo: manifest.seo,
    tags: manifest.seo.keywords,
    status: "ready",
  });
});

export const publicToolRegistrations: readonly PublicToolRegistration[] = Object.freeze(
  validatedManifestData.map((manifest) => {
    const test = publicToolTestContracts.find((entry) => entry.toolId === manifest.id);
    if (!test) throw new Error(`Missing test contract: ${manifest.id}`);
    return Object.freeze({
      manifest: Object.freeze({ ...manifest, certification: certificationRequirements, status: "ready" as const }),
      test,
    });
  }),
);

const publicToolById = new Map(publicToolRegistrations.map((registration) => [registration.manifest.id, registration]));
const publicToolBySlug = new Map(publicToolRegistrations.map((registration) => [registration.manifest.slug, registration]));

export const getPublicToolRegistration = (id: string): PublicToolRegistration | undefined =>
  publicToolById.get(id);

export const getPublicToolRegistrationBySlug = (slug: string): PublicToolRegistration | undefined =>
  publicToolBySlug.get(slug);
