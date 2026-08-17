import type { ToolManifest, ToolRuntimeDefinition } from "./types";

export interface PublicToolRegistration {
  readonly manifest: ToolManifest;
  readonly runtime: ToolRuntimeDefinition;
}

/**
 * Single public extension point for future tools.
 * Keep this empty until a tool has completed the promotion pipeline.
 */
export const publicToolRegistrations: readonly PublicToolRegistration[] = [];

export function listPublicToolRegistrations(): readonly PublicToolRegistration[] {
  return publicToolRegistrations;
}

export function getPublicToolRegistration(slug: string): PublicToolRegistration | undefined {
  return publicToolRegistrations.find((entry) => entry.manifest.slug === slug);
}
