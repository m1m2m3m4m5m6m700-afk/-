import type { ToolManifest } from "./types";

const SAFE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertToolManifest(manifest: ToolManifest): void {
  if (!SAFE_ID.test(manifest.id)) throw new Error(`Invalid tool id: ${manifest.id}`);
  if (!SAFE_ID.test(manifest.slug)) throw new Error(`Invalid tool slug: ${manifest.slug}`);
  if (!manifest.name.trim()) throw new Error(`Tool ${manifest.id} must have a name.`);
  if (!manifest.category.trim()) throw new Error(`Tool ${manifest.id} must have a category.`);
  if (!Number.isInteger(manifest.version) || manifest.version < 1) {
    throw new Error(`Tool ${manifest.id} must have a positive integer version.`);
  }
  if (!manifest.runtimeModule || !manifest.routeModule || !manifest.testModule) {
    throw new Error(`Tool ${manifest.id} must declare runtime, route, and test modules.`);
  }
  if (!manifest.capabilities.input || !manifest.capabilities.output) {
    throw new Error(`Tool ${manifest.id} must declare input and output capabilities.`);
  }
  if (manifest.limits?.maxFileSizeMb !== undefined && manifest.limits.maxFileSizeMb <= 0) {
    throw new Error(`Tool ${manifest.id} maxFileSizeMb must be positive.`);
  }
}
