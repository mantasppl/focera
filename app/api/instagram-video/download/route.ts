import { streamInstagramVideo } from "@/lib/instagram-video-server";
import { parseInstagramShortcode } from "@/lib/instagram-video";

export const runtime = "nodejs";
export const maxDuration = 60;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
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

    const filename = username
      ? `instagram-${username}-${shortcode}.mp4`
      : `instagram-${shortcode}.mp4`;

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
        : "Could not download this Instagram video.";

    const status =
      /Invalid Instagram|Missing video/i.test(message)
        ? 400
        : /not found|private|unavailable|Could not find/i.test(message)
          ? 422
          : /rate-limited|blocked/i.test(message)
            ? 429
            : 502;

    return jsonError(message, status);
  }
}
