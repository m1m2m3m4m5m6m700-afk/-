import { test, expect } from "@playwright/test";
import { BrowserEdgeRuntime, EdgeCompatibleRuntime } from "../src/services/runtime/EdgeRuntime";
import { MemoryCache } from "../src/services/cache/CacheProvider";
import { MemoryPriorityQueue } from "../src/services/queue/QueueProvider";

test.describe("Phase 2 runtime contracts", () => {
  test("Edge runtime executes with explicit capability", async () => {
    const browser = new BrowserEdgeRuntime();
    const edge = new EdgeCompatibleRuntime();

    expect(browser.supportsWasm()).toBe(true);
    expect(edge.supportsWasm()).toBe(true);
    await expect(browser.execute(async (_input, context) => context.capability, null)).resolves.toBe("browser");
    await expect(edge.execute(async (_input, context) => context.capability, null)).resolves.toBe("edge");
  });

  test("Memory cache implements getOrSet without duplicate work", async () => {
    const cache = new MemoryCache();
    let calls = 0;
    const factory = async () => {
      calls += 1;
      return { value: "cached" };
    };

    await expect(cache.getOrSet("tool:key", factory)).resolves.toEqual({ value: "cached" });
    await expect(cache.getOrSet("tool:key", factory)).resolves.toEqual({ value: "cached" });
    expect(calls).toBe(1);
  });

  test("Priority queue returns high-priority work first", async () => {
    const queue = new MemoryPriorityQueue<{ tool: string }>();
    await queue.enqueue({ tool: "background" }, { priority: "background" });
    await queue.enqueue({ tool: "high" }, { priority: "high" });
    await queue.enqueue({ tool: "normal" }, { priority: "normal" });

    await expect(queue.dequeue()).resolves.toMatchObject({ payload: { tool: "high" } });
    await expect(queue.dequeue()).resolves.toMatchObject({ payload: { tool: "normal" } });
    await expect(queue.dequeue()).resolves.toMatchObject({ payload: { tool: "background" } });
    await expect(queue.size()).resolves.toBe(0);
  });
});
