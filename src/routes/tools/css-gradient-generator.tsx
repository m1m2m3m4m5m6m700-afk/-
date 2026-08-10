import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { CssGradientGeneratorRuntime } from "@/lib/tool-runtime/tools/css-gradient-generator";

export const Route = createFileRoute("/tools/css-gradient-generator")({
  head: createReadyToolHead(CssGradientGeneratorRuntime),
  component: renderReadyToolPage(CssGradientGeneratorRuntime),
});
