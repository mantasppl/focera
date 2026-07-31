import { GIFEncoder, quantize, applyPalette } from "gifenc";
import {
  downloadBlob,
  formatVideoDuration,
  formatVideoFileSize,
  validateVideoFile,
  videoFileBaseName,
} from "@/lib/video-caption";

/** GIF files grow quickly — keep clips short for usable downloads. */
export const MAX_GIF_DURATION_SEC = 30;

export type VideoToGifSize = "small" | "medium" | "large";
export type VideoToGifFps = 8 | 10 | 15;
export type VideoToGifQuality = "low" | "medium" | "high";

export type VideoToGifSizePreset = {
  id: VideoToGifSize;
  label: string;
  hint: string;
  maxDimension: number;
};

export type VideoToGifFpsPreset = {
  id: VideoToGifFps;
  label: string;
  hint: string;
};

export type VideoToGifQualityPreset = {
  id: VideoToGifQuality;
  label: string;
  hint: string;
  maxColors: number;
};

export const VIDEO_TO_GIF_SIZE_PRESETS: VideoToGifSizePreset[] = [
  { id: "small", label: "Small", hint: "320px wide", maxDimension: 320 },
  { id: "medium", label: "Medium", hint: "480px wide", maxDimension: 480 },
  { id: "large", label: "Large", hint: "640px wide", maxDimension: 640 },
];

export const VIDEO_TO_GIF_FPS_PRESETS: VideoToGifFpsPreset[] = [
  { id: 8, label: "8 fps", hint: "Smallest file" },
  { id: 10, label: "10 fps", hint: "Good default" },
  { id: 15, label: "15 fps", hint: "Smoother" },
];

export const VIDEO_TO_GIF_QUALITY_PRESETS: VideoToGifQualityPreset[] = [
  { id: "low", label: "Low", hint: "64 colors", maxColors: 64 },
  { id: "medium", label: "Medium", hint: "128 colors", maxColors: 128 },
  { id: "high", label: "High", hint: "256 colors", maxColors: 256 },
];

export type VideoToGifResult = {
  blob: Blob;
  originalSize: number;
  gifSize: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  durationSec: number;
  frameCount: number;
  fps: number;
};

export type VideoToGifOptions = {
  size?: VideoToGifSize;
  fps?: VideoToGifFps;
  quality?: VideoToGifQuality;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function getSizePreset(size: VideoToGifSize): VideoToGifSizePreset {
  return (
    VIDEO_TO_GIF_SIZE_PRESETS.find((preset) => preset.id === size) ??
    VIDEO_TO_GIF_SIZE_PRESETS[1]
  );
}

function getQualityPreset(quality: VideoToGifQuality): VideoToGifQualityPreset {
  return (
    VIDEO_TO_GIF_QUALITY_PRESETS.find((preset) => preset.id === quality) ??
    VIDEO_TO_GIF_QUALITY_PRESETS[1]
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

function waitForEvent(
  target: HTMLMediaElement,
  eventName: "loadedmetadata" | "seeked",
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Conversion cancelled.", "AbortError"));
      return;
    }

    const onAbort = () => {
      cleanup();
      reject(new DOMException("Conversion cancelled.", "AbortError"));
    };

    const onOk = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error("Could not read this video. Try another file."));
    };

    const cleanup = () => {
      target.removeEventListener(eventName, onOk);
      target.removeEventListener("error", onError);
      signal?.removeEventListener("abort", onAbort);
    };

    target.addEventListener(eventName, onOk, { once: true });
    target.addEventListener("error", onError, { once: true });
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

async function seekVideo(
  video: HTMLVideoElement,
  time: number,
  signal?: AbortSignal,
): Promise<void> {
  throwIfAborted(signal);
  if (Math.abs(video.currentTime - time) < 0.001) return;
  const seeked = waitForEvent(video, "seeked", signal);
  video.currentTime = time;
  await seeked;
}

export async function convertVideoToGif(
  file: File,
  options: VideoToGifOptions = {},
): Promise<VideoToGifResult> {
  const validationError = validateVideoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  throwIfAborted(options.signal);
  options.onProgress?.("Loading video…");

  const sizePreset = getSizePreset(options.size ?? "medium");
  const fps = options.fps ?? 10;
  const qualityPreset = getQualityPreset(options.quality ?? "medium");
  const delayMs = Math.round(1000 / fps);

  const sourceUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = sourceUrl;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  try {
    await waitForEvent(video, "loadedmetadata", options.signal);
    throwIfAborted(options.signal);

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error("Could not read video duration.");
    }

    if (video.duration > MAX_GIF_DURATION_SEC) {
      throw new Error(
        `For GIF conversion, video must be ${MAX_GIF_DURATION_SEC} seconds or shorter.`,
      );
    }

    const originalWidth = video.videoWidth || 1280;
    const originalHeight = video.videoHeight || 720;
    if (originalWidth < 2 || originalHeight < 2) {
      throw new Error("Could not read video dimensions.");
    }

    const { width, height } = targetDimensions(
      originalWidth,
      originalHeight,
      sizePreset.maxDimension,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("Canvas is not available in this browser.");
    }

    const duration = video.duration;
    const frameCount = Math.max(1, Math.ceil(duration * fps));
    const gif = GIFEncoder();

    options.onProgress?.(
      width === originalWidth && height === originalHeight
        ? `Encoding ${frameCount} frames…`
        : `Scaling to ${width}×${height} · ${frameCount} frames…`,
    );

    for (let i = 0; i < frameCount; i += 1) {
      throwIfAborted(options.signal);

      const time = Math.min(duration - 0.001, i / fps);
      await seekVideo(video, time, options.signal);
      ctx.drawImage(video, 0, 0, width, height);

      const { data } = ctx.getImageData(0, 0, width, height);
      const palette = quantize(data, qualityPreset.maxColors);
      const index = applyPalette(data, palette);

      gif.writeFrame(index, width, height, {
        palette,
        delay: delayMs,
        ...(i === 0 ? { repeat: 0 } : {}),
      });

      const ratio = (i + 1) / frameCount;
      options.onProgress?.(
        `Converting… ${Math.round(ratio * 100)}% (${i + 1}/${frameCount})`,
      );

      // Yield so the UI can update between frames.
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      });
    }

    throwIfAborted(options.signal);
    options.onProgress?.("Finishing GIF…");
    gif.finish();

    const bytes = gif.bytes();
    if (!bytes.length) {
      throw new Error("Conversion produced an empty GIF. Try another file.");
    }

    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const blob = new Blob([copy], { type: "image/gif" });

    return {
      blob,
      originalSize: file.size,
      gifSize: blob.size,
      width,
      height,
      originalWidth,
      originalHeight,
      durationSec: duration,
      frameCount,
      fps,
    };
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(sourceUrl);
  }
}

export function downloadGif(blob: Blob, sourceFile: File) {
  const base = videoFileBaseName(sourceFile) || "video";
  downloadBlob(blob, `${base}.gif`);
}

export function describeGifMeta(
  width: number,
  height: number,
  originalWidth: number,
  originalHeight: number,
  durationSec: number,
  fps: number,
  frameCount: number,
): string {
  const sizePart =
    width !== originalWidth || height !== originalHeight
      ? `${width}×${height} (from ${originalWidth}×${originalHeight})`
      : `${width}×${height}`;
  return `${sizePart} · ${formatVideoDuration(durationSec)} · ${fps} fps · ${frameCount} frames`;
}

export function describeGifSize(originalSize: number, gifSize: number): string {
  return `${formatVideoFileSize(originalSize)} video → ${formatVideoFileSize(gifSize)} GIF`;
}
