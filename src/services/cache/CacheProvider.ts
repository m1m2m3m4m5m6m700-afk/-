export type CacheValue = string | number | boolean | Record<string, unknown> | unknown[];

export interface CacheProvider {
  get<T extends CacheValue>(key: string): Promise<T | null>;
  set<T extends CacheValue>(key: string, value: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
  getOrSet<T extends CacheValue>(key: string, factory: () => Promise<T>, ttlMs?: number): Promise<T>;
}

export class MemoryCache implements CacheProvider {
  private readonly entries = new Map<string, { value: CacheValue; expiresAt: number | null }>();

  async get<T extends CacheValue>(key: string): Promise<T | null> {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T extends CacheValue>(key: string, value: T, ttlMs = 60_000): Promise<void> {
    this.entries.set(key, { value, expiresAt: ttlMs > 0 ? Date.now() + ttlMs : null });
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key);
  }

  async getOrSet<T extends CacheValue>(key: string, factory: () => Promise<T>, ttlMs = 60_000): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await factory();
    await this.set(key, value, ttlMs);
    return value;
  }
}
