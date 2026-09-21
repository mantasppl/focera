import {
  getChildhoodPrediction,
  isChildhoodPredictionId,
  mapGenerationError,
} from "@/lib/childhood-photo-server";
import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 30;

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

/**
 * Short-lived poll endpoint for an in-flight Replicate prediction.
 * Keeps each serverless invocation under a few seconds so Vercel does not 504.
 */
export async function GET(request: Request) {
  try {
    const guarded = guardApiRequest(request, {
      bucket: "childhood-status",
      limit: 60,
      windowMs: 60_000,
      requireSameOrigin: true,
    });
    if (guarded) return guarded;

    const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
    if (!isChildhoodPredictionId(id)) {
      return jsonError("Invalid prediction id.", 400);
    }

    try {
      const result = await getChildhoodPrediction(id);

      if (result.status === "succeeded" && result.imageUrl) {
        track(request, true);
        return Response.json(
          { status: "succeeded", imageUrl: result.imageUrl },
          { headers: { "Cache-Control": "no-store" } },
        );
      }

      return Response.json(
        { status: result.status },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (err) {
      console.error("[childhood/status] failed:", err);
      track(request, false);
      const mapped = mapGenerationError(err);
      return jsonError(mapped.message, mapped.status);
    }
  } catch (err) {
    console.error("[childhood/status] unhandled:", err);
    return jsonError(
      "Could not check generation status. Try again shortly.",
      502,
    );
  }
}
