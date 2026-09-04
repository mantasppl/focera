import { recordSearchQuery } from "@/lib/analytics/search";
import { guardApiRequest, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function parsePayload(body: unknown):
  | { ok: true; sessionId: string; query: string }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body." };
  }
  const raw = body as Record<string, unknown>;
  const sessionId = typeof raw.sessionId === "string" ? raw.sessionId.trim() : "";
  if (!sessionId || sessionId.length > 80 || !UUID_RE.test(sessionId)) {
    return { ok: false, error: "Invalid sessionId." };
  }
  if (typeof raw.query !== "string" || raw.query.length > 120) {
    return { ok: false, error: "Invalid query." };
  }
  return { ok: true, sessionId, query: raw.query };
}

export async function POST(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "analytics-search",
    limit: 40,
    windowMs: 60_000,
    maxBodyBytes: 1_024,
    requireSameOrigin: true,
  });
  if (guarded) return guarded;

  const parsed = await readJsonBody<unknown>(request, 1_024);
  if (!parsed.ok) return parsed.response;

  const validated = parsePayload(parsed.data);
  if (!validated.ok) {
    return jsonError(validated.error, 400);
  }

  try {
    const result = await recordSearchQuery(validated, request);
    return Response.json({ ok: true, recorded: result.recorded });
  } catch {
    return Response.json({ ok: true, recorded: false }, { status: 202 });
  }
}
