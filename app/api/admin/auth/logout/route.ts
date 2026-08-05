import { NextResponse } from "next/server";
import {
  ADMIN_CSRF_COOKIE,
  ADMIN_SESSION_COOKIE,
  adminCookieOptions,
  adminCsrfCookieOptions,
  verifyCsrfToken,
} from "@/lib/admin/auth";
import { requireAdminApi } from "@/lib/admin/guard";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-logout",
    limit: 30,
    windowMs: 60_000,
    requireCsrf: true,
  });
  if (denied) return denied;

  // Extra CSRF check already in requireAdminApi; keep cookies cleanup.
  const jar = await cookies();
  void verifyCsrfToken(
    jar.get(ADMIN_CSRF_COOKIE)?.value,
    request.headers.get("x-csrf-token"),
  );

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...adminCookieOptions(0),
    maxAge: 0,
  });
  response.cookies.set(ADMIN_CSRF_COOKIE, "", {
    ...adminCsrfCookieOptions(0),
    maxAge: 0,
  });
  return response;
}
