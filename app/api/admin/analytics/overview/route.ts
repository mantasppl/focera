import { requireAdminApi } from "@/lib/admin/guard";
import { parsePreset, resolveDateRange } from "@/lib/analytics/dates";
import {
  getBrowserDistribution,
  getDailyUsage,
  getDeviceDistribution,
  getHourlyUsage,
  getOverviewStats,
  getPerToolStats,
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

    const [stats, tools, daily, hourly, topTools, devices, browsers] =
      await Promise.all([
        getOverviewStats(range),
        getPerToolStats(range, search),
        getDailyUsage(range),
        getHourlyUsage(range),
        getTopTools(range, 10),
        getDeviceDistribution(range),
        getBrowserDistribution(range),
      ]);

    return Response.json({
      ok: true,
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
      },
    });
  } catch (error) {
    console.error("[admin/analytics/overview]", error);
    return Response.json(
      { error: "Failed to load analytics." },
      { status: 500 },
    );
  }
}
