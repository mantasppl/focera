import { randomUUID } from "node:crypto";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import Replicate from "replicate";
import {
  CHILDHOOD_MAX_IMAGE_BYTES,
  getChildhoodPreset,
  isChildhoodPresetId,
} from "@/lib/childhood-photo";
import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import { publicErrorMessage } from "@/lib/security/public-error";
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

function toDataUri(bytes: Buffer, mimeType: string): string {
  const mime =
    mimeType && mimeType.startsWith("image/") ? mimeType : "image/jpeg";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

function extractImageUrl(output: unknown): string | null {
  if (typeof output === "string" && /^https?:\/\//i.test(output)) {
    return output;
  }

  if (Array.isArray(output) && output.length > 0) {
    return extractImageUrl(output[0]);
  }

  if (output && typeof output === "object") {
    const maybeUrl = (output as { url?: unknown }).url;
    if (typeof maybeUrl === "function") {
      try {
        const url = (maybeUrl as () => URL | string).call(output);
        return typeof url === "string" ? url : url.href;
      } catch {
        return null;
      }
    }
    if (typeof maybeUrl === "string" && /^https?:\/\//i.test(maybeUrl)) {
      return maybeUrl;
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
      "Childhood photo generation is not configured. Try again later.",
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
    const tempImage = await readFile(tempPath);
    const imageUrl = toDataUri(tempImage, image.type || "image/jpeg");

    const replicate = new Replicate({ auth: token });
    const output = await replicate.run(MODEL, {
      input: {
        image: imageUrl,
        prompt,
        scale: 0.7,
        num_inference_steps: 30,
      },
    });

    const generatedUrl = extractImageUrl(output);
    if (!generatedUrl) {
      track(request, false);
      return jsonError(
        "Could not generate a childhood photo. Try a different image.",
        502,
      );
    }

    track(request, true);

    return Response.json(
      { imageUrl: generatedUrl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    track(request, false);
    return jsonError(
      publicErrorMessage(
        err,
        "Could not generate a childhood photo. Try again shortly.",
      ),
      502,
    );
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}
