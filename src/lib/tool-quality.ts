export type ToolLifecycle = "placeholder" | "planned" | "ready" | "reviewed" | "failed" | "deprecated";

export interface ToolQualityEvidence {
  runtime: boolean;
  automatedTests: boolean;
  manualQa: boolean;
  localization: boolean;
  accessibility: boolean;
  performance: boolean;
  seo: boolean;
  security: boolean;
}

export interface ToolQualityScore {
  score: number;
  promotable: boolean;
  evidence: ToolQualityEvidence;
}

const DIMENSIONS: Array<keyof ToolQualityEvidence> = [
  "runtime",
  "automatedTests",
  "manualQa",
  "localization",
  "accessibility",
  "performance",
  "seo",
  "security",
];

export function qualityScore(evidence: ToolQualityEvidence): ToolQualityScore {
  const passed = DIMENSIONS.reduce((sum, key) => sum + (evidence[key] ? 1 : 0), 0);
  const score = Math.round((passed / DIMENSIONS.length) * 100);
  return { score, promotable: score === 100, evidence };
}

export function isPublicTool(status: ToolLifecycle, evidence: ToolQualityEvidence): boolean {
  return status === "ready" && qualityScore(evidence).promotable;
}

export const PUBLIC_TOOL_RULE =
  "A public tool must have a real runtime, automated tests, manual QA, localization, accessibility, performance, SEO, and security evidence.";
