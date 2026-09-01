import { downloadBlob, fileBaseName } from "@/lib/image";
import { isConstrainedClient, unblurWithAi } from "@/lib/unblur-ai";

type UnblurPass = {
  radiusFraction: number;
  minRadius: number;
  maxRadius: number;
  amount: number;
  threshold: number;
  blurPasses: number;
};

/**
 * AI restore first. If the model cannot run, fall back to a strong
 * unsharp mask: original + amount × (original − blur).
 */
const SHARPEN_FALLBACK_PASSES: UnblurPass[] = [
  {
    radiusFraction: 0.006,
    minRadius: 2,
    maxRadius: 7,
    amount: 0.9,
    threshold: 3,
    blurPasses: 2,
  },
  {
    radiusFraction: 0.0025,
    minRadius: 1,
    maxRadius: 3,
    amount: 1.65,
    threshold: 1,
    blurPasses: 1,
  },
];

const HALO_LIMIT = 42;

export type UnblurEngine = "ai" | "sharpen";

export type UnblurImageResult = {
  blob: Blob;
  width: number;
  height: number;
  engine: UnblurEngine;
};

export type UnblurImageOptions = {
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Unblur cancelled.", "AbortError");
  }
}

async function yieldToMain(signal?: AbortSignal) {
  throwIfAborted(signal);
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });
  throwIfAborted(signal);
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }
  return ctx;
}

function passRadius(width: number, height: number, pass: UnblurPass): number {
  const minSide = Math.min(width, height);
  return Math.round(
    Math.min(
      pass.maxRadius,
      Math.max(pass.minRadius, minSide * pass.radiusFraction),
    ),
  );
}

/**
 * Separable box blur into `out` (RGBA). Alpha is copied from source.
 * Uses a sliding-window sum so large radii stay reasonably fast.
 */
function boxBlurSeparable(
  src: Uint8ClampedArray,
  out: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
  temp: Float32Array,
) {
  const r = Math.max(1, Math.floor(radius));
  const windowSize = r * 2 + 1;

  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;

    for (let kx = -r; kx <= r; kx += 1) {
      const x = Math.min(width - 1, Math.max(0, kx));
      const i = (row + x) * 4;
      sumR += src[i];
      sumG += src[i + 1];
      sumB += src[i + 2];
    }

    for (let x = 0; x < width; x += 1) {
      const t = (row + x) * 3;
      temp[t] = sumR / windowSize;
      temp[t + 1] = sumG / windowSize;
      temp[t + 2] = sumB / windowSize;

      const leaveX = Math.min(width - 1, Math.max(0, x - r));
      const enterX = Math.min(width - 1, Math.max(0, x + r + 1));
      const leave = (row + leaveX) * 4;
      const enter = (row + enterX) * 4;
      sumR += src[enter] - src[leave];
      sumG += src[enter + 1] - src[leave + 1];
      sumB += src[enter + 2] - src[leave + 2];
    }
  }

  for (let x = 0; x < width; x += 1) {
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;

    for (let ky = -r; ky <= r; ky += 1) {
      const y = Math.min(height - 1, Math.max(0, ky));
      const t = (y * width + x) * 3;
      sumR += temp[t];
      sumG += temp[t + 1];
      sumB += temp[t + 2];
    }

    for (let y = 0; y < height; y += 1) {
      const o = (y * width + x) * 4;
      out[o] = sumR / windowSize;
      out[o + 1] = sumG / windowSize;
      out[o + 2] = sumB / windowSize;
      out[o + 3] = src[o + 3];

      const leaveY = Math.min(height - 1, Math.max(0, y - r));
      const enterY = Math.min(height - 1, Math.max(0, y + r + 1));
      const leave = (leaveY * width + x) * 3;
      const enter = (enterY * width + x) * 3;
      sumR += temp[enter] - temp[leave];
      sumG += temp[enter + 1] - temp[leave + 1];
      sumB += temp[enter + 2] - temp[leave + 2];
    }
  }
}

function blurImage(
  src: Uint8ClampedArray,
  out: Uint8ClampedArray,
  scratch: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
  iterations: number,
  temp: Float32Array,
) {
  const n = Math.max(1, Math.floor(iterations));
  let from = src;
  let to = out;

  for (let i = 0; i < n; i += 1) {
    boxBlurSeparable(from, to, width, height, radius, temp);
    if (i === n - 1) {
      if (to !== out) {
        out.set(to);
      }
      return;
    }
    const nextFrom = to;
    to = from === src ? scratch : from;
    from = nextFrom;
  }
}

/** Unsharp mask: original + amount × (original − blurred). */
function applyUnsharpMask(
  pixels: Uint8ClampedArray,
  copy: Uint8ClampedArray,
  blurred: Uint8ClampedArray,
  scratch: Uint8ClampedArray,
  temp: Float32Array,
  width: number,
  height: number,
  amount: number,
  radius: number,
  threshold: number,
  blurPasses: number,
) {
  copy.set(pixels);
  blurImage(copy, blurred, scratch, width, height, radius, blurPasses, temp);

  for (let i = 0; i < pixels.length; i += 4) {
    for (let c = 0; c < 3; c += 1) {
      const diff = copy[i + c] - blurred[i + c];
      if (Math.abs(diff) > threshold) {
        const delta = Math.max(-HALO_LIMIT, Math.min(HALO_LIMIT, diff * amount));
        pixels[i + c] = Math.min(
          255,
          Math.max(0, Math.round(copy[i + c] + delta)),
        );
      }
    }
    pixels[i + 3] = copy[i + 3];
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not export the unblurred image."));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

const PREVIEW_MAX_EDGE_DESKTOP = 1024;
const PREVIEW_MAX_EDGE_MOBILE = 720;

function previewMaxEdge(): number {
  return isConstrainedClient() ? PREVIEW_MAX_EDGE_MOBILE : PREVIEW_MAX_EDGE_DESKTOP;
}

/** Decode a blob/file into a display-sized JPEG so the slider does not OOM. */
export async function createUnblurPreviewUrl(source: Blob): Promise<string> {
  const maxEdge = previewMaxEdge();
  const bitmap = await createImageBitmap(source);
  const longest = Math.max(bitmap.width, bitmap.height);
  if (longest <= maxEdge) {
    bitmap.close();
    return URL.createObjectURL(source);
  }

  const scale = maxEdge / longest;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    bitmap.close();
    return URL.createObjectURL(source);
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const preview = await canvasToBlob(canvas, "image/jpeg", 0.85);
  canvas.width = 0;
  canvas.height = 0;
  return URL.createObjectURL(preview);
}

export type UnblurDownloadFormat = "jpg" | "png" | "webp";

export const UNBLUR_DOWNLOAD_FORMATS: Array<{
  value: UnblurDownloadFormat;
  label: string;
  hint: string;
}> = [
  {
    value: "jpg",
    label: "JPG",
    hint: "Smaller file size, great for photos",
  },
  {
    value: "png",
    label: "PNG",
    hint: "Lossless quality, supports transparency",
  },
  {
    value: "webp",
    label: "WebP",
    hint: "Modern format, best compression",
  },
];

async function encodeUnblurDownload(
  source: Blob,
  format: UnblurDownloadFormat,
): Promise<Blob> {
  if (format === "jpg" && source.type === "image/jpeg") return source;
  if (format === "png" && source.type === "image/png") return source;

  const bitmap = await createImageBitmap(source);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d", { alpha: format !== "jpg" });
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas is not supported in this browser.");
  }

  if (format === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const mimeType = format === "jpg" ? "image/jpeg" : "image/webp";
  const blob = await canvasToBlob(canvas, mimeType, 0.92);
  canvas.width = 0;
  canvas.height = 0;
  return blob;
}

export async function downloadUnblurredImage(
  blob: Blob,
  sourceFile: File,
  format: UnblurDownloadFormat = "png",
) {
  const encoded = await encodeUnblurDownload(blob, format);
  downloadBlob(encoded, `${fileBaseName(sourceFile)}-unblurred.${format}`);
}

export async function unblurImageFile(
  file: File,
  options: UnblurImageOptions = {},
): Promise<UnblurImageResult> {
  const { onProgress, signal } = options;

  throwIfAborted(signal);
  onProgress?.("Loading image…");
  const bitmap = await createImageBitmap(file);
  throwIfAborted(signal);

  try {
    const enhanced = await unblurWithAi(bitmap, {
      onProgress,
      signal,
    });
    return {
      ...enhanced,
      engine: "ai",
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    onProgress?.("AI unavailable — sharpening instead…");
    const fallback = await createImageBitmap(file);
    try {
      return await unblurWithSharpen(fallback, onProgress, signal);
    } finally {
      try {
        fallback.close();
      } catch {
        // Already closed.
      }
    }
  } finally {
    try {
      bitmap.close();
    } catch {
      // unblurWithAi closes the bitmap after drawing the work canvas.
    }
  }
}

async function unblurWithSharpen(
  image: HTMLImageElement | ImageBitmap,
  onProgress?: (message: string) => void,
  signal?: AbortSignal,
): Promise<UnblurImageResult> {
  const sourceWidth =
    "naturalWidth" in image && image.naturalWidth
      ? image.naturalWidth
      : image.width;
  const sourceHeight =
    "naturalHeight" in image && image.naturalHeight
      ? image.naturalHeight
      : image.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("Could not determine image dimensions.");
  }

  const longest = Math.max(sourceWidth, sourceHeight);
  const scale = longest > 1600 ? 1600 / longest : 1;
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  onProgress?.("Preparing image…");
  await yieldToMain(signal);
  const canvas = createCanvas(width, height);
  const ctx = getContext(canvas);
  ctx.drawImage(image, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const copy = new Uint8ClampedArray(pixels.length);
  const blurred = new Uint8ClampedArray(pixels.length);
  const scratch = new Uint8ClampedArray(pixels.length);
  const temp = new Float32Array(width * height * 3);

  for (let index = 0; index < SHARPEN_FALLBACK_PASSES.length; index += 1) {
    throwIfAborted(signal);
    onProgress?.(index === 0 ? "Sharpening…" : "Refining edges…");
    await yieldToMain(signal);

    const pass = SHARPEN_FALLBACK_PASSES[index];
    applyUnsharpMask(
      pixels,
      copy,
      blurred,
      scratch,
      temp,
      width,
      height,
      pass.amount,
      passRadius(width, height, pass),
      pass.threshold,
      pass.blurPasses,
    );
  }

  ctx.putImageData(imageData, 0, 0);

  throwIfAborted(signal);
  onProgress?.("Exporting…");
  const blob = await canvasToBlob(canvas, "image/jpeg", 0.9);
  canvas.width = 0;
  canvas.height = 0;

  return {
    blob,
    width,
    height,
    engine: "sharpen",
  };
}
