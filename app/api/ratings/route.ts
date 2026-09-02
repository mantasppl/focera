import { sendRatingCommentEmail } from "@/lib/ratings/email";
import { insertToolRating } from "@/lib/ratings/store";
import { validateRatingPayload } from "@/lib/ratings/validate";
import { guardApiRequest, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
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

  return Response.json({ ok: true });
}
