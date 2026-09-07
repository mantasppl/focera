import {
  resolveLikeIdentifier,
  toggleCommentLike,
} from "@/lib/comments/store";
import { validateLikePayload } from "@/lib/comments/validate";
import { guardApiRequest, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "tool-comments-like",
    limit: 60,
    windowMs: 60_000,
    requireSameOrigin: true,
    maxBodyBytes: 2_048,
  });
  if (guarded) return guarded;

  const parsed = await readJsonBody<{
    commentId?: unknown;
    toolSlug?: unknown;
    clientId?: unknown;
  }>(request, 2_048);
  if (!parsed.ok) return parsed.response;

  const validated = validateLikePayload(parsed.data);
  if (!validated.ok) {
    return jsonError(validated.error, 400);
  }

  const clientId =
    typeof parsed.data.clientId === "string" ? parsed.data.clientId : null;
  const identifier = resolveLikeIdentifier(request, clientId);

  try {
    const result = await toggleCommentLike({
      commentId: validated.data.commentId,
      toolSlug: validated.data.toolSlug,
      identifier,
    });
    return Response.json({ ok: true, ...result });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "COMMENT_NOT_FOUND") {
      return jsonError("Comment not found.", 404);
    }
    console.error("[comments] like failed:", error);
    return jsonError("Could not update like. Please try again.", 502);
  }
}
