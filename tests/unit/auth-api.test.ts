import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { ulid } from "@/lib/ulid";

function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  return drizzle(sqlite, { schema });
}

describe("auth API flow", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("login: correct credentials verify successfully", async () => {
    const hash = await hashPassword("correct-password");
    const now = new Date().toISOString();

    db.insert(schema.users)
      .values({
        id: ulid(),
        name: "Admin",
        email: "admin@example.com",
        passwordHash: hash,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const user = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, "admin@example.com"))
      .get();

    expect(user).toBeDefined();
    expect(await verifyPassword("correct-password", user!.passwordHash)).toBe(true);
  });

  it("login: wrong password is rejected", async () => {
    const hash = await hashPassword("correct-password");
    const now = new Date().toISOString();

    db.insert(schema.users)
      .values({
        id: ulid(),
        name: "Admin",
        email: "admin@example.com",
        passwordHash: hash,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const user = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, "admin@example.com"))
      .get();

    expect(await verifyPassword("wrong-password", user!.passwordHash)).toBe(false);
  });

  it("login: non-existent email returns no user", () => {
    const user = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, "nobody@example.com"))
      .get();

    expect(user).toBeUndefined();
  });

  it("rate limiting: blocks after 5 attempts", () => {
    const limiter = createRateLimiter(5, 60_000);
    const ip = "192.168.1.1";

    for (let i = 0; i < 5; i++) {
      expect(limiter.check(ip).allowed).toBe(true);
    }

    const result = limiter.check(ip);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("me: returns user data for valid user ID", async () => {
    const userId = ulid();
    const now = new Date().toISOString();

    db.insert(schema.users)
      .values({
        id: userId,
        name: "Jane",
        email: "jane@example.com",
        passwordHash: await hashPassword("password"),
        role: "admin",
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const user = db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();

    expect(user).toEqual({
      id: userId,
      name: "Jane",
      email: "jane@example.com",
      role: "admin",
    });
  });

  it("me: returns undefined for invalid user ID", () => {
    const user = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, "nonexistent"))
      .get();

    expect(user).toBeUndefined();
  });
});
