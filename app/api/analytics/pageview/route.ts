import { isAdminClientPath } from "@/lib/analytics/paths";
import { recordSitePresence } from "@/lib/analytics/traffic";
import { guardApiRequest, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function parsePayload(body: unknown):
  | {
      ok: true;
      sessionId: string;
      path: string;
      referrer?: string;
      kind: "view" | "heartbeat";
    }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body." };
  }
  const raw = body as Record<string, unknown>;
  const sessionId = typeof raw.sessionId === "string" ? raw.sessionId.trim() : "";
  if (!sessionId || sessionId.length > 80 || !UUID_RE.test(sessionId)) {
    return { ok: false, error: "Invalid sessionId." };
  }
  const path = typeof raw.path === "string" ? raw.path.trim() : "";
  if (!path || path.length > 240 || !path.startsWith("/")) {
    return { ok: false, error: "Invalid path." };
  }
  if (isAdminClientPath(path)) {
    return { ok: false, error: "Invalid path." };
  }
  const kind = raw.kind === "heartbeat" ? "heartbeat" : raw.kind === "view" ? "view" : null;
  if (!kind) {
    return { ok: false, error: "Invalid kind." };
  }
  let referrer: string | undefined;
  if (raw.referrer !== undefined && raw.referrer !== null) {
    if (typeof raw.referrer !== "string" || raw.referrer.length > 500) {
      return { ok: false, error: "Invalid referrer." };
    }
    referrer = raw.referrer;
  }
  return { ok: true, sessionId, path, referrer, kind };
}

export async function POST(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "analytics-pageview",
    limit: 90,
    windowMs: 60_000,
    maxBodyBytes: 2_048,
    requireSameOrigin: true,
  });
  if (guarded) return guarded;

  const parsed = await readJsonBody<unknown>(request, 2_048);
  if (!parsed.ok) return parsed.response;

  const validated = parsePayload(parsed.data);
  if (!validated.ok) {
    return jsonError(validated.error, 400);
  }

  try {
    const result = await recordSitePresence(validated, request);
    return Response.json({ ok: true, recorded: result.recorded });
  } catch {
    return Response.json({ ok: true, recorded: false }, { status: 202 });
  }
}
