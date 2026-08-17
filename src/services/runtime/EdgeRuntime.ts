export type RuntimeCapability = "edge" | "browser" | "node";

export type RuntimeContext = {
  capability: RuntimeCapability;
  signal?: AbortSignal;
};

export type ToolExecutor<Input, Output> = (input: Input, context: RuntimeContext) => Promise<Output>;

export interface EdgeRuntime {
  readonly capability: RuntimeCapability;
  supportsWasm(): boolean;
  execute<Input, Output>(
    executor: ToolExecutor<Input, Output>,
    input: Input,
    context?: Omit<RuntimeContext, "capability">,
  ): Promise<Output>;
}

export class BrowserEdgeRuntime implements EdgeRuntime {
  readonly capability = "browser" as const;

  supportsWasm(): boolean {
    return typeof WebAssembly !== "undefined";
  }

  execute<Input, Output>(
    executor: ToolExecutor<Input, Output>,
    input: Input,
    context: Omit<RuntimeContext, "capability"> = {},
  ): Promise<Output> {
    return executor(input, { ...context, capability: this.capability });
  }
}

export class EdgeCompatibleRuntime implements EdgeRuntime {
  readonly capability = "edge" as const;

  supportsWasm(): boolean {
    return typeof WebAssembly !== "undefined";
  }

  execute<Input, Output>(
    executor: ToolExecutor<Input, Output>,
    input: Input,
    context: Omit<RuntimeContext, "capability"> = {},
  ): Promise<Output> {
    return executor(input, { ...context, capability: this.capability });
  }
}
