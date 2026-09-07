import {
  getLikedCommentIds,
  insertToolComment,
  listToolComments,
  resolveLikeIdentifier,
} from "@/lib/comments/store";
import { verifyTurnstileToken } from "@/lib/comments/turnstile";
import { validateCommentPayload } from "@/lib/comments/validate";
import type { CommentSort } from "@/lib/comments/types";
import { getToolBySlug } from "@/data/tools";
import { guardApiRequest, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "tool-comments-list",
    limit: 120,
    windowMs: 60_000,
    requireSameOrigin: false,
  });
  if (guarded) return guarded;

  const url = new URL(request.url);
  const toolSlug = url.searchParams.get("toolSlug")?.trim() ?? "";
  const sortParam = url.searchParams.get("sort")?.trim();
  const sort: CommentSort = sortParam === "newest" ? "newest" : "top";
  const clientId = url.searchParams.get("clientId")?.trim() ?? null;

  if (!toolSlug || !/^[a-z0-9-]{1,80}$/.test(toolSlug)) {
    return jsonError("Invalid tool.", 400);
  }

  const tool = getToolBySlug(toolSlug);
  if (!tool || tool.status !== "ready") {
    return jsonError("Unknown tool.", 400);
  }

  try {
    const identifier = resolveLikeIdentifier(request, clientId);
    const likedIds = await getLikedCommentIds({
      toolSlug: tool.slug,
      identifier,
    });
    const result = await listToolComments({
      toolSlug: tool.slug,
      toolName: tool.name,
      sort,
      likedIds,
    });
    return Response.json(result);
  } catch (error) {
    console.error("[comments] list failed:", error);
    return jsonError("Could not load comments.", 502);
  }
}

export async function POST(request: Request) {
  // ~1 comment / 10s per IP (plus broader hourly cap via same bucket window stacking).
  const gated = guardApiRequest(request, {
    bucket: "tool-comments-create",
    limit: 1,
    windowMs: 10_000,
    requireSameOrigin: true,
    maxBodyBytes: 8_192,
  });
  if (gated) return gated;

  const hourly = guardApiRequest(request, {
    bucket: "tool-comments-create-hour",
    limit: 30,
    windowMs: 3_600_000,
    requireSameOrigin: false,
    maxBodyBytes: 8_192,
  });
  if (hourly) return hourly;

  const parsed = await readJsonBody<{
    toolSlug?: unknown;
    name?: unknown;
    email?: unknown;
    content?: unknown;
    rating?: unknown;
    parentId?: unknown;
    website?: unknown;
    company?: unknown;
    turnstileToken?: unknown;
  }>(request, 8_192);
  if (!parsed.ok) return parsed.response;

  const turnstile = await verifyTurnstileToken(
    parsed.data.turnstileToken,
    request,
  );
  if (!turnstile.ok) {
    return jsonError(turnstile.error, 400);
  }

  const validated = validateCommentPayload(parsed.data);
  if (!validated.ok) {
    return jsonError(validated.error, 400);
  }

  try {
    const comment = await insertToolComment(validated.data, request);
    return Response.json({ ok: true, comment });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "REPLY_TARGET_INVALID") {
      return jsonError("That comment is no longer available to reply to.", 400);
    }
    if (code === "REPLY_NESTING") {
      return jsonError("Replies can only be one level deep.", 400);
    }
    console.error("[comments] insert failed:", error);
    return jsonError("Could not post your comment. Please try again later.", 502);
  }
}
