import { isAllowedResultUrl } from "@/lib/childhood-photo";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 30;

function jsonError(message: string, status: number) {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Same-origin proxy for Replicate delivery URLs so the browser can download
 * the generated image without CORS issues.
 */
export async function POST(request: Request) {
  try {
    const guarded = guardApiRequest(request, {
      bucket: "childhood-proxy",
      limit: 30,
      windowMs: 60_000,
      requireSameOrigin: true,
      maxBodyBytes: 4_096,
    });
    if (guarded) return guarded;

    let body: { url?: unknown };
    try {
      body = (await request.json()) as { url?: unknown };
    } catch {
      return jsonError("Invalid JSON body.", 400);
    }

    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url || !isAllowedResultUrl(url)) {
      return jsonError("Invalid image URL.", 400);
    }

    const upstream = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    if (!upstream.ok) {
      return jsonError("Could not download the generated photo.", 502);
    }

    const contentType = upstream.headers.get("content-type") ?? "image/png";
    const bytes = await upstream.arrayBuffer();
    if (bytes.byteLength < 1_000) {
      return jsonError("Generated photo looked empty.", 502);
    }

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType.startsWith("image/")
          ? contentType
          : "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[childhood/proxy] failed:", err);
    return jsonError("Could not download the generated photo.", 502);
  }
}
