export type ToolConfig = {
  readonly id: string;
  readonly title: string;
  readonly path: string;
  readonly description: string;
  readonly isReady: boolean;
};

export const TOOLS_REGISTRY: readonly ToolConfig[] = Object.freeze([
  {
    id: 'image-compressor',
    title: 'Compress Images Online',
    path: '/en/image-compressor',
    description: 'Reduce JPG, PNG, and WebP file size in your browser with quality and dimension controls.',
    isReady: true,
  },
]);

export const getToolConfig = (id: string) => TOOLS_REGISTRY.find((tool) => tool.id === id);
export const getReadyToolConfigs = () => TOOLS_REGISTRY.filter((tool) => tool.isReady);
