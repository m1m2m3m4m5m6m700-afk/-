import { Sparkles } from "lucide-react";
import { ImageEnhancer } from "@/components/tools/ImageEnhancer";
import type { ReadyToolRuntimeDefinition } from "../types";

export const imageEnhancerRuntime: ReadyToolRuntimeDefinition = {
  toolId: "image-enhancer",
  slug: "image-enhancer",
  categoryId: "images",
  icon: Sparkles,
  component: ImageEnhancer,
  layoutDescription:
    "Upscale resolution up to 8x, restore faces, remove noise and sharpen photos online.",
};
