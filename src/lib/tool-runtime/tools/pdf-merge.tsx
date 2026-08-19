import { FileStack } from "lucide-react";
import { PdfMerge } from "@/components/tools/PdfMerge";
import type { ReadyToolRuntimeDefinition } from "../types";

export const pdfMergeRuntime: ReadyToolRuntimeDefinition = {
  toolId: "pdf-merge",
  slug: "pdf-merge",
  categoryId: "pdf",
  icon: FileStack,
  component: PdfMerge,
  layoutDescription: "Combine multiple PDF files locally in your browser into one ordered document.",
};
