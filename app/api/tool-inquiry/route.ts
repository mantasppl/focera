import { Resend } from "resend";
import { CONTACT_EMAIL, validateToolInquiryPayload } from "@/lib/contact";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";

type InquiryBody = {
  idea?: unknown;
  similarUrl?: unknown;
  email?: unknown;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "tool-inquiry",
    limit: 8,
    windowMs: 900_000,
    requireSameOrigin: true,
    maxBodyBytes: 16_384,
  });
  if (guarded) return guarded;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return jsonError(
      "Tool requests are not configured yet. Please email us directly.",
      503,
    );
  }

  let body: InquiryBody;
  try {
    body = (await request.json()) as InquiryBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const validated = validateToolInquiryPayload(body);
  if (!validated.ok) {
    return jsonError(validated.error, 400);
  }

  const { idea, similarUrl, email } = validated.data;
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Focera Tools <onboarding@resend.dev>";

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `New tool inquiry from ${email}`,
      text: [
        `Email: ${email}`,
        `Similar tool: ${similarUrl || "(not provided)"}`,
        "",
        "Tool idea:",
        idea,
      ].join("\n"),
      html: `
        <h2>New tool inquiry</h2>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Similar tool:</strong> ${
          similarUrl
            ? `<a href="${escapeHtml(similarUrl)}">${escapeHtml(similarUrl)}</a>`
            : "(not provided)"
        }</p>
        <p><strong>Tool idea:</strong></p>
        <p>${escapeHtml(idea).replace(/\n/g, "<br />")}</p>
      `,
    });

    if (error) {
      console.error("Resend tool inquiry error:", error);
      return jsonError("Could not send your request. Please try again later.", 502);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Tool inquiry API error:", err);
    return jsonError("Could not send your request. Please try again later.", 502);
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
