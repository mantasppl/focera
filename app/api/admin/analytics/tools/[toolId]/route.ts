import { getToolBySlug } from "@/data/tools";
import { requireAdminApi } from "@/lib/admin/guard";
import { parsePreset, resolveDateRange } from "@/lib/analytics/dates";
import { getToolDetail } from "@/lib/analytics/queries";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ toolId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-tool-detail",
    limit: 60,
    windowMs: 60_000,
    requireCsrf: false,
  });
  if (denied) return denied;

  const { toolId: rawId } = await context.params;
  const toolId = decodeURIComponent(rawId || "").trim();
  if (!toolId || !getToolBySlug(toolId)) {
    return Response.json({ error: "Unknown tool." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const preset = parsePreset(searchParams.get("preset"));
  const range = resolveDateRange(
    preset,
    searchParams.get("start"),
    searchParams.get("end"),
  );

  const detail = await getToolDetail(toolId, range);
  if (!detail) {
    return Response.json({ error: "Unknown tool." }, { status: 404 });
  }

  return Response.json({
    ok: true,
    range: {
      preset: range.preset,
      start: range.start.toISOString(),
      end: range.end.toISOString(),
    },
    detail,
  });
}
