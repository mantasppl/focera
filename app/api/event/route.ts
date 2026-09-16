import { eventPayloadSchema } from "@/lib/content/validate";
import { guardApiRequest, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

/**
 * Lightweight content conversion events.
 * Intentionally does not write to Turso — logs only.
 */
export async function POST(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "content-event",
    limit: 60,
    windowMs: 60_000,
    maxBodyBytes: 2_048,
    requireSameOrigin: true,
  });
  if (guarded) return guarded;

  const parsed = await readJsonBody<unknown>(request, 2_048);
  if (!parsed.ok) return parsed.response;

  const validated = eventPayloadSchema.safeParse(parsed.data);
  if (!validated.success) {
    return Response.json({ error: "Invalid event." }, { status: 400 });
  }

  const event = validated.data;
  console.info("[content-event]", event.type, {
    path: event.path,
    slug: event.slug,
    toolId: event.toolId,
  });

  return Response.json({ ok: true });
}
