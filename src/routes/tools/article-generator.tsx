import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ArticleGeneratorRuntime } from "@/lib/tool-runtime/tools/article-generator";

export const Route = createFileRoute("/tools/article-generator")({
  head: createReadyToolHead(ArticleGeneratorRuntime),
  component: renderReadyToolPage(ArticleGeneratorRuntime),
});
