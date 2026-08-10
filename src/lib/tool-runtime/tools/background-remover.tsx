import { Image as ImageIcon } from "lucide-react";
import { BackgroundRemover } from "@/components/tools/BackgroundRemover";
import type { ReadyToolRuntimeDefinition } from "../types";

export const backgroundRemoverRuntime: ReadyToolRuntimeDefinition = {
  toolId: "background-remover",
  slug: "background-remover",
  categoryId: "images",
  icon: ImageIcon,
  component: BackgroundRemover,
  layoutDescription:
    "Cut out image backgrounds automatically with edge refine controls and export transparent PNGs.",
};
