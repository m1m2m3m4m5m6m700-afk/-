import type { ToolLifecycleState, ToolManifest, ToolPromotionEvidence } from "./types";

const REQUIRED_FOR_PUBLIC: readonly (keyof ToolPromotionEvidence)[] = [
  "implementation",
  "route",
  "test",
  "runtimeContract",
  "typecheck",
  "lint",
  "build",
];

const STATE_RANK: Record<ToolLifecycleState, number> = {
  draft: 0,
  implemented: 1,
  tested: 2,
  verified: 3,
  public: 4,
};

export function canTransition(
  from: ToolLifecycleState,
  to: ToolLifecycleState,
): boolean {
  if (from === to) return true;
  return STATE_RANK[to] === STATE_RANK[from] + 1;
}

export function assertPromotionEvidence(
  manifest: ToolManifest,
  evidence: ToolPromotionEvidence,
): void {
  if (manifest.lifecycle !== "public") {
    throw new Error(`Promotion evidence is only required for public tools: ${manifest.id}`);
  }

  const missing = REQUIRED_FOR_PUBLIC.filter((key) => evidence[key] !== true);
  if (missing.length > 0) {
    throw new Error(`Tool ${manifest.id} is not eligible for public promotion. Missing evidence: ${missing.join(", ")}`);
  }
}

export function promoteManifest(
  manifest: ToolManifest,
  target: ToolLifecycleState,
  evidence?: ToolPromotionEvidence,
): ToolManifest {
  if (!canTransition(manifest.lifecycle, target)) {
    throw new Error(`Invalid tool lifecycle transition: ${manifest.lifecycle} -> ${target}`);
  }

  if (target === "public") {
    if (!evidence) throw new Error(`Promotion evidence is required for public tool: ${manifest.id}`);
    assertPromotionEvidence({ ...manifest, lifecycle: target }, evidence);
  }

  return { ...manifest, lifecycle: target };
}
