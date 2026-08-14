import { Sparkles } from "lucide-react";
import { FreeAIHub } from "@/components/tools/FreeAIHub";
import type { ReadyToolRuntimeDefinition } from "../types";

export const FreeAIHubRuntime = {
  toolId: "free-ai-hub",
  slug: "free-ai-hub",
  categoryId: "ai",
  icon: Sparkles,
  component: FreeAIHub,
  layoutDescription:
    "A free-first AI workspace for chat, writing, summarization, translation, coding and research using local or free-tier providers.",
} satisfies ReadyToolRuntimeDefinition;
