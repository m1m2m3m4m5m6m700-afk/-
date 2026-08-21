import type { ComponentType, LazyExoticComponent } from "react";
import type { ToolCategoryId, ToolInputKind, ToolOutputKind } from "@/lib/tool-platform/types";

type ToolComponent = LazyExoticComponent<ComponentType>;

export interface ToolConfig {
  readonly id: string;
  readonly title: string;
  readonly category: ToolCategoryId;
  readonly path: string;
  readonly component: ToolComponent;
  readonly icon: ComponentType;
  readonly description: string;
  readonly descriptionKey?: string;
  readonly input: ToolInputKind;
  readonly output: ToolOutputKind;
  readonly localOnly: boolean;
  readonly isReady: boolean;
}

/** Canonical public tool registry. Empty until a tool passes implementation, route, output, and E2E certification. */
export const TOOLS_REGISTRY: readonly ToolConfig[] = Object.freeze([]);
export const getToolConfig = (id: string): ToolConfig | undefined => TOOLS_REGISTRY.find((tool) => tool.id === id);
export const getToolConfigByPath = (path: string): ToolConfig | undefined => TOOLS_REGISTRY.find((tool) => tool.path === path);
export const getReadyToolConfigs = (): readonly ToolConfig[] => TOOLS_REGISTRY.filter((tool) => tool.isReady);
