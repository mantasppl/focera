import { fetchTwitterVideo } from "@/lib/twitter-video-server";
import { validateTwitterUrl } from "@/lib/twitter-video";

export const runtime = "nodejs";
export const maxDuration = 60;

type RequestBody = {
  url?: unknown;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const url = typeof body.url === "string" ? body.url : "";
  const urlError = validateTwitterUrl(url);
  if (urlError) return jsonError(urlError, 400);

  try {
    const result = await fetchTwitterVideo(url);
    return Response.json(result);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Could not fetch this Twitter/X video.";

    const status =
      /valid Twitter|Paste a Twitter|status id/i.test(message)
        ? 400
        : /does not contain a public video|not found|private|unavailable|deleted/i.test(
              message,
            )
          ? 422
          : /rate-limited|blocked/i.test(message)
            ? 429
            : 502;

    return jsonError(message, status);
  }
}
