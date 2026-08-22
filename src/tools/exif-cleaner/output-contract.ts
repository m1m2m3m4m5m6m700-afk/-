import type { ToolOutputContract } from '../../lib/contracts/tool-output';

export const exifCleanerOutputContract = {
  toolId: 'exif-cleaner',
  kind: 'image',
  outputMimeTypes: ['image/png'],
  downloadRequired: true,
  minOutputBytes: 1,
  validateSignature: true,
  validateDecode: true,
  validateDimensions: true,
  validateMetadata: true,
} as const satisfies ToolOutputContract;
