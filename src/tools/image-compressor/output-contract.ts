export const imageCompressorOutputContract = {
  toolId: 'image-compressor',
  outputMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  downloadRequired: true,
  minOutputBytes: 1,
  validateDecode: true,
  validateDimensions: true,
  validateMetadata: false,
} as const;

export type ToolOutputContract = typeof imageCompressorOutputContract;
