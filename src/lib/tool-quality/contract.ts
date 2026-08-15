/**
 * Public quality contract and canonical lifecycle for every Flixo tool.
 *
 * A tool is never public because a single status flag says so. Publication is
 * allowed only when runtime readiness, review and every release gate pass.
 */
export type ToolLifecycleState =
  | "planned"
  | "ready"
  | "automated_pass"
  | "manual_pass"
  | "public"
  | "failed"
  | "blocked"
  | "deprecated";

export type ToolRuntimeStatus = "planned" | "ready" | "deprecated";
export type ToolReviewStatus =
  | "unreviewed"
  | "automated_pass"
  | "manual_pass"
  | "manual_failed"
  | "blocked";

export type ToolRuntimeKind = "browser" | "server" | "hybrid";

export interface ToolIOContract {
  input: string;
  output: string;
}

export interface ToolValidationContract {
  validInput: boolean;
  invalidInput: boolean;
  emptyInput: boolean;
  boundaryInput: boolean;
  failureBehavior: boolean;
  outputValidation: boolean;
  downloadValidation: boolean;
  cleanupValidation: boolean;
}

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

export interface CanonicalToolDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status: ToolLifecycleState;
  runtime: ToolRuntimeKind;
  input: ToolIOContract["input"];
  output: ToolIOContract["output"];
  validation: ToolValidationContract;
  metadata: Readonly<Record<string, string>>;
  localization: Readonly<Record<string, string>>;
  seo: Readonly<Record<string, string>>;
  permissions: readonly string[];
  limits: Readonly<Record<string, number>>;
  dependencies: readonly string[];
  lifecycle: ToolLifecycleState;
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

export function releaseGateFailures(checks: ToolQualityChecks): readonly (keyof ToolQualityChecks)[] {
  return PUBLIC_TOOL_REQUIREMENTS.filter((gate) => !checks[gate]);
}

export function isPublicTool(record: ToolQualityRecord): boolean {
  return (
    record.runtimeStatus === "ready" &&
    record.reviewStatus === "manual_pass" &&
    record.searchable &&
    releaseGateFailures(record.checks).length === 0
  );
}

export function qualityScore(checks: ToolQualityChecks): number {
  const passed = PUBLIC_TOOL_REQUIREMENTS.filter((gate) => checks[gate]).length;
  return Math.round((passed / PUBLIC_TOOL_REQUIREMENTS.length) * 100);
}
