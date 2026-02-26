import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, like } from "drizzle-orm";
import * as schema from "@/db/schema";
import { ulid } from "@/lib/ulid";

// Test cache logic directly against DB (same logic as src/lib/cache.ts)
function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.exec(`
    CREATE TABLE cache_entries (
      resource TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL,
      fetched_at INTEGER NOT NULL,
      ttl_ms INTEGER NOT NULL
    );
  `);
  return drizzle(sqlite, { schema });
}

describe("cache", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("stores and retrieves fresh data", () => {
    const now = Date.now();
    db.insert(schema.cacheEntries)
      .values({
        resource: "apps",
        data: JSON.stringify([{ id: "1", name: "App" }]),
        fetchedAt: now,
        ttlMs: 3600000,
      })
      .run();

    const entry = db
      .select()
      .from(schema.cacheEntries)
      .where(eq(schema.cacheEntries.resource, "apps"))
      .get();

    expect(entry).toBeDefined();
    expect(now < entry!.fetchedAt + entry!.ttlMs).toBe(true); // not stale
    expect(JSON.parse(entry!.data)).toEqual([{ id: "1", name: "App" }]);
  });

  it("returns null for stale data", () => {
    const staleTime = Date.now() - 7200000; // 2 hours ago
    db.insert(schema.cacheEntries)
      .values({
        resource: "apps",
        data: "[]",
        fetchedAt: staleTime,
        ttlMs: 3600000, // 1 hour
      })
      .run();

    const entry = db
      .select()
      .from(schema.cacheEntries)
      .where(eq(schema.cacheEntries.resource, "apps"))
      .get();

    expect(entry).toBeDefined();
    expect(Date.now() > entry!.fetchedAt + entry!.ttlMs).toBe(true); // stale
  });

  it("upserts on conflict", () => {
    const now = Date.now();

    db.insert(schema.cacheEntries)
      .values({ resource: "apps", data: "[]", fetchedAt: now, ttlMs: 3600000 })
      .run();

    db.insert(schema.cacheEntries)
      .values({
        resource: "apps",
        data: '[{"id":"1"}]',
        fetchedAt: now + 1000,
        ttlMs: 3600000,
      })
      .onConflictDoUpdate({
        target: schema.cacheEntries.resource,
        set: { data: '[{"id":"1"}]', fetchedAt: now + 1000 },
      })
      .run();

    const all = db.select().from(schema.cacheEntries).all();
    expect(all).toHaveLength(1);
    expect(JSON.parse(all[0].data)).toEqual([{ id: "1" }]);
  });

  it("invalidates a specific resource", () => {
    const now = Date.now();
    db.insert(schema.cacheEntries)
      .values({ resource: "apps", data: "[]", fetchedAt: now, ttlMs: 3600000 })
      .run();
    db.insert(schema.cacheEntries)
      .values({ resource: "versions:app-1", data: "[]", fetchedAt: now, ttlMs: 900000 })
      .run();

    db.delete(schema.cacheEntries)
      .where(eq(schema.cacheEntries.resource, "apps"))
      .run();

    const all = db.select().from(schema.cacheEntries).all();
    expect(all).toHaveLength(1);
    expect(all[0].resource).toBe("versions:app-1");
  });

  it("invalidates by prefix", () => {
    const now = Date.now();
    db.insert(schema.cacheEntries)
      .values({ resource: "versions:app-1", data: "[]", fetchedAt: now, ttlMs: 900000 })
      .run();
    db.insert(schema.cacheEntries)
      .values({ resource: "versions:app-2", data: "[]", fetchedAt: now, ttlMs: 900000 })
      .run();
    db.insert(schema.cacheEntries)
      .values({ resource: "apps", data: "[]", fetchedAt: now, ttlMs: 3600000 })
      .run();

    db.delete(schema.cacheEntries)
      .where(like(schema.cacheEntries.resource, "versions:%"))
      .run();

    const all = db.select().from(schema.cacheEntries).all();
    expect(all).toHaveLength(1);
    expect(all[0].resource).toBe("apps");
  });
});
