import { NextResponse } from "next/server";
import {
  adminSessionCookieOptions,
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  isAdminAuthConfigured,
  verifyAdminPassword,
} from "@/lib/analytics/auth";
import { guardApiRequest, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "admin-login",
    limit: 8,
    windowMs: 15 * 60_000,
    requireSameOrigin: true,
    maxBodyBytes: 4_096,
  });
  if (guarded) return guarded;

  if (!isAdminAuthConfigured()) {
    return jsonError(
      "Admin access is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.",
      503,
    );
  }

  const parsed = await readJsonBody<{ password?: unknown }>(request, 4_096);
  if (!parsed.ok) return parsed.response;

  const password =
    typeof parsed.data.password === "string" ? parsed.data.password : "";
  if (!password || password.length > 200) {
    return jsonError("Invalid password.", 400);
  }

  if (!verifyAdminPassword(password)) {
    return jsonError("Incorrect password.", 401);
  }

  const token = createAdminSessionToken();
  if (!token) {
    return jsonError(
      "Admin session secret is misconfigured. Set a unique ADMIN_SESSION_SECRET (32+ chars).",
      503,
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    token,
    adminSessionCookieOptions(),
  );
  return response;
}
