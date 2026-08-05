import {
  buildAiImagePrompt,
  getAiImageSize,
  isAiImageSizeId,
  isAiImageStyleId,
  validateAiImagePrompt,
} from "@/lib/ai-image";
import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 60;

const TOOL_SLUG = "ai-image-generator";

type GenerateBody = {
  prompt?: unknown;
  size?: unknown;
  style?: unknown;
  seed?: unknown;
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
    bucket: "ai-image",
    limit: 20,
    windowMs: 60_000,
    requireSameOrigin: true,
    maxBodyBytes: 16_384,
  });
  if (guarded) return guarded;

  let body: GenerateBody;

  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const prompt =
    typeof body.prompt === "string" ? body.prompt : "";
  const promptError = validateAiImagePrompt(prompt);
  if (promptError) {
    return jsonError(promptError, 400);
  }

  if (!isAiImageSizeId(body.size)) {
    return jsonError("Choose a valid image size.", 400);
  }

  if (!isAiImageStyleId(body.style)) {
    return jsonError("Choose a valid image style.", 400);
  }

  const seed =
    typeof body.seed === "number" &&
    Number.isFinite(body.seed) &&
    body.seed >= 0
      ? Math.floor(body.seed)
      : Math.floor(Math.random() * 1_000_000_000);

  const size = getAiImageSize(body.size);
  const fullPrompt = buildAiImagePrompt(prompt, body.style);
  const encodedPrompt = encodeURIComponent(fullPrompt);

  const params = new URLSearchParams({
    width: String(size.width),
    height: String(size.height),
    model: "flux",
    seed: String(seed),
    nologo: "true",
    private: "true",
    enhance: "false",
  });

  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();
  // Never put API keys in the URL — they leak via logs/proxies/Referer.
  const upstreamUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "image/*",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(55_000),
    });
  } catch {
    track(request, false);
    return jsonError(
      "The image service timed out. Wait a moment and try again.",
      504,
    );
  }

  if (!upstream.ok) {
    track(request, false);
    if (upstream.status === 429) {
      return jsonError(
        "Too many requests right now. Wait about 15 seconds and try again.",
        429,
      );
    }

    return jsonError(
      "Could not generate an image from that prompt. Try a different description.",
      502,
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    track(request, false);
    return jsonError(
      "The image service returned an unexpected response. Try again.",
      502,
    );
  }

  const bytes = await upstream.arrayBuffer();
  if (bytes.byteLength < 1_000) {
    track(request, false);
    return jsonError(
      "The image service returned an empty result. Try again.",
      502,
    );
  }

  track(request, true);

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType.includes("png") ? "image/png" : "image/jpeg",
      "Cache-Control": "no-store",
      "X-Image-Seed": String(seed),
      "X-Image-Width": String(size.width),
      "X-Image-Height": String(size.height),
    },
  });
}
