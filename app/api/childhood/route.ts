import {
  callGroq,
  cleanupPreparedImage,
  generateImage,
  mapReplicateError,
  parseChildhoodForm,
  prepareImage,
  type PreparedChildhoodImage,
} from "@/lib/childhood-photo-server";
import { CHILDHOOD_MAX_IMAGE_BYTES } from "@/lib/childhood-photo";
import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 120;

const TOOL_SLUG = "90s-photo-generator";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function track(request: Request, success: boolean) {
  const tool = getToolBySlug(TOOL_SLUG);
  if (tool) {
    trackToolUsageServer(
      { toolId: tool.slug, toolName: tool.name, success },
      request,
    );
  }
}

export async function POST(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "childhood",
    limit: 8,
    windowMs: 60_000,
    requireSameOrigin: true,
    maxBodyBytes: CHILDHOOD_MAX_IMAGE_BYTES + 256_000,
  });
  if (guarded) return guarded;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Invalid multipart form data.", 400);
  }

  let prepared: PreparedChildhoodImage | null = null;

  try {
    const { image, preset } = parseChildhoodForm(form);

    // 1) Normalize + resize upload (max 1024px) → temp file + data URI
    prepared = await prepareImage(image);

    // 2) Groq builds a structured identity-preserving nostalgia prompt
    const prompt = await callGroq(preset);

    // 3) Replicate IP-Adapter face generation
    let imageUrl = await generateImage({
      imageDataUri: prepared.dataUri,
      prompt,
    });

    // Prefer a data URI so the browser can preview/download without CORS issues.
    try {
      if (!imageUrl.startsWith("data:")) {
        const upstream = await fetch(imageUrl, {
          cache: "no-store",
          signal: AbortSignal.timeout(45_000),
        });
        if (upstream.ok) {
          const bytes = Buffer.from(await upstream.arrayBuffer());
          if (bytes.byteLength >= 1_000 && bytes.byteLength <= 3_500_000) {
            const mime =
              upstream.headers.get("content-type")?.split(";")[0]?.trim() ||
              "image/png";
            const safeMime = mime.startsWith("image/") ? mime : "image/png";
            imageUrl = `data:${safeMime};base64,${bytes.toString("base64")}`;
          }
        }
      }
    } catch (error) {
      console.error("[childhood] could not inline generated image:", error);
    }

    track(request, true);

    return Response.json(
      { imageUrl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[childhood] generation failed:", err);
    track(request, false);
    const mapped = mapReplicateError(err);
    return jsonError(mapped.message, mapped.status);
  } finally {
    await cleanupPreparedImage(prepared);
  }
}
