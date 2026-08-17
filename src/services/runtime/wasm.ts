export type WasmModule = WebAssembly.WebAssemblyInstantiatedSource;

export function supportsWasm(): boolean {
  return typeof WebAssembly !== "undefined";
}

export async function instantiateWasm(bytes: BufferSource, imports?: WebAssembly.Imports): Promise<WasmModule> {
  if (!supportsWasm()) {
    throw new Error("WebAssembly is not supported by this runtime.");
  }
  return WebAssembly.instantiate(bytes, imports);
}
