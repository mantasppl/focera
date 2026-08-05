import {
  consumeRateLimit,
  rateLimitHeaders,
  type RateLimitResult,
} from "@/lib/security/rate-limit";

type LockState = {
  blockedUntil: number;
};

const locks = new Map<string, LockState>();

const ATTEMPT_LIMIT = 5;
const ATTEMPT_WINDOW_MS = 60_000;
const BLOCK_MS = 10 * 60_000;

function sweepLocks(now: number) {
  for (const [key, value] of locks) {
    if (value.blockedUntil <= now) locks.delete(key);
  }
}

export type LoginLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number; blocked: boolean };

/**
 * Login protection: max 5 attempts / minute / IP.
 * Exceeding the limit blocks the IP for 10 minutes.
 */
export function checkLoginRateLimit(ip: string): LoginLimitResult {
  const now = Date.now();
  sweepLocks(now);

  const lock = locks.get(ip);
  if (lock && lock.blockedUntil > now) {
    return {
      ok: false,
      blocked: true,
      retryAfterSec: Math.max(1, Math.ceil((lock.blockedUntil - now) / 1000)),
    };
  }

  const result = consumeRateLimit(
    `admin-login-attempt:${ip}`,
    ATTEMPT_LIMIT,
    ATTEMPT_WINDOW_MS,
  );

  if (!result.ok) {
    locks.set(ip, { blockedUntil: now + BLOCK_MS });
    return {
      ok: false,
      blocked: true,
      retryAfterSec: Math.ceil(BLOCK_MS / 1000),
    };
  }

  return { ok: true, remaining: result.remaining };
}

export function loginLimitHeaders(
  result: LoginLimitResult,
): HeadersInit {
  if (result.ok) {
    const fake: RateLimitResult = {
      ok: true,
      remaining: result.remaining,
      resetAt: Date.now() + ATTEMPT_WINDOW_MS,
    };
    return rateLimitHeaders(fake, ATTEMPT_LIMIT);
  }
  return {
    "Retry-After": String(result.retryAfterSec),
    "X-RateLimit-Limit": String(ATTEMPT_LIMIT),
    "X-RateLimit-Remaining": "0",
  };
}
