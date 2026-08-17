export type ToolLifecycleState =
  | "draft"
  | "implemented"
  | "tested"
  | "verified"
  | "public";

export type ToolInputKind = "file" | "files" | "text" | "structured";
export type ToolOutputKind = "download" | "preview" | "text" | "structured" | "none";

export interface ToolCapabilities {
  input: ToolInputKind;
  output: ToolOutputKind;
  localOnly: boolean;
  supportsMultipleFiles?: boolean;
  supportsStreaming?: boolean;
}

export interface ToolLimits {
  maxFileSizeMb?: number;
  maxFiles?: number;
  maxInputLength?: number;
}

export interface ToolManifest {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly category: string;
  readonly version: number;
  readonly lifecycle: ToolLifecycleState;
  readonly capabilities: ToolCapabilities;
  readonly limits?: ToolLimits;
  readonly runtimeModule: string;
  readonly routeModule: string;
  readonly testModule: string;
}

export interface ToolRuntimeContext {
  readonly manifest: ToolManifest;
}

export interface ToolRuntimeDefinition {
  readonly manifest: ToolManifest;
  readonly mount: (context: ToolRuntimeContext) => unknown;
}

export interface ToolPromotionEvidence {
  readonly implementation: boolean;
  readonly route: boolean;
  readonly test: boolean;
  readonly runtimeContract: boolean;
  readonly typecheck: boolean;
  readonly lint: boolean;
  readonly build: boolean;
}

export const PROMOTABLE_STATES: readonly ToolLifecycleState[] = [
  "draft",
  "implemented",
  "tested",
  "verified",
  "public",
];
