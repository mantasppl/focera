import {
  ADMIN_CSRF_COOKIE,
  ADMIN_SESSION_COOKIE,
  isAdminAuthConfigured,
  readCookieFromRequest,
  verifyAdminSessionToken,
  verifyCsrfToken,
} from "@/lib/admin/auth";
import { isIpAllowed } from "@/lib/admin/config";
import { getClientIp, guardApiRequest } from "@/lib/security/request";

export async function requireAdminApi(
  request: Request,
  options: {
    bucket: string;
    limit: number;
    windowMs: number;
    requireCsrf?: boolean;
  },
): Promise<Response | null> {
  const ip = getClientIp(request);
  if (!isIpAllowed(ip)) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const rateLimited = guardApiRequest(request, {
    bucket: options.bucket,
    limit: options.limit,
    windowMs: options.windowMs,
    // Cookie is SameSite=Strict + CSRF on mutations; avoid Origin false negatives.
    requireSameOrigin: false,
  });
  if (rateLimited) return rateLimited;

  if (!isAdminAuthConfigured()) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Prefer the request Cookie header — path-scoped cookies can be missing from
  // next/headers cookies() after the admin proxy rewrite.
  const sessionToken = readCookieFromRequest(request, ADMIN_SESSION_COOKIE);
  const session = verifyAdminSessionToken(sessionToken);
  if (!session.ok) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (
    options.requireCsrf !== false &&
    request.method !== "GET" &&
    request.method !== "HEAD"
  ) {
    const csrfCookie = readCookieFromRequest(request, ADMIN_CSRF_COOKIE);
    const csrfHeader = request.headers.get("x-csrf-token");
    if (!verifyCsrfToken(csrfCookie, csrfHeader)) {
      return Response.json({ error: "Invalid CSRF token." }, { status: 403 });
    }
  }

  return null;
}
