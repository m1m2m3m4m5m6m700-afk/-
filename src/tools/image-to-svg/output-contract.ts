import type { ToolOutputContract } from '../../lib/contracts/tool-output';

export const imageToSvgOutputContract = {
  toolId: 'image-to-svg',
  kind: 'svg',
  outputMimeTypes: ['image/svg+xml'],
  downloadRequired: true,
  minOutputBytes: 1,
  validateSignature: false,
  validateDecode: false,
  validateDimensions: false,
  validateMetadata: false,
} as const satisfies ToolOutputContract;
