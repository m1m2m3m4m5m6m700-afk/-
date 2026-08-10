import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ColorPaletteGeneratorRuntime } from "@/lib/tool-runtime/tools/color-palette-generator";

export const Route = createFileRoute("/tools/color-palette-generator")({
  head: createReadyToolHead(ColorPaletteGeneratorRuntime),
  component: renderReadyToolPage(ColorPaletteGeneratorRuntime),
});
