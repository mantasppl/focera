import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { compare as bcryptCompare } from "bcryptjs";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { getAdminPath } from "@/lib/admin/config";

export const ADMIN_SESSION_COOKIE = "focera_admin_session";
export const ADMIN_CSRF_COOKIE = "focera_admin_csrf";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const SESSION_VERSION = 2 as const;

type SessionPayload = {
  v: typeof SESSION_VERSION;
  exp: number;
  sub: string;
};

function getUsername(): string | null {
  return process.env.ADMIN_USERNAME?.trim() || null;
}

function getPasswordHash(): string | null {
  return process.env.ADMIN_PASSWORD_HASH?.trim() || null;
}

export function getAdminSessionSecret(): string | null {
  const dedicated = process.env.ADMIN_SESSION_SECRET?.trim() || null;
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    if (!dedicated || dedicated.length < 32) return null;
    return dedicated;
  }

  if (dedicated && dedicated.length >= 16) return dedicated;
  // Dev-only fallback so local setup is not blocked before secrets exist.
  return "focera-dev-admin-session-secret";
}

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(getUsername() && getPasswordHash() && getAdminSessionSecret());
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // Still run a compare to reduce trivial timing oracles on length.
    timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const expectedUser = getUsername();
  const hash = getPasswordHash();
  if (!expectedUser || !hash) return false;

  const userOk = timingSafeStringEqual(username.trim(), expectedUser);
  let passOk = false;
  try {
    passOk = await bcryptCompare(password, hash);
  } catch {
    passOk = false;
  }
  return userOk && passOk;
}

export function createAdminSessionToken(username: string): string | null {
  const secret = getAdminSessionSecret();
  if (!secret) return null;

  const payload: SessionPayload = {
    v: SESSION_VERSION,
    exp: Date.now() + SESSION_TTL_MS,
    sub: username.trim().slice(0, 80),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${payloadB64}.${sign(payloadB64, secret)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null,
): { ok: true; username: string } | { ok: false } {
  const secret = getAdminSessionSecret();
  if (!token || !getUsername() || !secret) return { ok: false };

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return { ok: false };

  const expected = sign(payloadB64, secret);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return { ok: false };
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (payload.v !== SESSION_VERSION || typeof payload.exp !== "number") {
      return { ok: false };
    }
    if (!payload.sub || typeof payload.sub !== "string") return { ok: false };
    if (payload.exp <= Date.now()) return { ok: false };
    return { ok: true, username: payload.sub };
  } catch {
    return { ok: false };
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminAuthConfigured()) return false;
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value).ok;
}

/**
 * Cookie path is `/` (not ADMIN_PATH) so session/CSRF cookies survive the
 * proxy rewrite from `{ADMIN_PATH}/api/...` → `/api/admin/...`. Path-scoped
 * cookies are easy for Next.js `cookies()` / some runtimes to drop after rewrite.
 * HttpOnly + SameSite=Strict + secret URL still protect the session.
 */
export function adminCookieOptions(maxAgeSeconds = SESSION_TTL_MS / 1000) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** CSRF cookie must be readable by JS for double-submit. */
export function adminCsrfCookieOptions(maxAgeSeconds = SESSION_TTL_MS / 1000) {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Read a cookie from the raw Cookie header (reliable after rewrites). */
export function readCookieFromRequest(
  request: Request,
  name: string,
): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) continue;
    const value = trimmed.slice(name.length + 1);
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return undefined;
}

/** Clear session/CSRF on `/` and the legacy ADMIN_PATH cookie scope. */
export function clearAdminAuthCookies(response: NextResponse) {
  const legacyPath = getAdminPath();
  for (const path of ["/", legacyPath]) {
    response.cookies.set(ADMIN_SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path,
      maxAge: 0,
    });
    response.cookies.set(ADMIN_CSRF_COOKIE, "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path,
      maxAge: 0,
    });
  }
}

export function createCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function verifyCsrfToken(
  cookieToken: string | undefined | null,
  headerToken: string | undefined | null,
): boolean {
  if (!cookieToken || !headerToken) return false;
  return timingSafeStringEqual(cookieToken, headerToken);
}

export function generateAdminSessionSecret(): string {
  return randomBytes(48).toString("base64url");
}

export function generateAdminPathToken(): string {
  return randomBytes(6).toString("base64url").replace(/[^a-zA-Z0-9]/g, "x");
}
