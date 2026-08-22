import type { ToolOutputContract } from '../../lib/contracts/tool-output';

export const watermarkRemoverOutputContract = {
  toolId: 'watermark-remover',
  kind: 'image',
  outputMimeTypes: ['image/png'],
  downloadRequired: true,
  minOutputBytes: 1,
  validateSignature: true,
  validateDecode: true,
  validateDimensions: true,
  validateMetadata: false,
} as const satisfies ToolOutputContract;
