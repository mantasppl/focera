import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/contact";
import type { RatingPayload } from "@/lib/ratings/validate";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Best-effort: comments go to support. Missing Resend config is not a user-facing error. */
export async function sendRatingCommentEmail(
  payload: RatingPayload,
): Promise<void> {
  if (!payload.comment) return;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[ratings] RESEND_API_KEY is not set; comment was stored but not emailed.");
    return;
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Focera Ratings <onboarding@resend.dev>";
  const resend = new Resend(apiKey);
  const starLabel = `${payload.stars} star${payload.stars === 1 ? "" : "s"}`;

  const { error } = await resend.emails.send({
    from,
    to: CONTACT_EMAIL,
    subject: `Tool rating: ${starLabel} — ${payload.toolName}`,
    text: [
      `Tool: ${payload.toolName} (${payload.toolSlug})`,
      `Rating: ${starLabel}`,
      "",
      "Comment:",
      payload.comment,
    ].join("\n"),
    html: `
      <h2>New tool rating comment</h2>
      <p><strong>Tool:</strong> ${escapeHtml(payload.toolName)} (${escapeHtml(payload.toolSlug)})</p>
      <p><strong>Rating:</strong> ${escapeHtml(starLabel)}</p>
      <p><strong>Comment:</strong></p>
      <p>${escapeHtml(payload.comment).replace(/\n/g, "<br />")}</p>
    `,
  });

  if (error) {
    console.error("Resend rating comment error:", error);
  }
}
