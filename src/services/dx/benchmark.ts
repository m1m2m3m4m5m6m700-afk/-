export type BenchmarkResult = {
  name: string;
  durationMs: number;
};

export async function benchmark<T>(name: string, operation: () => Promise<T>): Promise<BenchmarkResult & { result: T }> {
  const started = performance.now();
  const result = await operation();
  return { name, durationMs: performance.now() - started, result };
}
