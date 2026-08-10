import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { AddLineNumbersRuntime } from "@/lib/tool-runtime/tools/add-line-numbers";

export const Route = createFileRoute("/tools/add-line-numbers")({
  head: createReadyToolHead(AddLineNumbersRuntime),
  component: renderReadyToolPage(AddLineNumbersRuntime),
});
