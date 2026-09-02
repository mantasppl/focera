import { requireAdminApi } from "@/lib/admin/guard";
import { getAnalyticsStorageMode } from "@/lib/analytics/db";
import { getSiteTrafficStats } from "@/lib/analytics/traffic";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-traffic",
    limit: 120,
    windowMs: 60_000,
    requireCsrf: false,
  });
  if (denied) return denied;

  try {
    const traffic = await getSiteTrafficStats();
    return Response.json({
      ok: true,
      storage: getAnalyticsStorageMode(),
      traffic,
    });
  } catch (error) {
    console.error("[admin/analytics/traffic]", error);
    const storage = getAnalyticsStorageMode();
    const message =
      storage === "ephemeral"
        ? "Analytics database unavailable. On Vercel, set DATABASE_URL (Turso libsql://…) and DATABASE_AUTH_TOKEN."
        : "Failed to load traffic.";
    return Response.json({ error: message, storage }, { status: 500 });
  }
}
