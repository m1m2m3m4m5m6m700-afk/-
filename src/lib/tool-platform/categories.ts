import type { LucideIcon } from "lucide-react";

/**
 * Stable platform-level category identifiers.
 *
 * These ids belong to the tool platform domain. Presentation/content modules may
 * attach names, descriptions, icons and ordering without redefining the ids.
 */
export type ToolCategoryId =
  | "translation"
  | "images"
  | "pdf"
  | "writing"
  | "video"
  | "audio"
  | "files"
  | "utilities"
  | "converters"
  | "calculators"
  | "web"
  | "chrome"
  | "developer"
  | "ai"
  | "future";

export interface ToolCategoryPresentation {
  readonly id: ToolCategoryId;
  readonly name: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly anchor: string;
  readonly route?: string;
  readonly order: number;
}
