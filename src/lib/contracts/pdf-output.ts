import type { ToolOutputContract } from './tool-output';

export const pdfOutputContract = {
  toolId: 'pdf-output',
  kind: 'pdf',
  outputMimeTypes: ['application/pdf'],
  downloadRequired: true,
  minOutputBytes: 8,
  signature: [0x25, 0x50, 0x44, 0x46, 0x2d],
  validateSignature: true,
  validateDecode: false,
  validateDimensions: false,
  validateMetadata: false,
} as const satisfies ToolOutputContract;
