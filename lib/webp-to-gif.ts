import { GIFEncoder, quantize, applyPalette } from "gifenc";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";

export const ACCEPTED_WEBP_TYPES = ["image/webp"] as const;
export const MAX_WEBP_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_WEBP_FRAMES = 300;

export type WebpToGifSize = "small" | "medium" | "large";
export type WebpToGifQuality = "low" | "medium" | "high";

export type WebpToGifSizePreset = {
  id: WebpToGifSize;
  label: string;
  hint: string;
  maxDimension: number;
};

export type WebpToGifQualityPreset = {
  id: WebpToGifQuality;
  label: string;
  hint: string;
  maxColors: number;
};

export const WEBP_TO_GIF_SIZE_PRESETS: WebpToGifSizePreset[] = [
  { id: "small", label: "Small", hint: "320px wide", maxDimension: 320 },
  { id: "medium", label: "Medium", hint: "480px wide", maxDimension: 480 },
  { id: "large", label: "Large", hint: "640px wide", maxDimension: 640 },
];

export const WEBP_TO_GIF_QUALITY_PRESETS: WebpToGifQualityPreset[] = [
  { id: "low", label: "Low", hint: "64 colors", maxColors: 64 },
  { id: "medium", label: "Medium", hint: "128 colors", maxColors: 128 },
  { id: "high", label: "High", hint: "256 colors", maxColors: 256 },
];

export type WebpToGifResult = {
  blob: Blob;
  url: string;
  originalSize: number;
  gifSize: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  frameCount: number;
  animated: boolean;
};

export type ConvertWebpToGifOptions = {
  size?: WebpToGifSize;
  quality?: WebpToGifQuality;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

type DecodedFrame = {
  bitmap: ImageBitmap;
  durationMs: number;
};

function isImageDecoderSupported(): boolean {
  return typeof ImageDecoder !== "undefined";
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

export function validateWebpFile(file: File): string | null {
  const isWebp =
    ACCEPTED_WEBP_TYPES.includes(
      file.type as (typeof ACCEPTED_WEBP_TYPES)[number],
    ) || file.name.toLowerCase().endsWith(".webp");

  if (!isWebp) {
    return "Please upload a WebP file.";
  }

  if (file.size > MAX_WEBP_SIZE_BYTES) {
    return `WebP must be ${formatFileSize(MAX_WEBP_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

function getSizePreset(size: WebpToGifSize): WebpToGifSizePreset {
  return (
    WEBP_TO_GIF_SIZE_PRESETS.find((preset) => preset.id === size) ??
    WEBP_TO_GIF_SIZE_PRESETS[1]
  );
}

function getQualityPreset(quality: WebpToGifQuality): WebpToGifQualityPreset {
  return (
    WEBP_TO_GIF_QUALITY_PRESETS.find((preset) => preset.id === quality) ??
    WEBP_TO_GIF_QUALITY_PRESETS[1]
  );
}

function targetDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) {
    return {
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    };
  }
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function gifDelayMs(durationMs: number): number {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return 100;
  }
  return Math.max(20, Math.min(10000, Math.round(durationMs / 10) * 10));
}

function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function drawContained(
  context: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  canvasWidth: number,
  canvasHeight: number,
) {
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  const scale = Math.min(
    canvasWidth / bitmap.width,
    canvasHeight / bitmap.height,
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const x = Math.round((canvasWidth - width) / 2);
  const y = Math.round((canvasHeight - height) / 2);
  context.drawImage(bitmap, x, y, width, height);
}

async function bitmapFromVideoFrame(videoFrame: VideoFrame): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(videoFrame);
  } catch {
    const canvas = document.createElement("canvas");
    canvas.width = videoFrame.displayWidth;
    canvas.height = videoFrame.displayHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not supported in this browser.");
    }
    context.drawImage(videoFrame, 0, 0);
    return createImageBitmap(canvas);
  }
}

async function decodeStaticFallback(
  file: File,
  signal?: AbortSignal,
): Promise<DecodedFrame[]> {
  throwIfAborted(signal);
  try {
    const bitmap = await createImageBitmap(file);
    return [{ bitmap, durationMs: 100 }];
  } catch {
    throw new Error(
      `"${file.name}" could not be read. Try another WebP image.`,
    );
  }
}

async function decodeWebpFrames(
  file: File,
  onProgress?: (message: string) => void,
  signal?: AbortSignal,
): Promise<DecodedFrame[]> {
  throwIfAborted(signal);

  if (!isImageDecoderSupported()) {
    onProgress?.("Reading WebP…");
    return decodeStaticFallback(file, signal);
  }

  const supported = await ImageDecoder.isTypeSupported("image/webp");
  if (!supported) {
    onProgress?.("Reading WebP…");
    return decodeStaticFallback(file, signal);
  }

  const data = await file.arrayBuffer();
  throwIfAborted(signal);

  const decoder = new ImageDecoder({
    data,
    type: "image/webp",
    preferAnimation: true,
  });

  const frames: DecodedFrame[] = [];

  try {
    await decoder.tracks.ready;
    await decoder.completed;
    throwIfAborted(signal);

    const track = decoder.tracks.selectedTrack;
    if (!track) {
      throw new Error("Could not read frames from this WebP.");
    }

    const frameCount = track.frameCount;
    if (frameCount < 1) {
      throw new Error("This WebP has no decodable frames.");
    }

    if (frameCount > MAX_WEBP_FRAMES) {
      throw new Error(
        `This WebP has ${frameCount} frames. Please use a file with ${MAX_WEBP_FRAMES} frames or fewer.`,
      );
    }

    for (let index = 0; index < frameCount; index += 1) {
      throwIfAborted(signal);
      onProgress?.(`Reading frame ${index + 1} of ${frameCount}…`);

      const result = await decoder.decode({ frameIndex: index });
      const videoFrame = result.image;

      try {
        const durationUs = videoFrame.duration;
        const durationMs =
          typeof durationUs === "number" ? Math.round(durationUs / 1000) : 100;
        const bitmap = await bitmapFromVideoFrame(videoFrame);
        frames.push({ bitmap, durationMs });
      } finally {
        videoFrame.close();
      }

      await yieldToUi();
    }
  } finally {
    decoder.close();
  }

  return frames;
}

function closeFrames(frames: DecodedFrame[]) {
  for (const frame of frames) {
    frame.bitmap.close();
  }
}

export async function convertWebpToGif(
  file: File,
  options: ConvertWebpToGifOptions = {},
): Promise<WebpToGifResult> {
  const validationError = validateWebpFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const sizePreset = getSizePreset(options.size ?? "medium");
  const qualityPreset = getQualityPreset(options.quality ?? "medium");

  options.onProgress?.("Reading WebP…");
  const frames = await decodeWebpFrames(file, options.onProgress, options.signal);

  try {
    if (frames.length === 0) {
      throw new Error("This WebP has no decodable frames.");
    }

    throwIfAborted(options.signal);

    const scaled = frames.map((frame) =>
      targetDimensions(
        frame.bitmap.width,
        frame.bitmap.height,
        sizePreset.maxDimension,
      ),
    );
    const width = Math.max(...scaled.map((size) => size.width));
    const height = Math.max(...scaled.map((size) => size.height));
    const originalWidth = Math.max(
      ...frames.map((frame) => frame.bitmap.width),
    );
    const originalHeight = Math.max(
      ...frames.map((frame) => frame.bitmap.height),
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("Canvas is not supported in this browser.");
    }

    const gif = GIFEncoder();
    const total = frames.length;

    for (let index = 0; index < total; index += 1) {
      throwIfAborted(options.signal);
      options.onProgress?.(
        `Encoding frame ${index + 1} of ${total}…`,
      );

      drawContained(context, frames[index].bitmap, width, height);
      const { data } = context.getImageData(0, 0, width, height);
      const palette = quantize(data, qualityPreset.maxColors);
      const indexed = applyPalette(data, palette);
      gif.writeFrame(indexed, width, height, {
        palette,
        delay: gifDelayMs(frames[index].durationMs),
        ...(index === 0 ? { repeat: 0 } : {}),
      });

      await yieldToUi();
    }

    throwIfAborted(options.signal);
    options.onProgress?.("Finishing GIF…");
    gif.finish();

    const bytes = gif.bytes();
    if (!bytes.length) {
      throw new Error("Conversion produced an empty GIF. Try another image.");
    }

    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const blob = new Blob([copy], { type: "image/gif" });

    return {
      blob,
      url: URL.createObjectURL(blob),
      originalSize: file.size,
      gifSize: blob.size,
      width,
      height,
      originalWidth,
      originalHeight,
      frameCount: frames.length,
      animated: frames.length > 1,
    };
  } finally {
    closeFrames(frames);
  }
}

export function revokeWebpToGifResult(result: WebpToGifResult | null) {
  if (!result) return;
  URL.revokeObjectURL(result.url);
}

export function downloadWebpGif(result: WebpToGifResult, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "webp";
  downloadBlob(result.blob, `${base}.gif`);
}

export function describeWebpGifOutput(result: WebpToGifResult): string {
  const sizePart =
    result.width !== result.originalWidth ||
    result.height !== result.originalHeight
      ? `${result.width}×${result.height} (from ${result.originalWidth}×${result.originalHeight})`
      : `${result.width}×${result.height}`;
  const frames =
    result.frameCount === 1 ? "1 frame" : `${result.frameCount} frames`;
  return `${sizePart} · ${frames} · ${formatFileSize(result.gifSize)}`;
}
