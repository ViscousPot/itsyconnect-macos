import { describe, it, expect, vi } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/csrf";

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(hash).not.toBe("correct-horse-battery-staple");
    expect(hash.startsWith("$2")).toBe(true); // bcrypt prefix
    expect(await verifyPassword("correct-horse-battery-staple", hash)).toBe(
      true,
    );
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("correct-password");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces different hashes for the same password", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b); // different salts
  });
});

describe("rate limiter", () => {
  it("allows requests up to the limit", () => {
    const limiter = createRateLimiter(3, 60_000);
    expect(limiter.check("ip-1").allowed).toBe(true);
    expect(limiter.check("ip-1").allowed).toBe(true);
    expect(limiter.check("ip-1").allowed).toBe(true);
  });

  it("rejects requests over the limit", () => {
    const limiter = createRateLimiter(3, 60_000);
    limiter.check("ip-1");
    limiter.check("ip-1");
    limiter.check("ip-1");
    const result = limiter.check("ip-1");
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    const limiter = createRateLimiter(1, 60_000);
    expect(limiter.check("ip-1").allowed).toBe(true);
    expect(limiter.check("ip-2").allowed).toBe(true);
    expect(limiter.check("ip-1").allowed).toBe(false);
    expect(limiter.check("ip-2").allowed).toBe(false);
  });

  it("allows requests after window expires", () => {
    vi.useFakeTimers();

    const limiter = createRateLimiter(2, 1000);
    limiter.check("ip-1");
    limiter.check("ip-1");
    expect(limiter.check("ip-1").allowed).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(limiter.check("ip-1").allowed).toBe(true);

    vi.useRealTimers();
  });

  it("resets a specific key", () => {
    const limiter = createRateLimiter(1, 60_000);
    limiter.check("ip-1");
    expect(limiter.check("ip-1").allowed).toBe(false);
    limiter.reset("ip-1");
    expect(limiter.check("ip-1").allowed).toBe(true);
  });
});

describe("CSRF validation", () => {
  function makeRequest(url: string, origin?: string): Request {
    const headers = new Headers();
    if (origin) headers.set("origin", origin);
    return new Request(url, { headers });
  }

  it("accepts matching origin", () => {
    const req = makeRequest("https://example.com/api/setup", "https://example.com");
    expect(validateOrigin(req)).toBe(true);
  });

  it("rejects different origin", () => {
    const req = makeRequest("https://example.com/api/setup", "https://evil.com");
    expect(validateOrigin(req)).toBe(false);
  });

  it("rejects missing origin", () => {
    const req = makeRequest("https://example.com/api/setup");
    expect(validateOrigin(req)).toBe(false);
  });

  it("rejects different port", () => {
    const req = makeRequest("https://example.com/api/setup", "https://example.com:8080");
    expect(validateOrigin(req)).toBe(false);
  });

  it("rejects different protocol", () => {
    const req = makeRequest("https://example.com/api/setup", "http://example.com");
    expect(validateOrigin(req)).toBe(false);
  });
});
