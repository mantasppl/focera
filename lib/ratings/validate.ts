import { getToolBySlug } from "@/data/tools";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type RatingPayload = {
  toolSlug: string;
  toolName: string;
  stars: number;
  comment: string | null;
  sessionId: string | null;
};

export function validateRatingPayload(input: {
  toolSlug?: unknown;
  stars?: unknown;
  comment?: unknown;
  sessionId?: unknown;
}): { ok: true; data: RatingPayload } | { ok: false; error: string } {
  const toolSlug =
    typeof input.toolSlug === "string" ? input.toolSlug.trim() : "";
  if (!toolSlug || !/^[a-z0-9-]{1,80}$/.test(toolSlug)) {
    return { ok: false, error: "Invalid tool." };
  }

  const tool = getToolBySlug(toolSlug);
  if (!tool || tool.status !== "ready") {
    return { ok: false, error: "Unknown tool." };
  }

  const stars = typeof input.stars === "number" ? input.stars : Number(input.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { ok: false, error: "Please choose a rating from 1 to 5 stars." };
  }

  const commentRaw =
    typeof input.comment === "string" ? input.comment.trim() : "";
  if (commentRaw.length > 2000) {
    return { ok: false, error: "Comment is too long." };
  }

  const sessionRaw =
    typeof input.sessionId === "string" ? input.sessionId.trim() : "";
  const sessionId = sessionRaw && UUID_RE.test(sessionRaw) ? sessionRaw : null;

  return {
    ok: true,
    data: {
      toolSlug: tool.slug,
      toolName: tool.name,
      stars,
      comment: commentRaw || null,
      sessionId,
    },
  };
}
