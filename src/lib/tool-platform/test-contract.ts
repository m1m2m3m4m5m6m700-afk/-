import type { ToolManifest } from "./types";

export interface ToolTestContract {
  readonly manifestId: string;
  readonly happyPath: () => Promise<void> | void;
  readonly invalidInput?: () => Promise<void> | void;
  readonly boundary?: () => Promise<void> | void;
}

export function assertTestContract(contract: ToolTestContract, manifest: ToolManifest): void {
  if (contract.manifestId !== manifest.id) {
    throw new Error(`Tool test contract mismatch: ${contract.manifestId} != ${manifest.id}`);
  }
  if (typeof contract.happyPath !== "function") {
    throw new Error(`Tool ${manifest.id} must provide a happy-path test.`);
  }
}

export async function runToolContract(
  contract: ToolTestContract,
  manifest: ToolManifest,
): Promise<void> {
  assertTestContract(contract, manifest);
  await contract.happyPath();
  if (contract.invalidInput) await contract.invalidInput();
  if (contract.boundary) await contract.boundary();
}
