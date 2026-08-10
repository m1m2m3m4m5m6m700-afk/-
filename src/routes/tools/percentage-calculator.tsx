import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PercentageCalculatorRuntime } from "@/lib/tool-runtime/tools/percentage-calculator";

export const Route = createFileRoute("/tools/percentage-calculator")({
  head: createReadyToolHead(PercentageCalculatorRuntime),
  component: renderReadyToolPage(PercentageCalculatorRuntime),
});
