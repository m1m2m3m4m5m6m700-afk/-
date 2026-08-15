/**
 * Public quality contract for every Flixo tool.
 *
 * A tool may be visible in the public search surface only when runtimeStatus is
 * "ready" and reviewStatus is "manual_pass". The contract is intentionally
 * independent from the admin UI and database so validators can enforce it in CI.
 */
export type ToolRuntimeStatus = "planned" | "ready" | "deprecated";
export type ToolReviewStatus =
  | "unreviewed"
  | "automated_pass"
  | "manual_pass"
  | "manual_failed"
  | "blocked";

export interface ToolQualityChecks {
  runtime: boolean;
  automated: boolean;
  manual: boolean;
  localization: boolean;
  accessibility: boolean;
  performance: boolean;
  seo: boolean;
  security: boolean;
}

export interface ToolQualityRecord {
  slug: string;
  runtimeStatus: ToolRuntimeStatus;
  reviewStatus: ToolReviewStatus;
  searchable: boolean;
  featured: boolean;
  checks: ToolQualityChecks;
}

export const PUBLIC_TOOL_REQUIREMENTS: readonly (keyof ToolQualityChecks)[] = [
  "runtime",
  "automated",
  "manual",
  "localization",
  "accessibility",
  "performance",
  "seo",
  "security",
] as const;

export function isPublicTool(record: ToolQualityRecord): boolean {
  return (
    record.runtimeStatus === "ready" &&
    record.reviewStatus === "manual_pass" &&
    record.searchable &&
    PUBLIC_TOOL_REQUIREMENTS.every((check) => record.checks[check])
  );
}

export function qualityScore(checks: ToolQualityChecks): number {
  const passed = Object.values(checks).filter(Boolean).length;
  return Math.round((passed / PUBLIC_TOOL_REQUIREMENTS.length) * 100);
}
