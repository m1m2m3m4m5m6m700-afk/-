import type { ToolConfig } from "@/config/tools";
import type { ReadyToolRuntimeDefinition } from "./types";

export const toolConfigToRuntime = (tool: ToolConfig): ReadyToolRuntimeDefinition => ({
  toolId: tool.id,
  slug: tool.id,
  categoryId: tool.category,
  icon: tool.icon,
  component: tool.component,
  layoutDescription: tool.description,
  layoutDescriptionKey: tool.descriptionKey,
});
