import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { BmiCalculatorRuntime } from "@/lib/tool-runtime/tools/bmi-calculator";

export const Route = createFileRoute("/tools/bmi-calculator")({
  head: createReadyToolHead(BmiCalculatorRuntime),
  component: renderReadyToolPage(BmiCalculatorRuntime),
});
