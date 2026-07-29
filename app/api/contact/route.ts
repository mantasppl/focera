import { Resend } from "resend";
import { CONTACT_EMAIL, validateContactPayload } from "@/lib/contact";

export const runtime = "nodejs";

type ContactBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return jsonError(
      "Contact form is not configured yet. Please email us directly.",
      503,
    );
  }

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const validated = validateContactPayload(body);
  if (!validated.ok) {
    return jsonError(validated.error, 400);
  }

  const { name, email, message } = validated.data;
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Focera Contact <onboarding@resend.dev>";

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Focera contact from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        "Message:",
        message,
      ].join("\n"),
      html: `
        <h2>New contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
    });

    if (error) {
      console.error("Resend contact error:", error);
      return jsonError("Could not send your message. Please try again later.", 502);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
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
