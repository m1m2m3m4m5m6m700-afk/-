export type AIProviderId = string;

export type AIRequest = {
  task: string;
  input: unknown;
  signal?: AbortSignal;
};

export type AIResponse = {
  provider: AIProviderId;
  output: unknown;
};

export type AIProvider = {
  id: AIProviderId;
  supports(task: string): boolean;
  run(request: AIRequest): Promise<AIResponse>;
};

export type AIRouterOptions = {
  providers: readonly AIProvider[];
  fallbackOrder?: readonly AIProviderId[];
};

export class AIRouter {
  private readonly providers: readonly AIProvider[];
  private readonly fallbackOrder: readonly AIProviderId[];

  constructor(options: AIRouterOptions) {
    this.providers = options.providers;
    this.fallbackOrder = options.fallbackOrder ?? options.providers.map((provider) => provider.id);
  }

  async run(request: AIRequest): Promise<AIResponse> {
    const candidates = this.fallbackOrder
      .map((id) => this.providers.find((provider) => provider.id === id))
      .filter((provider): provider is AIProvider => Boolean(provider))
      .filter((provider) => provider.supports(request.task));

    if (candidates.length === 0) {
      throw new Error(`No AI provider supports task: ${request.task}`);
    }

    const failures: string[] = [];
    for (const provider of candidates) {
      try {
        return await provider.run(request);
      } catch (error) {
        failures.push(`${provider.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    throw new Error(`All AI providers failed. ${failures.join(" | ")}`);
  }
}
