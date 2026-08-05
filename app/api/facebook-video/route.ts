import { fetchFacebookVideo } from "@/lib/facebook-video-server";
import { validateFacebookUrl } from "@/lib/facebook-video";
import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import { publicErrorMessage } from "@/lib/security/public-error";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 60;

const TOOL_SLUG = "facebook-video-downloader";

type RequestBody = {
  url?: unknown;
};

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
    bucket: "facebook-video",
    limit: 20,
    windowMs: 60_000,
    requireSameOrigin: true,
    maxBodyBytes: 8_192,
  });
  if (guarded) return guarded;

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const url = typeof body.url === "string" ? body.url : "";
  const urlError = validateFacebookUrl(url);
  if (urlError) return jsonError(urlError, 400);

  try {
    const result = await fetchFacebookVideo(url);
    track(request, true);
    return Response.json(result);
  } catch (err) {
    const message = publicErrorMessage(
      err,
      "Could not fetch this Facebook video.",
    );

    const status =
      /valid Facebook|Paste a Facebook|video id/i.test(message)
        ? 400
        : /not contain a public video|Photos cannot|not found|private|unavailable/i.test(
              message,
            )
          ? 422
          : /rate-limited|blocked/i.test(message)
            ? 429
            : 502;

    if (status !== 400) {
      track(request, false);
    }

    return jsonError(message, status);
  }
}
