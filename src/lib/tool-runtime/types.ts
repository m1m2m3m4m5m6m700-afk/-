import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { ToolId, ToolSlug, ToolCategoryId } from "@/lib/tool-platform/types";

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolSeoData {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  overview: string;
  features: string[];
  howToUse: string[];
  benefits: string[];
  faqs: ToolFaqItem[];
  examples?: string[];
}

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
