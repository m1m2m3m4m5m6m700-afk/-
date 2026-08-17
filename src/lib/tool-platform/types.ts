export type ToolLifecycleState = "draft";

export interface ToolManifest {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly category: string;
  readonly version: number;
}

export function assertToolManifest(manifest: ToolManifest): void {
  const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!idPattern.test(manifest.id)) throw new Error(`Invalid tool id: ${manifest.id}`);
  if (!idPattern.test(manifest.slug)) throw new Error(`Invalid tool slug: ${manifest.slug}`);
  if (!manifest.name.trim()) throw new Error(`Tool ${manifest.id} requires a name.`);
  if (!manifest.category.trim()) throw new Error(`Tool ${manifest.id} requires a category.`);
  if (!Number.isInteger(manifest.version) || manifest.version < 1) {
    throw new Error(`Tool ${manifest.id} requires a positive integer version.`);
  }
}
