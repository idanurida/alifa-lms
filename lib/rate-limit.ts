// lib/rate-limit.ts — Simple in-memory rate limiter
// Untuk production, gunakan Upstash Redis atau similar

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup entries setiap 60 detik
const CLEANUP_INTERVAL = 60_000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

interface RateLimitOptions {
  windowMs?: number;   // Window waktu dalam ms (default: 60 detik)
  maxRequests?: number; // Maksimal request per window (default: 5)
  identifier?: string;  // Prefix untuk key (default: IP-based)
}

export function rateLimit(opts: RateLimitOptions = {}) {
  const {
    windowMs = 60_000,
    maxRequests = 5,
    identifier = 'global',
  } = opts;

  return function check(key: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const storeKey = `${identifier}:${key}`;
    const entry = store.get(storeKey);

    if (!entry || entry.resetAt < now) {
      // First request or window expired — reset
      store.set(storeKey, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
    }

    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.resetAt - now };
  };
}

// Pre-configured rate limiters
export const authRateLimit = rateLimit({
  windowMs: 60_000,    // 1 menit
  maxRequests: 5,      // 5 percobaan login
  identifier: 'auth',
});

export const apiRateLimit = rateLimit({
  windowMs: 60_000,    // 1 menit
  maxRequests: 60,     // 60 request per menit
  identifier: 'api',
});
