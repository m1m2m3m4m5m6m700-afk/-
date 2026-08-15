import { MonitorCog } from "lucide-react";
import { allDesktopTools } from "@/lib/desktop-tools";
import { DesktopTool } from "./desktop-runtime-ui";
import type { ReadyToolRuntimeDefinition } from "./types";

export const desktopToolRuntimes: ReadyToolRuntimeDefinition[] ReadyToolRuntimeDefinition[] = allDesktopTools.map((spec) => ({
  toolId: spec.id,
  slug: spec.slug,
  categoryId: spec.categoryId,
  icon: MonitorCog,
  component: () => <DesktopTool spec={spec} />,
  layoutDescription: spec.description,
  seoOverride: {
    slug: spec.slug,
    title: `${spec.name} — Free Online Desktop Utility | Flixo`,
    description: `${spec.description} Free, private browser-based desktop utility from Flixo.`,
    keywords: [...spec.tags, "free", "online", "Flixo"],
    overview: spec.description,
    features: ["Instant browser processing", "No account required", "Copy or download results", "Privacy-first local execution"],
    howToUse: ["Enter your input.", "Run the tool.", "Review and copy or download the result."],
    benefits: ["Fast desktop-style workflow", "Browser-first execution", "No file upload required for text operations"],
    faqs: [
      { question: `Is ${spec.name} free?`, answer: "Yes. This Flixo utility is available without a subscription or account." },
      { question: "Is my input uploaded?", answer: "The computation is performed in the browser and the tool does not require uploading input to a third-party analytics service." },
    ],
  },
}));
