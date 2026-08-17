import type { QueueJob, QueuePriority, QueueProvider } from "./QueueProvider";

export interface BullLikeQueue<T> {
  add(name: string, data: T, options?: { jobId?: string; priority?: number; attempts?: number; backoff?: { type: "exponential"; delay: number } }): Promise<{ id?: string | number }>;
  getJobs(types: string[], start?: number, end?: number): Promise<Array<{ id?: string | number; data: T; opts?: { priority?: number; attempts?: number } }>>;
}

const PRIORITY_WEIGHT: Record<QueuePriority, number> = {
  high: 1,
  normal: 5,
  low: 10,
  background: 20,
};

export class BullMqQueueProvider<T> implements QueueProvider<T> {
  constructor(private readonly queue: BullLikeQueue<T>) {}

  async enqueue(payload: T, options: { id?: string; priority?: QueuePriority; maxAttempts?: number } = {}): Promise<string> {
    const job = await this.queue.add("flixo-tool", payload, {
      jobId: options.id,
      priority: PRIORITY_WEIGHT[options.priority ?? "normal"],
      attempts: options.maxAttempts ?? 3,
      backoff: { type: "exponential", delay: 500 },
    });
    return String(job.id ?? options.id ?? crypto.randomUUID());
  }

  async dequeue(): Promise<QueueJob<T> | null> {
    const jobs = await this.queue.getJobs(["waiting", "delayed"], 0, 0);
    const job = jobs[0];
    if (!job) return null;
    return {
      id: String(job.id),
      payload: job.data,
      priority: "normal",
      attempts: job.opts?.attempts ?? 0,
      maxAttempts: job.opts?.attempts ?? 3,
    };
  }

  async size(): Promise<number> {
    const jobs = await this.queue.getJobs(["waiting", "delayed"], 0, -1);
    return jobs.length;
  }
}
