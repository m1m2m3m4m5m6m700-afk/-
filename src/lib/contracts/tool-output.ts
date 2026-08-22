export type ToolOutputKind = 'image' | 'svg' | 'pdf' | 'zip' | 'text' | 'json';

export type ToolOutputContract = {
  readonly toolId: string;
  readonly kind: ToolOutputKind;
  readonly outputMimeTypes: readonly string[];
  readonly downloadRequired: boolean;
  readonly minOutputBytes?: number;
  readonly signature?: readonly number[];
  readonly validateSignature?: boolean;
  readonly validateDecode?: boolean;
  readonly validateDimensions?: boolean;
  readonly validateMetadata?: boolean;
};

export type ToolOutputResult = {
  readonly mimeType: string;
  readonly byteLength: number;
  readonly bytes?: Uint8Array;
};

export function assertToolOutputContract(
  contract: ToolOutputContract,
  result: ToolOutputResult,
): void {
  if (!contract.outputMimeTypes.includes(result.mimeType)) {
    throw new Error(`Unexpected MIME type for ${contract.toolId}: ${result.mimeType}`);
  }

  if (contract.minOutputBytes !== undefined && result.byteLength < contract.minOutputBytes) {
    throw new Error(`Output too small for ${contract.toolId}: ${result.byteLength} bytes`);
  }

  if (contract.validateSignature && contract.signature) {
    if (!result.bytes) {
      throw new Error(`Signature validation requires bytes for ${contract.toolId}`);
    }

    const matches = contract.signature.every((byte, index) => result.bytes?.[index] === byte);
    if (!matches) {
      throw new Error(`Invalid output signature for ${contract.toolId}`);
    }
  }
}
