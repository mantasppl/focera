import { requireAdminApi } from "@/lib/admin/guard";
import { getToolBySlug } from "@/data/tools";
import {
  getPerToolRatingSummaries,
  getRatingOverview,
  listToolRatings,
  setRatingBaseCount,
} from "@/lib/ratings/store";
import { readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-ratings",
    limit: 60,
    windowMs: 60_000,
    requireCsrf: false,
  });
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const toolIdRaw = searchParams.get("toolId")?.trim() || "";
    const toolId =
      toolIdRaw && getToolBySlug(toolIdRaw) ? toolIdRaw : undefined;
    const limit = Number(searchParams.get("limit") || 50);
    const offset = Number(searchParams.get("offset") || 0);

    const [stats, tools, list] = await Promise.all([
      getRatingOverview(),
      getPerToolRatingSummaries(),
      listToolRatings({
        toolId,
        limit: Number.isFinite(limit) ? limit : 50,
        offset: Number.isFinite(offset) ? offset : 0,
      }),
    ]);

    return Response.json({
      ok: true,
      stats,
      tools,
      ratings: list.items,
      totalRatings: list.total,
      toolId: toolId || null,
    });
  } catch (error) {
    console.error("[admin/ratings]", error);
    return jsonError("Failed to load ratings.", 500);
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-ratings-mutate",
    limit: 60,
    windowMs: 60_000,
  });
  if (denied) return denied;

  const parsed = await readJsonBody<{
    toolId?: unknown;
    baseCount?: unknown;
  }>(request, 2_048);
  if (!parsed.ok) return parsed.response;

  const toolId =
    typeof parsed.data.toolId === "string" ? parsed.data.toolId.trim() : "";
  const baseCount = Number(parsed.data.baseCount);

  if (!toolId || !getToolBySlug(toolId)) {
    return jsonError("Invalid tool.", 400);
  }

  try {
    const saved = await setRatingBaseCount(toolId, baseCount);
    return Response.json({
      ok: true,
      toolId,
      baseCount: saved,
      displayCount: saved, // liveCount added on next GET
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "INVALID_BASE_COUNT") {
      return jsonError("Base count must be a whole number ≥ 0.", 400);
    }
    if (code === "UNKNOWN_TOOL") {
      return jsonError("Unknown tool.", 400);
    }
    console.error("[admin/ratings] patch failed:", error);
    return jsonError("Could not update base count.", 500);
  }
}
