import { KeyRound } from "lucide-react";
import { PasswordGenerator } from "@/components/tools/PasswordGenerator";
import type { ReadyToolRuntimeDefinition } from "../types";

export const passwordGeneratorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "password-generator",
  slug: "password-generator",
  categoryId: "utilities",
  icon: KeyRound,
  component: PasswordGenerator,
  layoutDescription:
    "Generate strong, secure passwords with custom character rules and strength evaluation.",
};
