import { randomUUID } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Groq from "groq-sdk";
import Replicate, { type ApiError } from "replicate";
import sharp from "sharp";
import {
  CHILDHOOD_MAX_IMAGE_BYTES,
  CHILDHOOD_NEGATIVE_PROMPT,
  CHILDHOOD_SCENE_HINTS,
  type ChildhoodPresetId,
  isChildhoodPresetId,
} from "@/lib/childhood-photo";

const MODEL =
  "lucataco/ip_adapter-sdxl-face:226c6bf67a75a129b0f978e518fed33e1fb13956e15761c1ac53c9d2f898c9af" as const;

const MAX_IMAGE_EDGE = 1024;

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
] as const;

const GROQ_SYSTEM = `You are an expert prompt engineer for image-to-image diffusion models.
Your goal is to generate highly controlled prompts that preserve identity and produce realistic nostalgic photos.`;

export type PreparedChildhoodImage = {
  buffer: Buffer;
  mime: "image/jpeg" | "image/png";
  tempPath: string;
};

export class ChildhoodApiError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "ChildhoodApiError";
    this.status = status;
  }
}

function isApiError(err: unknown): err is ApiError {
  return (
    !!err &&
    typeof err === "object" &&
    "response" in err &&
    (err as ApiError).response instanceof Response
  );
}

/** Map preset → scene hint before calling Groq. */
export function getSceneHint(preset: ChildhoodPresetId): string {
  return CHILDHOOD_SCENE_HINTS[preset];
}

/**
 * Build the Groq user message / fallback structured prompt.
 * Identity preservation is non-negotiable.
 */
export function buildPrompt(preset: ChildhoodPresetId): string {
  const scene = getSceneHint(preset);

  return `Generate a structured prompt with these sections:

1. IDENTITY (must preserve face exactly)
2. SCENE (based on preset)
3. CAMERA (90s style)
4. LIGHTING
5. IMPERFECTIONS (grain, blur, flash)
6. MOOD (nostalgic, candid, imperfect)

IMPORTANT RULES:
- Do NOT change person identity
- Do NOT describe a new person
- Do NOT add fantasy elements
- Keep it realistic, like a real photo

STRICT RULE:
The person in the image must remain exactly the same. Do not change identity, face, or proportions.

Write a detailed prompt with:

IDENTITY:
Preserve exact same face, eyes, proportions, and identity.

SCENE:
${scene}

CAMERA:
1990s film camera, direct flash, slightly overexposed

LIGHTING:
harsh flash, warm tones

IMPERFECTIONS:
film grain, slight blur, noise, imperfect framing

MOOD:
nostalgic, candid, real memory

FINAL RULE:
The result must look like a real photo from a family album, not AI generated.

Return ONLY the final prompt.`;
}

/** Deterministic fallback if Groq is unavailable. */
export function buildFallbackPrompt(preset: ChildhoodPresetId): string {
  const scene = getSceneHint(preset);

  return `IDENTITY: Preserve the exact same person, face, eyes, proportions, skin tone, age appearance, and identity. Do not change who this is. Do not invent a new person.

SCENE: ${scene}. Keep the subject as the clear focus of a real childhood photograph.

CAMERA: 1990s consumer film camera or disposable camera look, direct on-camera flash, slightly overexposed highlights, imperfect amateur composition, not a modern smartphone photo.

LIGHTING: Harsh direct flash, warm nostalgic tones, mild overexposure, soft shadow falloff behind the subject.

IMPERFECTIONS: Visible film grain, slight motion or focus blur, fine noise, imperfect framing, candid snapshot energy — not studio-perfect.

MOOD: Nostalgic, candid, imperfect, like a real childhood memory pulled from a family album.

FINAL RULE: The output must look like a real photograph from a family album. Same person identity. No cartoon, painting, illustration, or obvious AI look.`;
}

function cleanPrompt(text: string): string {
  return text
    .replace(/^```(?:text|markdown|md)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

/** Call Groq to generate a structured identity-preserving nostalgia prompt. */
export async function callGroq(preset: ChildhoodPresetId): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return buildFallbackPrompt(preset);
  }

  const groq = new Groq({ apiKey, timeout: 25_000 });
  const userContent = buildPrompt(preset);
  let lastError: unknown;

  for (const model of GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0.4,
        max_tokens: 700,
        messages: [
          { role: "system", content: GROQ_SYSTEM },
          { role: "user", content: userContent },
        ],
      });

      const text = cleanPrompt(completion.choices[0]?.message?.content ?? "");
      if (text.length >= 80) {
        return text;
      }
    } catch (error) {
      lastError = error;
      console.error(`[childhood] Groq model ${model} failed:`, error);
    }
  }

  console.error("[childhood] Groq unavailable, using fallback prompt:", lastError);
  return buildFallbackPrompt(preset);
}

/**
 * Normalize upload to jpeg/png, fix orientation, resize longest edge to 1024px.
 */
export async function prepareImage(
  file: File,
): Promise<PreparedChildhoodImage> {
  if (!(file instanceof File) || file.size <= 0) {
    throw new ChildhoodApiError("Upload an image file.", 400);
  }
  if (file.size > CHILDHOOD_MAX_IMAGE_BYTES) {
    throw new ChildhoodApiError("Image must be 10 MB or smaller.", 413);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(bytes, { failOn: "none" }).metadata();
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);

  let pipeline = sharp(bytes, { failOn: "none" }).rotate();
  if (longest > MAX_IMAGE_EDGE) {
    pipeline = pipeline.resize({
      width: MAX_IMAGE_EDGE,
      height: MAX_IMAGE_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const preferPng = meta.hasAlpha === true || file.type === "image/png";
  const buffer = preferPng
    ? await pipeline.png({ compressionLevel: 8 }).toBuffer()
    : await pipeline.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
  const mime = preferPng ? ("image/png" as const) : ("image/jpeg" as const);
  const ext = preferPng ? ".png" : ".jpg";
  const tempPath = join(tmpdir(), `childhood-${randomUUID()}${ext}`);
  await writeFile(tempPath, buffer);

  return {
    buffer,
    mime,
    tempPath,
  };
}

export async function cleanupPreparedImage(
  prepared: PreparedChildhoodImage | null,
): Promise<void> {
  if (!prepared) return;
  await unlink(prepared.tempPath).catch(() => {});
}

function extractImageUrl(output: unknown): string | null {
  if (typeof output === "string" && output.length > 0) {
    if (/^https?:\/\//i.test(output)) return output;
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
        if (/^https?:\/\//i.test(href)) return href;
      } catch {
        return null;
      }
    }
    if (typeof maybeUrl === "string" && /^https?:\/\//i.test(maybeUrl)) {
      return maybeUrl;
    }
    if (typeof (output as { toString?: unknown }).toString === "function") {
      const asString = String(output);
      if (/^https?:\/\//i.test(asString)) return asString;
    }
  }

  return null;
}

export function mapReplicateError(err: unknown): ChildhoodApiError {
  if (err instanceof ChildhoodApiError) return err;

  if (isApiError(err)) {
    const status = err.response.status;
    if (status === 401 || status === 403) {
      return new ChildhoodApiError(
        "AI generation is not configured. Set a valid REPLICATE_API_TOKEN on the server.",
        503,
      );
    }
    if (status === 402) {
      return new ChildhoodApiError(
        "AI generation is temporarily unavailable (billing). Try again later.",
        503,
      );
    }
    if (status === 429) {
      return new ChildhoodApiError(
        "Too many requests right now. Wait a moment and try again.",
        429,
      );
    }
    if (status === 422) {
      return new ChildhoodApiError(
        "Could not process this photo. Use a clear, front-facing portrait and try again.",
        422,
      );
    }
  }

  const raw = err instanceof Error ? err.message.trim() : "";
  if (/Prediction failed:/i.test(raw)) {
    const detail = raw.replace(/^Prediction failed:\s*/i, "").trim();
    if (/nsfw|safety|sensitive/i.test(detail)) {
      return new ChildhoodApiError(
        "That photo was blocked by the safety filter. Try another image.",
        422,
      );
    }
    if (/face|detect|landmark/i.test(detail)) {
      return new ChildhoodApiError(
        "Could not detect a clear face. Upload a front-facing portrait and try again.",
        422,
      );
    }
    return new ChildhoodApiError(
      "Could not generate a childhood photo from that image. Try a clearer portrait.",
      502,
    );
  }

  if (/aborted|timeout|ETIMEDOUT|AbortError/i.test(raw)) {
    return new ChildhoodApiError(
      "Generation timed out. Wait a moment and try again.",
      504,
    );
  }

  return new ChildhoodApiError(
    "Could not generate a childhood photo. Try again shortly.",
    502,
  );
}

/**
 * Run lucataco/ip_adapter-sdxl-face and return the hosted image URL.
 * Uploads a Blob (not a giant data URI) so Replicate receives a proper file URL.
 */
export async function generateImage(options: {
  image: Buffer;
  mime: string;
  prompt: string;
}): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    throw new ChildhoodApiError(
      "Childhood photo generation is not configured. Set REPLICATE_API_TOKEN and try again.",
      503,
    );
  }

  const replicate = new Replicate({
    auth: token,
    useFileOutput: false,
    fileEncodingStrategy: "upload",
  });

  // Blob is uploaded by the Replicate SDK → hosted URL. Do NOT pass a data URI
  // (those stay inline in the prediction JSON and frequently fail / time out).
  const imageBlob = new Blob([new Uint8Array(options.image)], {
    type: options.mime || "image/jpeg",
  });

  const output = await replicate.run(MODEL, {
    input: {
      image: imageBlob,
      prompt: options.prompt,
      negative_prompt: CHILDHOOD_NEGATIVE_PROMPT,
      scale: 0.65,
      num_inference_steps: 30,
      num_outputs: 1,
      // guidance_scale is NOT in this model's schema — do not send it.
    },
  });

  const imageUrl = extractImageUrl(output);
  if (!imageUrl) {
    console.error("[childhood] unexpected Replicate output:", output);
    throw new ChildhoodApiError(
      "Could not generate a childhood photo. Try a different image.",
      502,
    );
  }

  return imageUrl;
}

export function parseChildhoodForm(form: FormData): {
  image: File;
  preset: ChildhoodPresetId;
} {
  const image = form.get("image");
  if (!(image instanceof File) || image.size <= 0) {
    throw new ChildhoodApiError("Upload an image file.", 400);
  }

  if (image.size > CHILDHOOD_MAX_IMAGE_BYTES) {
    throw new ChildhoodApiError("Image must be 10 MB or smaller.", 413);
  }

  const type = image.type || "";
  if (
    type &&
    type !== "image/jpeg" &&
    type !== "image/jpg" &&
    type !== "image/png" &&
    type !== "image/webp"
  ) {
    throw new ChildhoodApiError("Upload a JPG, PNG, or WebP image.", 400);
  }

  const presetRaw = form.get("preset");
  if (!isChildhoodPresetId(presetRaw)) {
    throw new ChildhoodApiError(
      'Choose a valid preset: "90s_family", "school", or "disposable".',
      400,
    );
  }

  return { image, preset: presetRaw };
}

/** Only allow proxying Replicate-hosted delivery URLs. */
export function isAllowedResultUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return (
      host === "replicate.delivery" ||
      host.endsWith(".replicate.delivery") ||
      host === "pbxt.replicate.delivery"
    );
  } catch {
    return false;
  }
}
