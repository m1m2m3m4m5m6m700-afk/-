export interface MegaToolDefinition {
  slug: string;
  name: string;
  category: "images" | "video" | "audio" | "pdf";
  description: string;
  handler: string;
  preset: string;
}

export declare const MEGA_TOOL_CATEGORIES: Readonly<Record<MegaToolDefinition["category"], string>>;
export declare const MEGA_TOOLS: readonly MegaToolDefinition[];
export declare const MEGA_TOOL_COUNT: number;
