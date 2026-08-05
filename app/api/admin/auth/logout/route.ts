import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
} from "@/lib/analytics/auth";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "admin-logout",
    limit: 30,
    windowMs: 60_000,
    requireSameOrigin: true,
  });
  if (guarded) return guarded;

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...adminSessionCookieOptions(0),
    maxAge: 0,
  });
  return response;
}
