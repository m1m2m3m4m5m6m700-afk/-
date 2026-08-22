import type { ToolOutputContract } from './tool-output';
import { imageCompressorOutputContract } from '../../tools/image-compressor/output-contract';

export const TOOL_OUTPUT_CONTRACTS = {
  'image-compressor': imageCompressorOutputContract,
} as const satisfies Record<string, ToolOutputContract>;

export function getToolOutputContract(toolId: string): ToolOutputContract | undefined {
  return TOOL_OUTPUT_CONTRACTS[toolId as keyof typeof TOOL_OUTPUT_CONTRACTS];
}
