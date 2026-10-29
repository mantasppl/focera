import { requireAdminApi } from "@/lib/admin/guard";
import { parseRepeatPeriod } from "@/lib/analytics/dates";
import { getAnalyticsStorageMode } from "@/lib/analytics/db";
import { getRepeatSectionStats } from "@/lib/analytics/queries";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-repeat",
    limit: 60,
    windowMs: 60_000,
    requireCsrf: false,
  });
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const period = parseRepeatPeriod(searchParams.get("period"));
    const stats = await getRepeatSectionStats(period);
    return Response.json({
      ok: true,
      storage: getAnalyticsStorageMode(),
      ...stats,
    });
  } catch (error) {
    console.error("[admin/analytics/repeat]", error);
    const storage = getAnalyticsStorageMode();
    const message =
      storage === "ephemeral"
        ? "Analytics database unavailable. On Vercel, set DATABASE_URL (Turso libsql://…) and DATABASE_AUTH_TOKEN."
        : "Failed to load repeat users.";
    return Response.json({ error: message, storage }, { status: 500 });
  }
}
