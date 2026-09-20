import { randomUUID } from "node:crypto";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import Replicate from "replicate";
import { publicErrorMessage } from "@/lib/security/public-error";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const PRESET_PROMPTS = {
  "90s_family":
    "Preserve the exact same person, face, and identity. Transform into a nostalgic 1990s family photo. Use direct flash, warm tones, slight overexposure, film grain, and imperfect composition. Make it look like a real childhood memory from a family album.",
  school:
    "Preserve the same person and face. Turn into a 90s school portrait with studio lighting, simple background, soft smile, vintage tones, and slight grain. Make it feel like a printed school photo from 1995.",
  disposable:
    "Preserve the same person identity. Make it look like a disposable camera photo from early 2000s. Add strong flash, motion blur, grain, noise, and imperfect framing.",
} as const;

type ChildhoodPreset = keyof typeof PRESET_PROMPTS;

function isChildhoodPreset(value: unknown): value is ChildhoodPreset {
  return typeof value === "string" && value in PRESET_PROMPTS;
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
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
    maxBodyBytes: MAX_IMAGE_BYTES + 256_000,
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

  if (image.size > MAX_IMAGE_BYTES) {
    return jsonError("Image must be 10 MB or smaller.", 413);
  }

  if (image.type && !ALLOWED_MIME_TYPES.has(image.type)) {
    return jsonError("Upload a JPG, PNG, or WebP image.", 400);
  }

  const presetRaw = form.get("preset");
  if (!isChildhoodPreset(presetRaw)) {
    return jsonError(
      'Choose a valid preset: "90s_family", "school", or "disposable".',
      400,
    );
  }

  const prompt = PRESET_PROMPTS[presetRaw];
  const tempPath = join(
    tmpdir(),
    `childhood-${randomUUID()}${fileExtension(image)}`,
  );

  try {
    const bytes = Buffer.from(await image.arrayBuffer());
    await writeFile(tempPath, bytes);
    const tempImage = await readFile(tempPath);

    const replicate = new Replicate({ auth: token });
    const output = await replicate.run("stability-ai/sdxl", {
      input: {
        image: tempImage,
        prompt,
        strength: 0.65,
        guidance_scale: 8,
        num_inference_steps: 25,
      },
    });

    const imageUrl = extractImageUrl(output);
    if (!imageUrl) {
      return jsonError(
        "Could not generate a childhood photo. Try a different image.",
        502,
      );
    }

    return Response.json(
      { imageUrl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
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
