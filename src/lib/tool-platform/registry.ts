import type { PublicToolRegistration, ToolManifest, ToolTestContract } from "./types";

const publicRegistrations: PublicToolRegistration[] = [];

export const registerPublicTool = (
  manifest: ToolManifest,
  test: ToolTestContract,
): PublicToolRegistration => {
  if (manifest.lifecycle !== "public") {
    throw new Error(`Tool ${manifest.id} cannot be public while lifecycle is ${manifest.lifecycle}.`);
  }
  if (test.toolId !== manifest.id) {
    throw new Error(`Test contract ${test.toolId} does not match tool ${manifest.id}.`);
  }
  if (test.route !== `/tools/${manifest.slug}`) {
    throw new Error(`Test route ${test.route} does not match tool ${manifest.slug}.`);
  }

  const duplicate = publicRegistrations.find((entry) => entry.manifest.id === manifest.id);
  if (duplicate) throw new Error(`Duplicate public tool: ${manifest.id}`);

  const registration = Object.freeze({ manifest, test });
  publicRegistrations.push(registration);
  return registration;
};

export const publicToolRegistrations = Object.freeze(publicRegistrations);

export const getPublicToolRegistration = (slug: string): PublicToolRegistration | undefined =>
  publicRegistrations.find((entry) => entry.manifest.slug === slug);
