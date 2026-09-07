import { requireAdminApi } from "@/lib/admin/guard";
import { getToolBySlug } from "@/data/tools";
import {
  deleteAdminComment,
  getCommentOverview,
  getPerToolCommentSummaries,
  listAdminComments,
  updateAdminComment,
} from "@/lib/comments/admin-store";
import type { AdminCommentKind } from "@/lib/comments/admin-types";
import { readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function parseKind(raw: string | null): AdminCommentKind {
  if (
    raw === "user" ||
    raw === "system" ||
    raw === "replies" ||
    raw === "roots"
  ) {
    return raw;
  }
  return "all";
}

export async function GET(request: Request) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-comments",
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
    const kind = parseKind(searchParams.get("kind"));
    const query = searchParams.get("q")?.trim() || undefined;
    const limit = Number(searchParams.get("limit") || 50);
    const offset = Number(searchParams.get("offset") || 0);

    const [stats, tools, list] = await Promise.all([
      getCommentOverview(),
      getPerToolCommentSummaries(),
      listAdminComments({
        toolId,
        kind,
        query,
        limit: Number.isFinite(limit) ? limit : 50,
        offset: Number.isFinite(offset) ? offset : 0,
      }),
    ]);

    return Response.json({
      ok: true,
      stats,
      tools,
      comments: list.items,
      totalComments: list.total,
      toolId: toolId || null,
      kind,
      query: query || null,
    });
  } catch (error) {
    console.error("[admin/comments]", error);
    return jsonError("Failed to load comments.", 500);
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-comments-mutate",
    limit: 60,
    windowMs: 60_000,
  });
  if (denied) return denied;

  const parsed = await readJsonBody<{
    id?: unknown;
    name?: unknown;
    content?: unknown;
    email?: unknown;
    rating?: unknown;
    likesCount?: unknown;
    isSystem?: unknown;
  }>(request, 8_192);
  if (!parsed.ok) return parsed.response;

  const id =
    typeof parsed.data.id === "number"
      ? parsed.data.id
      : Number(parsed.data.id);
  if (!Number.isInteger(id) || id < 1) {
    return jsonError("Invalid comment id.", 400);
  }

  const patch: {
    name?: string;
    content?: string;
    email?: string | null;
    rating?: number | null;
    likesCount?: number;
    isSystem?: boolean;
  } = {};

  if (typeof parsed.data.name === "string") patch.name = parsed.data.name;
  if (typeof parsed.data.content === "string") patch.content = parsed.data.content;
  if (parsed.data.email === null) patch.email = null;
  else if (typeof parsed.data.email === "string") patch.email = parsed.data.email;
  if (parsed.data.rating === null) patch.rating = null;
  else if (parsed.data.rating !== undefined) {
    patch.rating = Number(parsed.data.rating);
  }
  if (parsed.data.likesCount !== undefined) {
    patch.likesCount = Number(parsed.data.likesCount);
  }
  if (typeof parsed.data.isSystem === "boolean") {
    patch.isSystem = parsed.data.isSystem;
  }

  try {
    const comment = await updateAdminComment(id, patch);
    return Response.json({ ok: true, comment });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "COMMENT_NOT_FOUND") return jsonError("Comment not found.", 404);
    if (code.startsWith("INVALID_") || code === "EMPTY_PATCH") {
      return jsonError("Invalid update.", 400);
    }
    console.error("[admin/comments] patch failed:", error);
    return jsonError("Could not update comment.", 500);
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-comments-mutate",
    limit: 60,
    windowMs: 60_000,
  });
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) {
    return jsonError("Invalid comment id.", 400);
  }

  try {
    const result = await deleteAdminComment(id);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "COMMENT_NOT_FOUND") return jsonError("Comment not found.", 404);
    console.error("[admin/comments] delete failed:", error);
    return jsonError("Could not delete comment.", 500);
  }
}
