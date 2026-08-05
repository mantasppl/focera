import {
  consumeRateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  return "unknown";
}

function parseOrigin(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

/** True when Origin/Referer matches the request host (or Origin is absent on same-site tools). */
export function isSameOriginRequest(request: Request): boolean {
  const host = request.headers.get("host");
  if (!host) return false;

  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "production" ? "https" : "http");
  const expected = `${proto}://${host}`;

  const origin = parseOrigin(request.headers.get("origin"));
  if (origin) return origin === expected;

  const referer = parseOrigin(request.headers.get("referer"));
  if (referer) return referer === expected;

  // Non-browser clients (curl, sendBeacon quirks) — allow only outside production.
  return process.env.NODE_ENV !== "production";
}

export function rejectIfCrossOrigin(request: Request): Response | null {
  if (isSameOriginRequest(request)) return null;
  return Response.json({ error: "Forbidden origin." }, { status: 403 });
}

export function enforceContentLength(
  request: Request,
  maxBytes: number,
): Response | null {
  const header = request.headers.get("content-length");
  if (!header) return null;
  const length = Number(header);
  if (!Number.isFinite(length) || length < 0) {
    return Response.json({ error: "Invalid content length." }, { status: 400 });
  }
  if (length > maxBytes) {
    return Response.json(
      { error: "Request body too large." },
      { status: 413 },
    );
  }
  return null;
}

export async function readJsonBody<T>(
  request: Request,
  maxBytes: number,
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  const tooLarge = enforceContentLength(request, maxBytes);
  if (tooLarge) return { ok: false, response: tooLarge };

  try {
    const text = await request.text();
    if (text.length > maxBytes) {
      return {
        ok: false,
        response: Response.json(
          { error: "Request body too large." },
          { status: 413 },
        ),
      };
    }
    if (!text) {
      return {
        ok: false,
        response: Response.json({ error: "Invalid JSON body." }, { status: 400 }),
      };
    }
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "Invalid JSON body." }, { status: 400 }),
    };
  }
}

export type ApiGuardOptions = {
  /** Logical bucket name, e.g. "ai-image" or "admin-login". */
  bucket: string;
  limit: number;
  windowMs: number;
  requireSameOrigin?: boolean;
  maxBodyBytes?: number;
};

/** Shared request guard: optional origin check, body size, and IP rate limit. */
export function guardApiRequest(
  request: Request,
  options: ApiGuardOptions,
): Response | null {
  if (options.requireSameOrigin) {
    const forbidden = rejectIfCrossOrigin(request);
    if (forbidden) return forbidden;
  }

  if (options.maxBodyBytes) {
    const tooLarge = enforceContentLength(request, options.maxBodyBytes);
    if (tooLarge) return tooLarge;
  }

  const ip = getClientIp(request);
  const result = consumeRateLimit(
    `${options.bucket}:${ip}`,
    options.limit,
    options.windowMs,
  );

  if (!result.ok) {
    return Response.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: rateLimitHeaders(result, options.limit),
      },
    );
  }

  return null;
}

export function isSafeOutboundUrl(
  rawUrl: string,
  allowedHostSuffixes: string[],
): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") return false;
  if (parsed.username || parsed.password) return false;

  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host === "metadata.google.internal" ||
    /^(10\.|127\.|169\.254\.|192\.168\.|0\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/.test(
      host,
    )
  ) {
    return false;
  }

  return allowedHostSuffixes.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
}
