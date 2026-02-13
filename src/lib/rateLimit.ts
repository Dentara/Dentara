// src/lib/rateLimit.ts

type Bucket = {
  count: number;
  windowStart: number;
};

const store = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
};

/**
 * Sadə in-memory rate limit:
 *  - key: istənilən string (məs. "register:patient:email@test.com")
 *  - limit: pəncərə ərzində max request sayı
 *  - windowMs: pəncərə müddəti (millisecond)
 */
export function checkRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const { key, limit, windowMs } = params;
  const now = Date.now();

  const existing = store.get(key);
  if (!existing || now - existing.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    const retryAfterMs = existing.windowStart + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - existing.count) };
}
