import {
  buildFallbackPrompt,
  cleanupPreparedImage,
  mapGenerationError,
  parseChildhoodForm,
  prepareImage,
  startChildhoodPrediction,
  type PreparedChildhoodImage,
} from "@/lib/childhood-photo-server";
import { CHILDHOOD_MAX_IMAGE_BYTES } from "@/lib/childhood-photo";
import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
// Create-only: prep + Replicate create should finish in a few seconds.
export const maxDuration = 60;

const TOOL_SLUG = "90s-photo-generator";

function jsonError(message: string, status: number) {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function track(request: Request, success: boolean) {
  try {
    const tool = getToolBySlug(TOOL_SLUG);
    if (tool) {
      trackToolUsageServer(
        { toolId: tool.slug, toolName: tool.name, success },
        request,
      );
    }
  } catch {
    // Analytics must never break the tool.
  }
}

export async function POST(request: Request) {
  try {
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

      // Use the fixed identity script directly — Groq added latency without
      // improving the locked prompt template.
      prepared = await prepareImage(image);
      const prompt = buildFallbackPrompt(preset);

      const started = await startChildhoodPrediction({
        image: prepared.buffer,
        mime: prepared.mime,
        prompt,
      });

      // Only track success once the image actually lands (status route).
      if (started.imageUrl) {
        track(request, true);
      }

      return Response.json(
        started.imageUrl
          ? { predictionId: started.predictionId, imageUrl: started.imageUrl }
          : { predictionId: started.predictionId },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (err) {
      console.error("[childhood] generation failed:", err);
      track(request, false);
      const mapped = mapGenerationError(err);
      return jsonError(mapped.message, mapped.status);
    } finally {
      await cleanupPreparedImage(prepared);
    }
  } catch (err) {
    // Last-resort guard so Next.js never returns a bare HTML 500.
    console.error("[childhood] unhandled route failure:", err);
    return jsonError(
      "Could not generate a childhood photo. Try again shortly.",
      502,
    );
  }
}
