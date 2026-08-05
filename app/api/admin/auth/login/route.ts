import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminCookieOptions,
  adminCsrfCookieOptions,
  ADMIN_CSRF_COOKIE,
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  createCsrfToken,
  isAdminAuthConfigured,
  verifyAdminCredentials,
  verifyCsrfToken,
} from "@/lib/admin/auth";
import { logAdminLogin } from "@/lib/admin/audit-log";
import { isIpAllowed } from "@/lib/admin/config";
import {
  checkLoginRateLimit,
  loginLimitHeaders,
} from "@/lib/admin/login-limit";
import { getClientIp, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

function jsonError(
  message: string,
  status: number,
  headers?: HeadersInit,
) {
  return NextResponse.json({ error: message }, { status, headers });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (!isIpAllowed(ip)) {
    return jsonError("Forbidden.", 403);
  }

  const limit = checkLoginRateLimit(ip);
  if (!limit.ok) {
    logAdminLogin({
      type: "admin_login_failure",
      usernameAttempt: "",
      ip,
      reason: "rate_limited",
    });
    return jsonError(
      "Too many login attempts. Try again in a few minutes.",
      429,
      loginLimitHeaders(limit),
    );
  }

  if (!isAdminAuthConfigured()) {
    return jsonError("Admin access is not configured.", 503);
  }

  const parsed = await readJsonBody<{
    username?: unknown;
    password?: unknown;
    csrfToken?: unknown;
  }>(request, 4_096);
  if (!parsed.ok) return parsed.response;

  const username =
    typeof parsed.data.username === "string" ? parsed.data.username : "";
  const password =
    typeof parsed.data.password === "string" ? parsed.data.password : "";
  const csrfFromBody =
    typeof parsed.data.csrfToken === "string" ? parsed.data.csrfToken : "";

  if (!username || username.length > 120 || !password || password.length > 200) {
    logAdminLogin({
      type: "admin_login_failure",
      usernameAttempt: username,
      ip,
      reason: "invalid_input",
    });
    return jsonError("Invalid credentials", 401, loginLimitHeaders(limit));
  }

  const jar = await cookies();
  const csrfHeader = request.headers.get("x-csrf-token") || csrfFromBody;
  if (!verifyCsrfToken(jar.get(ADMIN_CSRF_COOKIE)?.value, csrfHeader)) {
    logAdminLogin({
      type: "admin_login_failure",
      usernameAttempt: username,
      ip,
      reason: "csrf",
    });
    return jsonError("Invalid credentials", 401, loginLimitHeaders(limit));
  }

  const valid = await verifyAdminCredentials(username, password);
  if (!valid) {
    logAdminLogin({
      type: "admin_login_failure",
      usernameAttempt: username,
      ip,
      reason: "invalid_credentials",
    });
    return jsonError("Invalid credentials", 401, loginLimitHeaders(limit));
  }

  const token = createAdminSessionToken(username.trim());
  if (!token) {
    return jsonError("Admin session secret is misconfigured.", 503);
  }

  logAdminLogin({
    type: "admin_login_success",
    usernameAttempt: username.trim(),
    ip,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminCookieOptions());
  response.cookies.set(
    ADMIN_CSRF_COOKIE,
    createCsrfToken(),
    adminCsrfCookieOptions(),
  );
  return response;
}
