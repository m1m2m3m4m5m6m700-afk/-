import type { ToolOutputContract } from '../../lib/contracts/tool-output';

export const watermarkAdderOutputContract = {
  toolId: 'watermark-adder',
  kind: 'image',
  outputMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  downloadRequired: true,
  minOutputBytes: 1,
  validateSignature: true,
  validateDecode: true,
  validateDimensions: true,
  validateMetadata: false,
} as const satisfies ToolOutputContract;
