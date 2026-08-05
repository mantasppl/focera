import { NextResponse, type NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "focera_admin_session";
const DEV_FALLBACK_SECRET = "focera-dev-admin-secret";

function toBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < arr.length; i += 1) {
    binary += String.fromCharCode(arr[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSign(payloadB64: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64),
  );
  return toBase64Url(signature);
}

async function deriveDevSecret(password: string): Promise<string> {
  // Mirror Node createHmac('sha256', DEV_FALLBACK).update(password).digest('hex')
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(DEV_FALLBACK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(password),
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function resolveSessionSecret(): Promise<string | null> {
  const dedicated = process.env.ADMIN_SESSION_SECRET?.trim() || null;
  const password = process.env.ADMIN_PASSWORD?.trim() || null;
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    if (!dedicated || dedicated.length < 32) return null;
    if (password && dedicated === password) return null;
    return dedicated;
  }

  if (dedicated && dedicated.length >= 16) return dedicated;
  if (password && password.length >= 8) return deriveDevSecret(password);
  return DEV_FALLBACK_SECRET;
}

async function verifySession(token: string | undefined): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password || !token) return false;

  const secret = await resolveSessionSecret();
  if (!secret) return false;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  try {
    const expected = await hmacSign(payloadB64, secret);
    if (!timingSafeEqualString(signature, expected)) return false;

    const padded =
      payloadB64.replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (payloadB64.length % 4)) % 4);
    const json = atob(padded);
    const payload = JSON.parse(json) as { v?: number; exp?: number };
    return payload.v === 1 && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/auth/login";
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (isLoginPage || isLoginApi) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (isLoginPage && (await verifySession(token))) {
      return NextResponse.redirect(new URL("/admin/analytics", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (await verifySession(token)) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
