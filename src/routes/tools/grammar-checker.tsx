import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { GrammarCheckerRuntime } from "@/lib/tool-runtime/tools/grammar-checker";

export const Route = createFileRoute("/tools/grammar-checker")({
  head: createReadyToolHead(GrammarCheckerRuntime),
  component: renderReadyToolPage(GrammarCheckerRuntime),
});
