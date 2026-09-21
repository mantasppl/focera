import { randomUUID } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Groq from "groq-sdk";
import Replicate from "replicate";
import {
  CHILDHOOD_MAX_IMAGE_BYTES,
  CHILDHOOD_NEGATIVE_PROMPT,
  CHILDHOOD_SCENE_HINTS,
  type ChildhoodPresetId,
  isChildhoodPresetId,
} from "@/lib/childhood-photo";

const MODEL_VERSION =
  "226c6bf67a75a129b0f978e518fed33e1fb13956e15761c1ac53c9d2f898c9af";

/** Poll interval while waiting for Replicate (Prefer: wait is unreliable here). */
const REPLICATE_POLL_MS = 1_000;

const MAX_IMAGE_EDGE = 1024;

const GROQ_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
] as const;

/** Keep Groq well under the serverless budget — Replicate needs most of the time. */
const GROQ_TIMEOUT_MS = 6_000;

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

/**
 * Extract an HTTP status from a Replicate ApiError without `instanceof Response`.
 * Next.js bundling can put Response in a different realm, so that check silently fails
 * and errors fall through to the opaque "Try again shortly" message.
 */
function getUpstreamHttpStatus(err: unknown): number | null {
  if (!err || typeof err !== "object") return null;

  const response = (err as { response?: unknown }).response;
  if (response && typeof response === "object" && "status" in response) {
    const status = (response as { status: unknown }).status;
    if (typeof status === "number" && Number.isFinite(status) && status > 0) {
      return status;
    }
  }

  const name = (err as { name?: unknown }).name;
  const message = err instanceof Error ? err.message : String(err);
  if (name === "ApiError" || /failed with status \d+/i.test(message)) {
    const match = message.match(/failed with status (\d{3})\b/i);
    if (match) {
      const status = Number(match[1]);
      if (Number.isFinite(status)) return status;
    }
  }

  return null;
}

function logUpstreamBody(err: unknown, status: number): void {
  const response = (err as { response?: unknown })?.response;
  if (!response || typeof response !== "object") return;
  const maybeClone = (response as { clone?: unknown }).clone;
  if (typeof maybeClone !== "function") return;
  try {
    const cloned = maybeClone.call(response) as { text?: () => Promise<string> };
    if (typeof cloned?.text !== "function") return;
    void cloned
      .text()
      .then((body) => {
        console.error(`[childhood] Replicate HTTP ${status}:`, body.slice(0, 1000));
      })
      .catch(() => {});
  } catch {
    // Body may already be consumed — status mapping still works.
  }
}

/** Map preset → scene hint before calling Groq. */
export function getSceneHint(preset: ChildhoodPresetId): string {
  return CHILDHOOD_SCENE_HINTS[preset];
}

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

export async function callGroq(preset: ChildhoodPresetId): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return buildFallbackPrompt(preset);
  }

  const groq = new Groq({ apiKey, timeout: GROQ_TIMEOUT_MS });
  const userContent = buildPrompt(preset);
  const fallback = buildFallbackPrompt(preset);

  // Race Groq against a hard deadline so a slow prompt never starves Replicate.
  const groqPromise = (async () => {
    for (const model of GROQ_MODELS) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          temperature: 0.4,
          max_tokens: 500,
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
        console.error(`[childhood] Groq model ${model} failed:`, error);
      }
    }
    return fallback;
  })();

  try {
    return await Promise.race([
      groqPromise,
      new Promise<string>((resolve) => {
        setTimeout(() => resolve(fallback), GROQ_TIMEOUT_MS);
      }),
    ]);
  } catch (error) {
    console.error("[childhood] Groq unavailable, using fallback prompt:", error);
    return fallback;
  }
}

function sniffMime(bytes: Buffer, fallback: string): "image/jpeg" | "image/png" {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (fallback === "image/png") return "image/png";
  return "image/jpeg";
}

/**
 * Normalize upload to jpeg, fix orientation, resize longest edge to 1024px.
 * Always JPEG — the face IP-Adapter model is most reliable with jpeg bytes.
 * Sharp is loaded dynamically so a native-binary failure cannot crash the route.
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

  const input = Buffer.from(await file.arrayBuffer());
  let buffer = input;
  let mime: "image/jpeg" | "image/png" = "image/jpeg";

  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(input, { failOn: "none" }).metadata();
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);

    let pipeline = sharp(input, { failOn: "none" }).rotate();
    if (longest > MAX_IMAGE_EDGE) {
      pipeline = pipeline.resize({
        width: MAX_IMAGE_EDGE,
        height: MAX_IMAGE_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Flatten alpha onto white, then JPEG — avoids PNG/webp edge cases on Replicate.
    buffer = await pipeline
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
    mime = "image/jpeg";
  } catch (error) {
    console.error("[childhood] sharp prepare failed, using original bytes:", error);
    buffer = input;
    mime = sniffMime(input, file.type || "image/jpeg");
    if (mime !== "image/jpeg" && mime !== "image/png") {
      throw new ChildhoodApiError(
        "Could not read this image. Try a JPG or PNG portrait instead.",
        400,
      );
    }
  }

  const ext = mime === "image/png" ? ".png" : ".jpg";
  const tempPath = join(tmpdir(), `childhood-${randomUUID()}${ext}`);
  await writeFile(tempPath, buffer);

  return { buffer, mime, tempPath };
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

export function mapGenerationError(err: unknown): ChildhoodApiError {
  if (err instanceof ChildhoodApiError) return err;

  const upstreamStatus = getUpstreamHttpStatus(err);
  if (upstreamStatus !== null) {
    logUpstreamBody(err, upstreamStatus);

    if (upstreamStatus === 401 || upstreamStatus === 403) {
      return new ChildhoodApiError(
        "AI generation is not configured. Set a valid REPLICATE_API_TOKEN on the server.",
        503,
      );
    }
    if (upstreamStatus === 402) {
      return new ChildhoodApiError(
        "AI generation is temporarily unavailable (billing). Try again later.",
        503,
      );
    }
    if (upstreamStatus === 429) {
      return new ChildhoodApiError(
        "Too many requests right now. Wait a moment and try again.",
        429,
      );
    }
    if (upstreamStatus === 422) {
      return new ChildhoodApiError(
        "Could not process this photo. Use a clear JPG/PNG front-facing portrait and try again.",
        422,
      );
    }
    if (upstreamStatus >= 500) {
      return new ChildhoodApiError(
        "Could not generate a childhood photo. The image service failed — try again shortly.",
        502,
      );
    }
    return new ChildhoodApiError(
      "Could not generate a childhood photo. The image service failed — try again shortly.",
      502,
    );
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

  if (/aborted|timeout|ETIMEDOUT|AbortError|FUNCTION_INVOCATION_TIMEOUT/i.test(raw)) {
    return new ChildhoodApiError(
      "Generation timed out. The AI is busy — wait a few seconds and try again.",
      504,
    );
  }

  if (/fetch failed|ECONNRESET|ENOTFOUND|EAI_AGAIN|socket hang up|network/i.test(raw)) {
    return new ChildhoodApiError(
      "Could not reach the image service. Wait a moment and try again.",
      502,
    );
  }

  if (/sharp|libvips|Input buffer/i.test(raw)) {
    return new ChildhoodApiError(
      "Could not read this image. Try a JPG or PNG portrait instead.",
      400,
    );
  }

  console.error(
    "[childhood] unmapped generation error:",
    raw || (err instanceof Error ? err.name : typeof err),
    err,
  );

  return new ChildhoodApiError(
    "Could not generate a childhood photo. Try again shortly.",
    502,
  );
}

/** @deprecated use mapGenerationError */
export const mapReplicateError = mapGenerationError;

/**
 * Build a schema-valid image URI for Replicate.
 *
 * Never pass a raw Node Buffer into the SDK — across Next.js bundling boundaries
 * `instanceof Buffer` can fail and the value gets JSON-serialized as an object → 422.
 * Small portraits use a data URI; larger payloads upload via files.create (File/Uint8Array).
 */
async function toReplicateImageUri(
  replicate: Replicate,
  buffer: Buffer,
  mime: string,
): Promise<string> {
  const safeMime =
    mime === "image/png" || mime === "image/jpeg" ? mime : "image/jpeg";
  const dataUri = `data:${safeMime};base64,${buffer.toString("base64")}`;

  // Resized portraits are almost always under this — data URI is the most reliable.
  if (dataUri.length <= 3_500_000) {
    return dataUri;
  }

  const ext = safeMime === "image/png" ? "png" : "jpg";
  const file = new File([new Uint8Array(buffer)], `face.${ext}`, {
    type: safeMime,
  });

  try {
    const uploaded = await replicate.files.create(file);
    const url = uploaded?.urls?.get;
    if (typeof url === "string" && /^https?:\/\//i.test(url)) {
      return url;
    }
    console.error("[childhood] files.create returned no URL:", uploaded);
  } catch (error) {
    console.error("[childhood] files.create failed, using data URI:", error);
  }

  return dataUri;
}

/**
 * Run lucataco/ip_adapter-sdxl-face and return the hosted image URL.
 *
 * Uses predictions.create + explicit poll instead of replicate.run({ wait: block }).
 * The SDK's Prefer:wait path treats status "processing" as done and returns empty
 * output — common when the long-poll window ends before SDXL finishes.
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
  });

  const imageUri = await toReplicateImageUri(
    replicate,
    options.image,
    options.mime,
  );

  // Create without Prefer: wait, then poll until terminal status.
  let prediction = await replicate.predictions.create({
    version: MODEL_VERSION,
    input: {
      image: imageUri,
      prompt: options.prompt,
      negative_prompt: CHILDHOOD_NEGATIVE_PROMPT,
      scale: 0.65,
      num_inference_steps: 30,
      num_outputs: 1,
    },
  });

  if (
    prediction.status !== "succeeded" &&
    prediction.status !== "failed" &&
    prediction.status !== "canceled"
  ) {
    prediction = await replicate.wait(prediction, {
      interval: REPLICATE_POLL_MS,
    });
  }

  if (prediction.status === "failed") {
    throw new Error(`Prediction failed: ${prediction.error ?? "unknown"}`);
  }

  if (prediction.status !== "succeeded") {
    console.error("[childhood] prediction ended without success:", {
      id: prediction.id,
      status: prediction.status,
      error: prediction.error,
    });
    throw new ChildhoodApiError(
      "Could not generate a childhood photo. Try again shortly.",
      502,
    );
  }

  const imageUrl = extractImageUrl(prediction.output);
  if (!imageUrl) {
    console.error("[childhood] unexpected Replicate output:", prediction.output);
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
  // Next.js / undici may return Blob or File depending on runtime.
  if (!(image instanceof Blob) || image.size <= 0) {
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

  const file =
    image instanceof File
      ? image
      : new File([image], "upload.jpg", {
          type: type || "image/jpeg",
        });

  return { image: file, preset: presetRaw };
}
