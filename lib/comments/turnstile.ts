import { getClientIp } from "@/lib/security/request";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim(),
  );
}

export function isTurnstileSecretConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

/**
 * Verify a Turnstile token with Cloudflare.
 * When the secret is unset, verification is skipped (local/dev without keys).
 */
export async function verifyTurnstileToken(
  token: unknown,
  request: Request,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return { ok: true };

  const response =
    typeof token === "string" ? token.trim() : "";
  if (!response) {
    return { ok: false, error: "Please complete the security check." };
  }

  const ip = getClientIp(request);
  const body = new URLSearchParams({
    secret,
    response,
  });
  if (ip && ip !== "unknown") {
    body.set("remoteip", ip);
  }

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      console.error("[turnstile] siteverify HTTP", res.status);
      return {
        ok: false,
        error: "Security check failed. Please try again.",
      };
    }
    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (!data.success) {
      console.warn("[turnstile] rejected:", data["error-codes"]?.join(","));
      return {
        ok: false,
        error: "Security check failed. Please try again.",
      };
    }
    return { ok: true };
  } catch (error) {
    console.error("[turnstile] siteverify error:", error);
    return {
      ok: false,
      error: "Security check unavailable. Please try again shortly.",
    };
  }
}
