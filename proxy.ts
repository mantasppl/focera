import { NextResponse, type NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "focera_admin_session";

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

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function normalizeAdminPath(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let path = raw.trim();
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/+$/, "");
  if (!/^\/admin-[a-zA-Z0-9]{8,64}$/.test(path)) return null;
  return path;
}

function getAdminPath(): string {
  return (
    normalizeAdminPath(process.env.ADMIN_PATH) ||
    (process.env.NODE_ENV === "production"
      ? "/admin-unconfigured"
      : "/admin-dev-local")
  );
}

function getSessionSecret(): string | null {
  const dedicated = process.env.ADMIN_SESSION_SECRET?.trim() || null;
  if (process.env.NODE_ENV === "production") {
    if (!dedicated || dedicated.length < 32) return null;
    return dedicated;
  }
  if (dedicated && dedicated.length >= 16) return dedicated;
  return "focera-dev-admin-session-secret";
}

function isAuthConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_USERNAME?.trim() &&
      process.env.ADMIN_PASSWORD_HASH?.trim() &&
      getSessionSecret(),
  );
}

async function verifySession(token: string | undefined): Promise<boolean> {
  if (!isAuthConfigured() || !token) return false;
  const secret = getSessionSecret();
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
    const payload = JSON.parse(json) as {
      v?: number;
      exp?: number;
      sub?: string;
    };
    return (
      payload.v === 2 &&
      typeof payload.exp === "number" &&
      payload.exp > Date.now() &&
      typeof payload.sub === "string" &&
      payload.sub.length > 0
    );
  } catch {
    return false;
  }
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return request.headers.get("x-real-ip")?.trim().slice(0, 64) || "unknown";
}

function isIpAllowed(ip: string): boolean {
  const raw = process.env.ADMIN_ALLOWED_IPS?.trim();
  if (!raw) return true;
  const allowlist = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!allowlist.length) return true;
  if (ip === "unknown") return false;
  const normalized = ip.replace(/^::ffff:/i, "");
  return allowlist.some((allowed) => {
    const a = allowed.replace(/^::ffff:/i, "");
    return a === normalized || a === ip;
  });
}

function toInternalPath(pathname: string, adminPath: string): string | null {
  if (pathname === adminPath) return "/admin";
  if (!pathname.startsWith(`${adminPath}/`)) return null;
  const rest = pathname.slice(adminPath.length);
  if (rest === "/api" || rest.startsWith("/api/")) {
    return `/api/admin${rest.slice("/api".length)}`;
  }
  return `/admin${rest}`;
}

function isLegacyAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api/admin" ||
    pathname.startsWith("/api/admin/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminPath = getAdminPath();

  // Public /admin and /api/admin are intentionally removed.
  if (isLegacyAdminPath(pathname)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const internal = toInternalPath(pathname, adminPath);
  if (!internal) {
    return NextResponse.next();
  }

  if (!isIpAllowed(getClientIp(request))) {
    if (internal.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    return new NextResponse("Forbidden", { status: 403 });
  }

  const isLoginPage = internal === "/admin/login";
  const isLoginApi = internal === "/api/admin/auth/login";
  const isCsrfApi = internal === "/api/admin/auth/csrf";
  const isAdminApi = internal.startsWith("/api/admin");

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = internal;

  if (isLoginPage || isLoginApi || isCsrfApi) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (isLoginPage && (await verifySession(token))) {
      return NextResponse.redirect(
        new URL(`${adminPath}/analytics`, request.url),
      );
    }
    return NextResponse.rewrite(rewriteUrl);
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (await verifySession(token)) {
    return NextResponse.rewrite(rewriteUrl);
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const loginUrl = new URL(`${adminPath}/login`, request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin",
    "/api/admin/:path*",
    // Secret path shape: /admin-<token> and nested routes
    "/admin-:slug",
    "/admin-:slug/:path*",
  ],
};
