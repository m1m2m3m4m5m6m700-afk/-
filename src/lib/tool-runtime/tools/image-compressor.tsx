import { FileImage } from "lucide-react";
import { ImageCompressor } from "@/components/tools/ImageCompressor";
import type { ReadyToolRuntimeDefinition } from "../types";

export const imageCompressorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "image-compressor",
  slug: "image-compressor",
  categoryId: "images",
  icon: FileImage,
  component: ImageCompressor,
  layoutDescription:
    "Shrink image file size in your browser with real-time compression ratio preview.",
};
