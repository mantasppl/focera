import { isAdminAuthenticated } from "@/lib/analytics/auth";
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
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "admin-overview",
    limit: 60,
    windowMs: 60_000,
    // Cookie auth + SameSite=strict; avoid Origin/Referer false negatives on GET.
  });
  if (guarded) return guarded;

  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

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
}
