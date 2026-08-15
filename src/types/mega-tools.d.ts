export type MegaToolCategory = "images" | "video" | "audio" | "pdf";
export type MegaToolPreset =
  | "quick"
  | "small"
  | "medium"
  | "large"
  | "social"
  | "web"
  | "mobile"
  | "print"
  | "hd"
  | "pro"
  | "max";

export interface MegaTool {
  slug: string;
  name: string;
  category: MegaToolCategory;
  description: string;
  handler: string;
  preset: MegaToolPreset;
}

export type MegaToolResult =
  | { type: "text"; text: string }
  | { type: "download"; url: string; filename: string }
  | {
      type: "video";
      element: HTMLVideoElement;
      keepUrl?: boolean;
      cleanup?: () => void;
    };

declare module "@/data/megaToolsCatalog.mjs" {
  export const MEGA_TOOL_CATEGORIES: Readonly<Record<MegaToolCategory, string>>;
  export const MEGA_TOOLS: readonly MegaTool[];
  export const MEGA_TOOL_COUNT: number;
}

declare module "@/lib/megaToolsEngineAdapter.mjs" {
  export function runMegaTool(tool: MegaTool, file: File): Promise<MegaToolResult>;
}
