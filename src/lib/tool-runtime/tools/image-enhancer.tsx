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
    "Upscale images up to 8x via in-browser resampling, with adjustable sharpness (unsharp mask), brightness, contrast, vibrance, and tone corrections.",
};
