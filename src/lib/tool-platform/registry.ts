import { assertToolManifest } from "./manifest";
import type { ToolManifest } from "./types";

const manifests = new Map<string, ToolManifest>();
const publicSlugs = new Set<string>();

export function registerToolManifest(manifest: ToolManifest): void {
  assertToolManifest(manifest);
  if (manifests.has(manifest.id)) {
    throw new Error(`Tool manifest already registered: ${manifest.id}`);
  }
  if ([...manifests.values()].some((entry) => entry.slug === manifest.slug)) {
    throw new Error(`Tool slug already registered: ${manifest.slug}`);
  }
  manifests.set(manifest.id, manifest);
}

export function registerPublicTool(manifest: ToolManifest): void {
  assertToolManifest(manifest);
  if (manifest.lifecycle !== "public") {
    throw new Error(`Only public manifests may be exposed: ${manifest.id}`);
  }
  const existing = manifests.get(manifest.id);
  if (!existing) registerToolManifest(manifest);
  publicSlugs.add(manifest.slug);
}

export function getToolManifest(id: string): ToolManifest | undefined {
  return manifests.get(id);
}

export function getPublicToolManifest(slug: string): ToolManifest | undefined {
  for (const manifest of manifests.values()) {
    if (manifest.slug === slug && publicSlugs.has(slug)) return manifest;
  }
  return undefined;
}

export function listToolManifests(): readonly ToolManifest[] {
  return [...manifests.values()];
}

export function listPublicToolManifests(): readonly ToolManifest[] {
  return [...manifests.values()].filter((manifest) => publicSlugs.has(manifest.slug));
}

export function resetToolRegistryForTests(): void {
  manifests.clear();
  publicSlugs.clear();
}
