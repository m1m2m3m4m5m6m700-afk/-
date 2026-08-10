import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { AgeCalculatorRuntime } from "@/lib/tool-runtime/tools/age-calculator";

export const Route = createFileRoute("/tools/age-calculator")({
  head: createReadyToolHead(AgeCalculatorRuntime),
  component: renderReadyToolPage(AgeCalculatorRuntime),
});
