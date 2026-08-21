import { createRootRoute } from "@tanstack/react-router";
import { CalculatorTool } from "@/tools/calculator";

export const rootRoute = createRootRoute({
  component: CalculatorTool,
});
