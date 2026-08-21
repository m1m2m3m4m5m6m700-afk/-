export type ToolConfig = {
  readonly id: string;
  readonly title: string;
  readonly path: string;
  readonly description: string;
  readonly isReady: boolean;
};

export const TOOLS_REGISTRY: readonly ToolConfig[] = Object.freeze([
  {
    id: "calculator",
    title: "Scientific Calculator",
    path: "/",
    description: "Fast scientific calculator with memory, history, functions, powers, roots and angle modes.",
    isReady: true,
  },
]);

export const getToolConfig = (id: string) => TOOLS_REGISTRY.find((tool) => tool.id === id);
export const getReadyToolConfigs = () => TOOLS_REGISTRY.filter((tool) => tool.isReady);
