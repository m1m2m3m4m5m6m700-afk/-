import type { ToolCategoryId } from "./categories";

export type { ToolCategoryId } from "./categories";
export type ToolId = string;
export type ToolSlug = string;

export type ToolLifecycleState =
  | "draft"
  | "implemented"
  | "verified"
  | "public"
  | "deprecated";

export type ToolInputKind = "file" | "files" | "text" | "url" | "none";
export type ToolOutputKind = "download" | "preview" | "text" | "none";
export type ToolTestCheck = "render" | "interaction" | "output" | "error";

export interface ToolCapabilities {
  readonly input: ToolInputKind;
  readonly output: ToolOutputKind;
  readonly localOnly: boolean;
}

export interface ToolManifest {
  readonly id: ToolId;
  readonly slug: ToolSlug;
  readonly name: string;
  readonly category: ToolCategoryId;
  readonly description: string;
  readonly lifecycle: ToolLifecycleState;
  readonly capabilities: ToolCapabilities;
}

export interface ToolTestContract {
  readonly toolId: ToolId;
  readonly route: string;
  readonly requiredChecks: readonly ToolTestCheck[];
}

export interface PublicToolRegistration {
  readonly manifest: ToolManifest;
  readonly test: ToolTestContract;
}
