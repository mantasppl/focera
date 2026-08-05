import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "focera_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const DEV_FALLBACK_SECRET = "focera-dev-admin-secret";

type SessionPayload = {
  v: 1;
  exp: number;
};

function getPassword(): string | null {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

/**
 * Session HMAC secret. In production a dedicated ADMIN_SESSION_SECRET (>=32 chars)
 * is required and must differ from ADMIN_PASSWORD.
 */
export function getAdminSessionSecret(): string | null {
  const dedicated = process.env.ADMIN_SESSION_SECRET?.trim() || null;
  const password = getPassword();
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    if (!dedicated || dedicated.length < 32) return null;
    if (password && dedicated === password) return null;
    return dedicated;
  }

  if (dedicated && dedicated.length >= 16) return dedicated;
  if (password && password.length >= 8) {
    // Dev convenience only — never used in production.
    return createHmac("sha256", DEV_FALLBACK_SECRET)
      .update(password)
      .digest("hex");
  }
  return DEV_FALLBACK_SECRET;
}

function getSecret(): string | null {
  return getAdminSessionSecret();
}

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(getPassword() && getSecret());
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getPassword();
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createAdminSessionToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const payload: SessionPayload = {
    v: 1,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${payloadB64}.${sign(payloadB64, secret)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  const secret = getSecret();
  if (!token || !getPassword() || !secret) return false;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  const expected = sign(payloadB64, secret);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (payload.v !== 1 || typeof payload.exp !== "number") return false;
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminAuthConfigured()) return false;
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value);
}

export function adminSessionCookieOptions(maxAgeSeconds = SESSION_TTL_MS / 1000) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Generate a production-ready session secret (CLI / docs helper). */
export function generateAdminSessionSecret(): string {
  return randomBytes(48).toString("base64url");
}
