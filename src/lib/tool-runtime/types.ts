import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { ToolId, ToolSlug, ToolCategoryId } from "@/lib/tool-platform/types";
import type { ToolSeoData } from "@/data/toolSeo";

export interface ReadyToolRuntimeDefinition {
  toolId: ToolId;
  slug: ToolSlug;
  categoryId: ToolCategoryId;
  icon: LucideIcon;
  component: ComponentType;
  seoOverride?: Partial<ToolSeoData>;
  layoutDescription: string;
  layoutDescriptionKey?: string;
}
