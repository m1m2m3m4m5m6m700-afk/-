import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ColorPickerRuntime } from "@/lib/tool-runtime/tools/color-picker";

export const Route = createFileRoute("/tools/color-picker")({
  head: createReadyToolHead(ColorPickerRuntime),
  component: renderReadyToolPage(ColorPickerRuntime),
});
