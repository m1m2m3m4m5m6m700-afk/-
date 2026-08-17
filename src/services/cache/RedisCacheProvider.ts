import type { CacheProvider, CacheValue } from "./CacheProvider";

export interface RedisLikeClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { PX?: number }): Promise<unknown>;
  del(key: string): Promise<unknown>;
}

export class RedisCacheProvider implements CacheProvider {
  constructor(private readonly client: RedisLikeClient) {}

  async get<T extends CacheValue>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  }

  async set<T extends CacheValue>(key: string, value: T, ttlMs = 60_000): Promise<void> {
    await this.client.set(key, JSON.stringify(value), ttlMs > 0 ? { PX: ttlMs } : undefined);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async getOrSet<T extends CacheValue>(key: string, factory: () => Promise<T>, ttlMs = 60_000): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await factory();
    await this.set(key, value, ttlMs);
    return value;
  }
}
