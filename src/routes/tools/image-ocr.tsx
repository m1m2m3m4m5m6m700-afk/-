import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ImageOcrRuntime } from "@/lib/tool-runtime/tools/image-ocr";

export const Route = createFileRoute("/tools/image-ocr")({
  head: createReadyToolHead(ImageOcrRuntime),
  component: renderReadyToolPage(ImageOcrRuntime),
});
