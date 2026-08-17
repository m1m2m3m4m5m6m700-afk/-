export type QueuePriority = "high" | "normal" | "low" | "background";

export type QueueJob<T> = {
  id: string;
  payload: T;
  priority: QueuePriority;
  attempts: number;
  maxAttempts: number;
};

export interface QueueProvider<T> {
  enqueue(payload: T, options?: { id?: string; priority?: QueuePriority; maxAttempts?: number }): Promise<string>;
  dequeue(): Promise<QueueJob<T> | null>;
  size(): number;
}

const PRIORITY_WEIGHT: Record<QueuePriority, number> = {
  high: 4,
  normal: 3,
  low: 2,
  background: 1,
};

export class MemoryPriorityQueue<T> implements QueueProvider<T> {
  private readonly jobs: QueueJob<T>[] = [];
  private sequence = 0;

  async enqueue(payload: T, options: { id?: string; priority?: QueuePriority; maxAttempts?: number } = {}): Promise<string> {
    const id = options.id ?? `job-${Date.now()}-${++this.sequence}`;
    if (this.jobs.some((job) => job.id === id)) throw new Error(`Duplicate queue job id: ${id}`);
    this.jobs.push({
      id,
      payload,
      priority: options.priority ?? "normal",
      attempts: 0,
      maxAttempts: options.maxAttempts ?? 3,
    });
    return id;
  }

  async dequeue(): Promise<QueueJob<T> | null> {
    if (this.jobs.length === 0) return null;
    this.jobs.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
    return this.jobs.shift() ?? null;
  }

  size(): number {
    return this.jobs.length;
  }
}
