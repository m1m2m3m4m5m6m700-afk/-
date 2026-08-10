import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ImageToPdfRuntime } from "@/lib/tool-runtime/tools/image-to-pdf";

export const Route = createFileRoute("/tools/image-to-pdf")({
  head: createReadyToolHead(ImageToPdfRuntime),
  component: renderReadyToolPage(ImageToPdfRuntime),
});
