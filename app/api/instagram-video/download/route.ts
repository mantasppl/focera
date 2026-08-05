import { brandedDownloadFilename } from "@/lib/image";
import { streamInstagramVideo } from "@/lib/instagram-video-server";
import { parseInstagramShortcode } from "@/lib/instagram-video";
import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import { publicErrorMessage } from "@/lib/security/public-error";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 60;

const TOOL_SLUG = "instagram-video-downloader";

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

export async function GET(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "instagram-video-dl",
    limit: 30,
    windowMs: 60_000,
    requireSameOrigin: true,
  });
  if (guarded) return guarded;

  const { searchParams } = new URL(request.url);
  const shortcodeRaw = searchParams.get("shortcode") ?? "";
  const videoId = searchParams.get("videoId") ?? shortcodeRaw;
  const username = (searchParams.get("username") ?? "")
    .replace(/[^\w.-]+/g, "")
    .slice(0, 40);
  const inline = searchParams.get("inline") === "1";

  const shortcode = parseInstagramShortcode(shortcodeRaw);
  if (!shortcode) {
    return jsonError("Invalid Instagram shortcode.", 400);
  }
  if (!videoId.trim()) {
    return jsonError("Missing video id.", 400);
  }

  try {
    const { response, contentType } = await streamInstagramVideo({
      shortcode,
      videoId: videoId.trim(),
    });

    const filename = brandedDownloadFilename(
      username
        ? `instagram-${username}-${shortcode}.mp4`
        : `instagram-${shortcode}.mp4`,
    );

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set(
      "Content-Disposition",
      inline
        ? `inline; filename="${filename}"`
        : `attachment; filename="${filename}"`,
    );
    headers.set("Cache-Control", "private, no-store");

    const contentLength = response.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    track(request, true);

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    const message = publicErrorMessage(
      err,
      "Could not download this Instagram video.",
    );

    const status =
      /Invalid Instagram|Missing video/i.test(message)
        ? 400
        : /not found|private|unavailable|Could not find/i.test(message)
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
