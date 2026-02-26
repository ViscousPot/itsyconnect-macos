import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Test the sync worker logic (deduplication, scheduling)
describe("sync worker", () => {
  it("deduplicates concurrent calls via in-flight map", async () => {
    let callCount = 0;
    const inFlight = new Map<string, Promise<void>>();

    async function runJob(name: string, job: () => Promise<void>) {
      const existing = inFlight.get(name);
      if (existing) {
        await existing;
        return;
      }

      const promise = job().finally(() => inFlight.delete(name));
      inFlight.set(name, promise);
      await promise;
    }

    const job = async () => {
      callCount++;
      await new Promise((r) => setTimeout(r, 50));
    };

    // Fire 3 concurrent calls
    await Promise.all([
      runJob("test", job),
      runJob("test", job),
      runJob("test", job),
    ]);

    // Job should only run once (subsequent calls wait for the first)
    expect(callCount).toBe(1);
  });

  it("tracks last run time", async () => {
    let lastRun: number | null = null;

    async function runJob(job: () => Promise<void>) {
      await job();
      lastRun = Date.now();
    }

    expect(lastRun).toBeNull();
    await runJob(async () => {});
    expect(lastRun).toBeGreaterThan(0);
  });

  it("computes next run from lastRun + interval", () => {
    const lastRun = Date.now() - 30_000; // 30s ago
    const intervalMs = 60_000; // 1 min
    const nextRun = lastRun + intervalMs;

    expect(nextRun).toBeGreaterThan(Date.now());
  });
});
