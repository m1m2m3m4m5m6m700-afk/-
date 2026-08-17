import { categories, type CategoryId } from "./categories";
import { isPublicDesktopToolId } from "@/lib/desktop-tools/publicIds";

/**
 * Legacy catalog status. It is retained for roadmap/content validation only.
 * Public availability is controlled exclusively by the verified desktop runtime registry.
 */
export type ToolStatus = "placeholder" | "planned" | "ready";

export interface Tool {
  id: string;
  name: string;
  categoryId: CategoryId;
  description: string;
  status: ToolStatus;
  tags?: string[];
  slug?: string;
}

// ... existing catalog entries unchanged ...
