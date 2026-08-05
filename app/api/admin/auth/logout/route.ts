import { NextResponse } from "next/server";
import { clearAdminAuthCookies } from "@/lib/admin/auth";
import { requireAdminApi } from "@/lib/admin/guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-logout",
    limit: 30,
    windowMs: 60_000,
    requireCsrf: true,
  });
  if (denied) return denied;

  const response = NextResponse.json({ ok: true });
  clearAdminAuthCookies(response);
  return response;
}
