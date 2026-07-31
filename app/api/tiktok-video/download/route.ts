import { streamTikTokVideo } from "@/lib/tiktok-video-server";
import { parseTikTokVideoId } from "@/lib/tiktok-video";

export const runtime = "nodejs";
export const maxDuration = 60;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoIdRaw = searchParams.get("videoId") ?? "";
  const username = (searchParams.get("username") ?? "")
    .replace(/[^\w.-]+/g, "")
    .slice(0, 40);
  const inline = searchParams.get("inline") === "1";

  const videoId = parseTikTokVideoId(videoIdRaw);
  if (!videoId) {
    return jsonError("Invalid TikTok video id.", 400);
  }

  try {
    const { response, contentType } = await streamTikTokVideo({
      videoId,
      username: username || null,
    });

    const filename = username
      ? `tiktok-${username}-${videoId}.mp4`
      : `tiktok-${videoId}.mp4`;

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

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Could not download this TikTok video.";

    const status =
      /Invalid TikTok|Missing video/i.test(message)
        ? 400
        : /not found|private|unavailable|photo slideshow|Could not find|does not contain/i.test(
              message,
            )
          ? 422
          : /rate-limited|blocked/i.test(message)
            ? 429
            : 502;

    return jsonError(message, status);
  }
}
