import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ImageTranslatorRuntime } from "@/lib/tool-runtime/tools/image-translator";

export const Route = createFileRoute("/tools/image-translator")({
  head: createReadyToolHead(ImageTranslatorRuntime),
  component: renderReadyToolPage(ImageTranslatorRuntime),
});
