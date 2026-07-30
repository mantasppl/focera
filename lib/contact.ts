export const CONTACT_EMAIL = "support@focera.co";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export type FeedbackPayload = {
  email: string | null;
  message: string;
  toolSlug: string | null;
};

export function validateContactPayload(input: {
  name?: unknown;
  email?: unknown;
  message?: unknown;
}): { ok: true; data: ContactPayload } | { ok: false; error: string } {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const message =
    typeof input.message === "string" ? input.message.trim() : "";

  if (!name || name.length < 2) {
    return { ok: false, error: "Please enter your name." };
  }
  if (name.length > 120) {
    return { ok: false, error: "Name is too long." };
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (email.length > 254) {
    return { ok: false, error: "Email is too long." };
  }
  if (!message || message.length < 10) {
    return { ok: false, error: "Please enter a message (at least 10 characters)." };
  }
  if (message.length > 5000) {
    return { ok: false, error: "Message is too long." };
  }

  return { ok: true, data: { name, email, message } };
}

export function validateFeedbackPayload(input: {
  email?: unknown;
  message?: unknown;
  toolSlug?: unknown;
}): { ok: true; data: FeedbackPayload } | { ok: false; error: string } {
  const emailRaw = typeof input.email === "string" ? input.email.trim() : "";
  const message =
    typeof input.message === "string" ? input.message.trim() : "";
  const toolSlugRaw =
    typeof input.toolSlug === "string" ? input.toolSlug.trim() : "";

  if (emailRaw) {
    if (!EMAIL_PATTERN.test(emailRaw)) {
      return { ok: false, error: "Please enter a valid email address." };
    }
    if (emailRaw.length > 254) {
      return { ok: false, error: "Email is too long." };
    }
  }

  if (!message || message.length < 10) {
    return {
      ok: false,
      error: "Please enter a message (at least 10 characters).",
    };
  }
  if (message.length > 5000) {
    return { ok: false, error: "Message is too long." };
  }

  const toolSlug =
    toolSlugRaw && /^[a-z0-9-]{1,80}$/.test(toolSlugRaw) ? toolSlugRaw : null;

  return {
    ok: true,
    data: {
      email: emailRaw || null,
      message,
      toolSlug,
    },
  };
}
