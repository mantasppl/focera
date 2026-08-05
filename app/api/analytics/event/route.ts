import { recordToolUsageEvent } from "@/lib/analytics/track";
import { validateTrackPayload } from "@/lib/analytics/validate";
import { guardApiRequest, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "analytics-event",
    limit: 120,
    windowMs: 60_000,
    maxBodyBytes: 8_192,
  });
  if (guarded) return guarded;

  const parsed = await readJsonBody<unknown>(request, 8_192);
  if (!parsed.ok) return parsed.response;

  const validated = validateTrackPayload(parsed.data);
  if (!validated.ok) {
    return jsonError(validated.error, 400);
  }

  try {
    const result = await recordToolUsageEvent(validated.data, request);
    return Response.json({ ok: true, inserted: result.inserted });
  } catch {
    // Never surface DB errors to clients; keep ingest soft-fail.
    return Response.json({ ok: true, inserted: false }, { status: 202 });
  }
}
