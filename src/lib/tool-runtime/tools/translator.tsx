import { Languages } from "lucide-react";
import { Translator } from "@/components/tools/Translator";
import type { ReadyToolRuntimeDefinition } from "../types";

export const translatorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "translator",
  slug: "translator",
  categoryId: "translation",
  icon: Languages,
  component: Translator,
  layoutDescription: "",
  layoutDescriptionKey: "translator.pageDescription",
};
