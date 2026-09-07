import { getPublicToolRating } from "@/lib/ratings/store";
import { getToolBySlug } from "@/data/tools";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "tool-rating-public",
    limit: 120,
    windowMs: 60_000,
    requireSameOrigin: false,
  });
  if (guarded) return guarded;

  const toolSlug =
    new URL(request.url).searchParams.get("toolSlug")?.trim() ?? "";
  if (!toolSlug || !/^[a-z0-9-]{1,80}$/.test(toolSlug)) {
    return jsonError("Invalid tool.", 400);
  }

  const tool = getToolBySlug(toolSlug);
  if (!tool || tool.status !== "ready") {
    return jsonError("Unknown tool.", 400);
  }

  try {
    const rating = await getPublicToolRating(tool.slug);
    return Response.json(rating);
  } catch (error) {
    console.error("[ratings] public get failed:", error);
    return jsonError("Could not load rating.", 502);
  }
}
