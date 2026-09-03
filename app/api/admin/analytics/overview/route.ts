import { requireAdminApi } from "@/lib/admin/guard";
import { parsePreset, resolveDateRange } from "@/lib/analytics/dates";
import { getAnalyticsStorageMode } from "@/lib/analytics/db";
import {
  getBrowserDistribution,
  getDailyUsage,
  getDeviceDistribution,
  getHourlyUsage,
  getOverviewStats,
  getPerToolStats,
  getSourceDistribution,
  getTopTools,
} from "@/lib/analytics/queries";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-overview",
    limit: 60,
    windowMs: 60_000,
    requireCsrf: false,
  });
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const preset = parsePreset(searchParams.get("preset"));
    const range = resolveDateRange(
      preset,
      searchParams.get("start"),
      searchParams.get("end"),
    );
    const search = searchParams.get("search") || undefined;

    const [stats, tools, daily, hourly, topTools, devices, browsers, sources] =
      await Promise.all([
        getOverviewStats(range),
        getPerToolStats(range, search),
        getDailyUsage(range),
        getHourlyUsage(range),
        getTopTools(range, 10),
        getDeviceDistribution(range),
        getBrowserDistribution(range),
        getSourceDistribution(range),
      ]);

    const storage = getAnalyticsStorageMode();

    return Response.json({
      ok: true,
      storage,
      warning:
        storage === "ephemeral"
          ? "Analytics storage is ephemeral on this host. Set DATABASE_URL to a Turso libsql:// URL and DATABASE_AUTH_TOKEN in Vercel for durable production data."
          : undefined,
      range: {
        preset: range.preset,
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      },
      stats,
      tools,
      charts: {
        daily,
        hourly,
        topTools,
        devices,
        browsers,
        sources,
      },
    });
  } catch (error) {
    console.error("[admin/analytics/overview]", error);
    const storage = getAnalyticsStorageMode();
    const message =
      storage === "ephemeral"
        ? "Analytics database unavailable. On Vercel, set DATABASE_URL (Turso libsql://…) and DATABASE_AUTH_TOKEN."
        : "Failed to load analytics.";
    return Response.json({ error: message, storage }, { status: 500 });
  }
}
