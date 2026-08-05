import { brandedDownloadFilename } from "@/lib/image";
import { streamTwitterVideo } from "@/lib/twitter-video-server";
import { parseTwitterStatusId } from "@/lib/twitter-video";

export const runtime = "nodejs";
export const maxDuration = 60;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusIdRaw = searchParams.get("statusId") ?? "";
  const videoId = searchParams.get("videoId") ?? statusIdRaw;
  const username = (searchParams.get("username") ?? "")
    .replace(/[^\w.-]+/g, "")
    .slice(0, 40);
  const inline = searchParams.get("inline") === "1";

  const statusId = parseTwitterStatusId(statusIdRaw);
  if (!statusId) {
    return jsonError("Invalid Twitter/X status id.", 400);
  }
  if (!videoId.trim()) {
    return jsonError("Missing video id.", 400);
  }

  try {
    const { response, contentType } = await streamTwitterVideo({
      statusId,
      videoId: videoId.trim(),
    });

    const filename = brandedDownloadFilename(
      username
        ? `twitter-${username}-${statusId}.mp4`
        : `twitter-${statusId}.mp4`,
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

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Could not download this Twitter/X video.";

    const status =
      /Invalid Twitter|Missing video/i.test(message)
        ? 400
        : /not found|private|unavailable|deleted|Could not find|does not contain/i.test(
              message,
            )
          ? 422
          : /rate-limited|blocked/i.test(message)
            ? 429
            : 502;

    return jsonError(message, status);
  }
}
