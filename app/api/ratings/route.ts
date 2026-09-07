import { sendRatingCommentEmail } from "@/lib/ratings/email";
import { getPublicToolRating, insertToolRating } from "@/lib/ratings/store";
import { validateRatingPayload } from "@/lib/ratings/validate";
import { getToolBySlug } from "@/data/tools";
import { guardApiRequest, readJsonBody } from "@/lib/security/request";

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

export async function POST(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "tool-rating",
    limit: 20,
    windowMs: 900_000,
    requireSameOrigin: true,
    maxBodyBytes: 8_192,
  });
  if (guarded) return guarded;

  const parsed = await readJsonBody<{
    toolSlug?: unknown;
    stars?: unknown;
    comment?: unknown;
    sessionId?: unknown;
  }>(request, 8_192);
  if (!parsed.ok) return parsed.response;

  const validated = validateRatingPayload(parsed.data);
  if (!validated.ok) {
    return jsonError(validated.error, 400);
  }

  try {
    await insertToolRating(validated.data, request);
  } catch (error) {
    console.error("[ratings] insert failed:", error);
    return jsonError("Could not save your rating. Please try again later.", 502);
  }

  if (validated.data.comment) {
    try {
      await sendRatingCommentEmail(validated.data);
    } catch (error) {
      console.error("[ratings] comment email failed:", error);
    }
  }

  let rating = null;
  try {
    rating = await getPublicToolRating(validated.data.toolSlug);
  } catch {
    // non-fatal
  }

  return Response.json({ ok: true, rating });
}
