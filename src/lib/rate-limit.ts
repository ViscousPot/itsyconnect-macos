interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
  const entries = new Map<string, RateLimitEntry>();

  // Clean up expired entries every minute
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of entries) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
      if (entry.timestamps.length === 0) {
        entries.delete(key);
      }
    }
  }, 60_000);

  // Allow cleanup timer to not prevent process exit
  if (cleanup.unref) {
    cleanup.unref();
  }

  function check(key: string): RateLimitResult {
    const now = Date.now();
    let entry = entries.get(key);

    if (!entry) {
      entry = { timestamps: [] };
      entries.set(key, entry);
    }

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= maxRequests) {
      const oldestInWindow = entry.timestamps[0];
      const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000);
      return { allowed: false, retryAfter };
    }

    entry.timestamps.push(now);
    return { allowed: true };
  }

  function reset(key: string): void {
    entries.delete(key);
  }

  return { check, reset };
}

export const authLimiter = createRateLimiter(5, 60_000);
export const apiLimiter = createRateLimiter(60, 60_000);
