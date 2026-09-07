import { getToolBySlug } from "@/data/tools";
import { containsBlockedContent } from "@/lib/comments/filter";
import { isTurnstileSecretConfigured } from "@/lib/comments/turnstile";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CommentPayload = {
  toolSlug: string;
  toolName: string;
  name: string;
  email: string | null;
  content: string;
  rating: number | null;
  parentId: number | null;
};

export type LikePayload = {
  commentId: number;
  toolSlug: string;
};

function honeypotFilled(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateCommentPayload(input: {
  toolSlug?: unknown;
  name?: unknown;
  email?: unknown;
  content?: unknown;
  rating?: unknown;
  parentId?: unknown;
  website?: unknown;
  company?: unknown;
  turnstileToken?: unknown;
}): { ok: true; data: CommentPayload } | { ok: false; error: string } {
  // Honeypot — bots fill hidden fields; fail silently-ish with a generic error.
  if (honeypotFilled(input.website) || honeypotFilled(input.company)) {
    return { ok: false, error: "Unable to post comment." };
  }

  // Token presence only — Cloudflare siteverify runs in the API route.
  if (isTurnstileSecretConfigured()) {
    const token =
      typeof input.turnstileToken === "string" ? input.turnstileToken.trim() : "";
    if (!token) {
      return { ok: false, error: "Please complete the security check." };
    }
  }

  const toolSlug =
    typeof input.toolSlug === "string" ? input.toolSlug.trim() : "";
  if (!toolSlug || !/^[a-z0-9-]{1,80}$/.test(toolSlug)) {
    return { ok: false, error: "Invalid tool." };
  }

  const tool = getToolBySlug(toolSlug);
  if (!tool || tool.status !== "ready") {
    return { ok: false, error: "Unknown tool." };
  }

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name || name.length < 1) {
    return { ok: false, error: "Please enter your name." };
  }
  if (name.length > 50) {
    return { ok: false, error: "Name must be 50 characters or fewer." };
  }

  const emailRaw = typeof input.email === "string" ? input.email.trim() : "";
  let email: string | null = null;
  if (emailRaw) {
    if (!EMAIL_PATTERN.test(emailRaw) || emailRaw.length > 254) {
      return { ok: false, error: "Please enter a valid email address." };
    }
    email = emailRaw;
  }

  const content = typeof input.content === "string" ? input.content.trim() : "";
  if (!content) {
    return { ok: false, error: "Please enter a comment." };
  }
  if (content.length > 1000) {
    return { ok: false, error: "Comment must be 1000 characters or fewer." };
  }
  if (containsBlockedContent(content) || containsBlockedContent(name)) {
    return { ok: false, error: "Your comment could not be posted." };
  }

  const parentRaw = input.parentId;
  const parentId =
    parentRaw === null || parentRaw === undefined || parentRaw === ""
      ? null
      : typeof parentRaw === "number"
        ? parentRaw
        : Number(parentRaw);

  if (parentId !== null && (!Number.isInteger(parentId) || parentId < 1)) {
    return { ok: false, error: "Invalid reply target." };
  }

  // Top-level comments require a 1–5 rating; replies do not.
  let rating: number | null = null;
  if (parentId === null) {
    const stars =
      typeof input.rating === "number" ? input.rating : Number(input.rating);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return { ok: false, error: "Please choose a rating from 1 to 5 stars." };
    }
    rating = stars;
  }

  return {
    ok: true,
    data: {
      toolSlug: tool.slug,
      toolName: tool.name,
      name,
      email,
      content,
      rating,
      parentId,
    },
  };
}

export function validateLikePayload(input: {
  commentId?: unknown;
  toolSlug?: unknown;
}): { ok: true; data: LikePayload } | { ok: false; error: string } {
  const commentId =
    typeof input.commentId === "number"
      ? input.commentId
      : Number(input.commentId);
  if (!Number.isInteger(commentId) || commentId < 1) {
    return { ok: false, error: "Invalid comment." };
  }

  const toolSlug =
    typeof input.toolSlug === "string" ? input.toolSlug.trim() : "";
  if (!toolSlug || !/^[a-z0-9-]{1,80}$/.test(toolSlug)) {
    return { ok: false, error: "Invalid tool." };
  }

  const tool = getToolBySlug(toolSlug);
  if (!tool || tool.status !== "ready") {
    return { ok: false, error: "Unknown tool." };
  }

  return { ok: true, data: { commentId, toolSlug: tool.slug } };
}
