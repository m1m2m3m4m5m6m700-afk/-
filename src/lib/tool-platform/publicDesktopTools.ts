import { TOOLS_REGISTRY } from "@/config/tools";
import type { PublicToolRegistration } from "./types";
import { certificationRequirements, publicToolTestContracts } from "./testContracts";
import { toolBaseManifestSchema } from "./schemas";

const validatedManifestData = TOOLS_REGISTRY.map((tool) =>
  toolBaseManifestSchema.parse({
    id: tool.id,
    slug: tool.id,
    name: tool.title,
    category: tool.category,
    description: tool.description,
    lifecycle: tool.isReady ? "public" : "implemented",
    capabilities: {
      input: tool.input,
      output: tool.output,
      localOnly: tool.localOnly,
    },
  }),
);

export const publicToolRegistrations: readonly PublicToolRegistration[] = Object.freeze(
  validatedManifestData
    .filter((manifest) => manifest.lifecycle === "public")
    .map((manifest) => {
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

/** Compatibility adapter: canonical identity and readiness now come from @/config/tools. */
export const getPublicTools = (): readonly PublicToolRegistration[] => publicToolRegistrations;
