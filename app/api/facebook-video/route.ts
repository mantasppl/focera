import { fetchFacebookVideo } from "@/lib/facebook-video-server";
import { validateFacebookUrl } from "@/lib/facebook-video";

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
  const urlError = validateFacebookUrl(url);
  if (urlError) return jsonError(urlError, 400);

  try {
    const result = await fetchFacebookVideo(url);
    return Response.json(result);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Could not fetch this Facebook video.";

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

    return jsonError(message, status);
  }
}
