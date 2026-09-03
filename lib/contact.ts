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

export type ToolInquiryPayload = {
  idea: string;
  similarUrl: string | null;
  email: string;
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

function normalizeSimilarUrl(
  raw: string,
): { ok: true; url: string | null } | { ok: false } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, url: null };
  if (trimmed.length > 2048) return { ok: false };

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false };
  }
  if (parsed.username || parsed.password) return { ok: false };

  const host = parsed.hostname.toLowerCase();
  if (!host || host === "localhost" || !host.includes(".")) {
    return { ok: false };
  }

  return { ok: true, url: parsed.href };
}

export function validateToolInquiryPayload(input: {
  idea?: unknown;
  similarUrl?: unknown;
  email?: unknown;
}): { ok: true; data: ToolInquiryPayload } | { ok: false; error: string } {
  const idea = typeof input.idea === "string" ? input.idea.trim() : "";
  const similarRaw =
    typeof input.similarUrl === "string" ? input.similarUrl : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";

  if (!idea || idea.length < 10) {
    return {
      ok: false,
      error: "Please describe your tool idea (at least 10 characters).",
    };
  }
  if (idea.length > 5000) {
    return { ok: false, error: "Tool idea is too long." };
  }

  const similar = normalizeSimilarUrl(similarRaw);
  if (!similar.ok) {
    return {
      ok: false,
      error: "Please enter a valid URL, or leave that field blank.",
    };
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (email.length > 254) {
    return { ok: false, error: "Email is too long." };
  }

  return {
    ok: true,
    data: {
      idea,
      similarUrl: similar.url,
      email,
    },
  };
}
