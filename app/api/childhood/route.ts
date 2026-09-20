import { randomUUID } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import Replicate, { type ApiError } from "replicate";
import {
  CHILDHOOD_MAX_IMAGE_BYTES,
  getChildhoodPreset,
  isChildhoodPresetId,
} from "@/lib/childhood-photo";
import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 120;

const TOOL_SLUG = "90s-photo-generator";

const MODEL =
  "lucataco/ip_adapter-sdxl-face:226c6bf67a75a129b0f978e518fed33e1fb13956e15761c1ac53c9d2f898c9af" as const;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const NEGATIVE_PROMPT =
  "blurry, deformed face, extra limbs, modern smartphone photo, oversharpened, watermark, text, logo";

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

function fileExtension(file: File): string {
  const fromName = extname(file.name || "").toLowerCase();
  if (fromName === ".jpeg") return ".jpg";
  if (fromName === ".jpg" || fromName === ".png" || fromName === ".webp") {
    return fromName;
  }
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  return ".jpg";
}

function isApiError(err: unknown): err is ApiError {
  return (
    !!err &&
    typeof err === "object" &&
    "response" in err &&
    (err as ApiError).response instanceof Response
  );
}

function replicateUserError(err: unknown): { message: string; status: number } {
  if (isApiError(err)) {
    const status = err.response.status;
    if (status === 401 || status === 403) {
      return {
        message:
          "AI generation is not configured. Set a valid REPLICATE_API_TOKEN on the server.",
        status: 503,
      };
    }
    if (status === 402) {
      return {
        message:
          "AI generation is temporarily unavailable (billing). Try again later.",
        status: 503,
      };
    }
    if (status === 429) {
      return {
        message: "Too many requests right now. Wait a moment and try again.",
        status: 429,
      };
    }
    if (status === 422) {
      return {
        message:
          "Could not process this photo. Use a clear, front-facing portrait and try again.",
        status: 422,
      };
    }
  }

  const raw = err instanceof Error ? err.message.trim() : "";

  if (/Prediction failed:/i.test(raw)) {
    const detail = raw.replace(/^Prediction failed:\s*/i, "").trim();
    if (/nsfw|safety|sensitive/i.test(detail)) {
      return {
        message:
          "That photo was blocked by the safety filter. Try another image.",
        status: 422,
      };
    }
    if (/face|detect|landmark/i.test(detail)) {
      return {
        message:
          "Could not detect a clear face. Upload a front-facing portrait and try again.",
        status: 422,
      };
    }
    return {
      message:
        "Could not generate a childhood photo from that image. Try a clearer portrait.",
      status: 502,
    };
  }

  if (/aborted|timeout|ETIMEDOUT|AbortError/i.test(raw)) {
    return {
      message: "Generation timed out. Wait a moment and try again.",
      status: 504,
    };
  }

  return {
    message: "Could not generate a childhood photo. Try again shortly.",
    status: 502,
  };
}

function extractImageUrl(output: unknown): string | null {
  if (typeof output === "string" && output.length > 0) {
    if (/^(https?:\/\/|data:image\/)/i.test(output)) return output;
  }

  if (Array.isArray(output) && output.length > 0) {
    return extractImageUrl(output[0]);
  }

  if (output && typeof output === "object") {
    const maybeUrl = (output as { url?: unknown }).url;
    if (typeof maybeUrl === "function") {
      try {
        const url = (maybeUrl as () => URL | string).call(output);
        const href = typeof url === "string" ? url : url.href;
        if (/^(https?:\/\/|data:image\/)/i.test(href)) return href;
      } catch {
        return null;
      }
    }
    if (
      typeof maybeUrl === "string" &&
      /^(https?:\/\/|data:image\/)/i.test(maybeUrl)
    ) {
      return maybeUrl;
    }
    if (typeof (output as { toString?: unknown }).toString === "function") {
      const asString = String(output);
      if (/^(https?:\/\/|data:image\/)/i.test(asString)) return asString;
    }
  }

  return null;
}

export async function POST(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "childhood",
    limit: 8,
    windowMs: 60_000,
    requireSameOrigin: true,
    maxBodyBytes: CHILDHOOD_MAX_IMAGE_BYTES + 256_000,
  });
  if (guarded) return guarded;

  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    return jsonError(
      "Childhood photo generation is not configured. Set REPLICATE_API_TOKEN and try again.",
      503,
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Invalid multipart form data.", 400);
  }

  const image = form.get("image");
  if (!(image instanceof File) || image.size <= 0) {
    return jsonError("Upload an image file.", 400);
  }

  if (image.size > CHILDHOOD_MAX_IMAGE_BYTES) {
    return jsonError("Image must be 10 MB or smaller.", 413);
  }

  if (image.type && !ALLOWED_MIME_TYPES.has(image.type)) {
    return jsonError("Upload a JPG, PNG, or WebP image.", 400);
  }

  const presetRaw = form.get("preset");
  if (!isChildhoodPresetId(presetRaw)) {
    return jsonError(
      'Choose a valid preset: "90s_family", "school", or "disposable".',
      400,
    );
  }

  const prompt = getChildhoodPreset(presetRaw).prompt;
  const tempPath = join(
    tmpdir(),
    `childhood-${randomUUID()}${fileExtension(image)}`,
  );

  try {
    const bytes = Buffer.from(await image.arrayBuffer());
    await writeFile(tempPath, bytes);

    const imageBlob = new Blob([new Uint8Array(bytes)], {
      type: image.type || "image/jpeg",
    });

    const replicate = new Replicate({
      auth: token,
      useFileOutput: false,
      fileEncodingStrategy: "upload",
    });

    const output = await replicate.run(MODEL, {
      input: {
        image: imageBlob,
        prompt,
        negative_prompt: NEGATIVE_PROMPT,
        scale: 0.7,
        num_inference_steps: 30,
        num_outputs: 1,
      },
    });

    const generatedUrl = extractImageUrl(output);
    if (!generatedUrl) {
      console.error("[childhood] unexpected Replicate output:", output);
      track(request, false);
      return jsonError(
        "Could not generate a childhood photo. Try a different image.",
        502,
      );
    }

    const upstream = await fetch(generatedUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });
    if (!upstream.ok) {
      track(request, false);
      return jsonError(
        "Could not download the generated photo. Try again shortly.",
        502,
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    const imageBytes = await upstream.arrayBuffer();
    if (imageBytes.byteLength < 1_000) {
      track(request, false);
      return jsonError(
        "The image service returned an empty result. Try again.",
        502,
      );
    }

    track(request, true);

    return new Response(imageBytes, {
      status: 200,
      headers: {
        "Content-Type": contentType.startsWith("image/")
          ? contentType
          : "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[childhood] generation failed:", err);
    track(request, false);
    const mapped = replicateUserError(err);
    return jsonError(mapped.message, mapped.status);
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}
