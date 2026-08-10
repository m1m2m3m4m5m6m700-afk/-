import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { BlogGeneratorRuntime } from "@/lib/tool-runtime/tools/blog-generator";

export const Route = createFileRoute("/tools/blog-generator")({
  head: createReadyToolHead(BlogGeneratorRuntime),
  component: renderReadyToolPage(BlogGeneratorRuntime),
});
