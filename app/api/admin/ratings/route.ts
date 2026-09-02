import { requireAdminApi } from "@/lib/admin/guard";
import { getToolBySlug } from "@/data/tools";
import {
  getPerToolRatingSummaries,
  getRatingOverview,
  listToolRatings,
} from "@/lib/ratings/store";

export const runtime = "nodejs";

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
    return Response.json({ error: "Failed to load ratings." }, { status: 500 });
  }
}
