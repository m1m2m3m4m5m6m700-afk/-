import { QrCode } from "lucide-react";
import { QrGenerator } from "@/components/tools/QrGenerator";
import type { ReadyToolRuntimeDefinition } from "../types";

export const qrGeneratorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "qr-generator",
  slug: "qr-generator",
  categoryId: "utilities",
  icon: QrCode,
  component: QrGenerator,
  layoutDescription:
    "Generate high quality QR codes for URLs, Wi-Fi credentials, text and contact information.",
};
