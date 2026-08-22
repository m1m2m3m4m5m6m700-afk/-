import type { ToolOutputContract } from '../../lib/contracts/tool-output';

export const imageCompressorOutputContract = {
  toolId: 'image-compressor',
  kind: 'image',
  outputMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  downloadRequired: true,
  minOutputBytes: 1,
  validateSignature: true,
  validateDecode: true,
  validateDimensions: true,
  validateMetadata: false,
} as const satisfies ToolOutputContract;
