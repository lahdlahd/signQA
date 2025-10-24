type RateLimitStats = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_BUCKET = new Map<string, RateLimitStats>();

export function checkRateLimit({
  key,
  limit,
  windowMs
}: {
  key: string;
  limit: number;
  windowMs: number;
}): {
  limited: boolean;
  remaining: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const entry = RATE_LIMIT_BUCKET.get(key);
  if (!entry || entry.resetAt < now) {
    RATE_LIMIT_BUCKET.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    return {
      limited: false,
      remaining: limit - 1
    };
  }

  entry.count += 1;
  RATE_LIMIT_BUCKET.set(key, entry);

  if (entry.count > limit) {
    return {
      limited: true,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000)
    };
  }

  return {
    limited: false,
    remaining: Math.max(0, limit - entry.count)
  };
}
