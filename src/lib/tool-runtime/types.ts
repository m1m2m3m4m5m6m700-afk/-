import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { CategoryId } from "@/data/categories";
import type { ToolSeoData } from "@/data/toolSeo";
import type { Tool } from "@/data/tools";

export interface ReadyToolRuntimeDefinition {
  toolId: Tool["id"];
  slug: string;
  categoryId: CategoryId;
  icon: LucideIcon;
  component: ComponentType;
  seoOverride?: Partial<ToolSeoData>;
  layoutDescription: string;
  layoutDescriptionKey?: string;
}
