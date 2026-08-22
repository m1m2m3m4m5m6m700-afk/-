export type ToolOutputKind = 'image' | 'svg' | 'pdf' | 'zip' | 'text' | 'json';

export type ToolOutputContract = {
  readonly toolId: string;
  readonly kind: ToolOutputKind;
  readonly outputMimeTypes: readonly string[];
  readonly downloadRequired: boolean;
  readonly minOutputBytes?: number;
  readonly validateSignature?: boolean;
  readonly validateDecode?: boolean;
  readonly validateDimensions?: boolean;
  readonly validateMetadata?: boolean;
};

export function assertToolOutputContract(
  contract: ToolOutputContract,
  result: { readonly mimeType: string; readonly byteLength: number },
): void {
  if (!contract.outputMimeTypes.includes(result.mimeType)) {
    throw new Error(`Unexpected MIME type for ${contract.toolId}: ${result.mimeType}`);
  }

  if (contract.minOutputBytes !== undefined && result.byteLength < contract.minOutputBytes) {
    throw new Error(`Output too small for ${contract.toolId}: ${result.byteLength} bytes`);
  }
}
