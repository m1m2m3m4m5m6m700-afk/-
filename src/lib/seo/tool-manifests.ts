import type { ToolManifest } from './tool-manifest';
import { BACKGROUND_REMOVER_MANIFEST } from '../../tools/background-remover/manifest';
import { IMAGE_COMPRESSOR_MANIFEST } from '../../tools/image-compressor/manifest';

export const TOOL_SEO_MANIFESTS: readonly ToolManifest[] = Object.freeze([
  IMAGE_COMPRESSOR_MANIFEST,
  BACKGROUND_REMOVER_MANIFEST,
]);

export const getToolSeoManifest = (toolId: string): ToolManifest | undefined =>
  TOOL_SEO_MANIFESTS.find((manifest) => manifest.toolId === toolId);
