import { Resend } from "resend";
import { CONTACT_EMAIL, validateFeedbackPayload } from "@/lib/contact";

export const runtime = "nodejs";

type FeedbackBody = {
  email?: unknown;
  message?: unknown;
  toolSlug?: unknown;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return jsonError(
      "Feedback form is not configured yet. Please email us directly.",
      503,
    );
  }

  let body: FeedbackBody;
  try {
    body = (await request.json()) as FeedbackBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const validated = validateFeedbackPayload(body);
  if (!validated.ok) {
    return jsonError(validated.error, 400);
  }

  const { email, message, toolSlug } = validated.data;
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Focera Feedback <onboarding@resend.dev>";
  const toolLabel = toolSlug ? ` (${toolSlug})` : "";
  const replyLabel = email || "anonymous";

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to: CONTACT_EMAIL,
      ...(email ? { replyTo: email } : {}),
      subject: `Focera feedback from ${replyLabel}${toolLabel}`,
      text: [
        `Email: ${email || "(not provided)"}`,
        `Tool: ${toolSlug || "(not specified)"}`,
        "",
        "Message:",
        message,
      ].join("\n"),
      html: `
        <h2>New feedback message</h2>
        <p><strong>Email:</strong> ${escapeHtml(email || "(not provided)")}</p>
        <p><strong>Tool:</strong> ${escapeHtml(toolSlug || "(not specified)")}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
    });

    if (error) {
      console.error("Resend feedback error:", error);
      return jsonError("Could not send your message. Please try again later.", 502);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Feedback API error:", err);
    return jsonError("Could not send your message. Please try again later.", 502);
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
