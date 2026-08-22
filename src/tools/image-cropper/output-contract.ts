import type { ToolOutputContract } from '../../lib/contracts/tool-output';

export const imageCropperOutputContract = {
  toolId: 'image-cropper',
  kind: 'image',
  outputMimeTypes: ['image/png'],
  downloadRequired: true,
  minOutputBytes: 1,
  validateSignature: true,
  validateDecode: true,
  validateDimensions: true,
  validateMetadata: false,
} as const satisfies ToolOutputContract;
