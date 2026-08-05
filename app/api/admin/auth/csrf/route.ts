import { NextResponse } from "next/server";
import {
  ADMIN_CSRF_COOKIE,
  adminCsrfCookieOptions,
  createCsrfToken,
  isAdminAuthConfigured,
} from "@/lib/admin/auth";
import { isIpAllowed } from "@/lib/admin/config";
import { getClientIp, guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";

/** Issue a CSRF cookie + token for the admin login form. */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  if (!isIpAllowed(ip)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const guarded = guardApiRequest(request, {
    bucket: "admin-csrf",
    limit: 60,
    windowMs: 60_000,
  });
  if (guarded) return guarded;

  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin access is not configured." },
      { status: 503 },
    );
  }

  const token = createCsrfToken();
  const response = NextResponse.json({ csrfToken: token });
  response.cookies.set(ADMIN_CSRF_COOKIE, token, adminCsrfCookieOptions());
  return response;
}
