import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";
import {
  formatVideoDuration,
  formatVideoFileSize,
} from "@/lib/video-caption";

export const ACCEPTED_GIF_TYPES = ["image/gif"] as const;
export const MAX_GIF_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_GIF_FRAMES = 500;
export const MAX_GIF_DURATION_SEC = 60;
/** Default delay when a frame has no timing metadata (GIF centiseconds often omit 0). */
const DEFAULT_FRAME_DELAY_MS = 100;
const MIN_FRAME_DELAY_MS = 20;
const MIN_OUTPUT_DURATION_MS = 500;

export type GifToMp4Size = "small" | "medium" | "large";
export type GifToMp4Quality = "low" | "medium" | "high";

export type GifToMp4SizePreset = {
  id: GifToMp4Size;
  label: string;
  hint: string;
  maxDimension: number;
};

export type GifToMp4QualityPreset = {
  id: GifToMp4Quality;
  label: string;
  hint: string;
  videoBitsPerSecond: number;
};

export const GIF_TO_MP4_SIZE_PRESETS: GifToMp4SizePreset[] = [
  { id: "small", label: "Small", hint: "480px wide", maxDimension: 480 },
  { id: "medium", label: "Medium", hint: "720px wide", maxDimension: 720 },
  { id: "large", label: "Large", hint: "1080px wide", maxDimension: 1080 },
];

export const GIF_TO_MP4_QUALITY_PRESETS: GifToMp4QualityPreset[] = [
  {
    id: "low",
    label: "Low",
    hint: "Smaller file",
    videoBitsPerSecond: 600_000,
  },
  {
    id: "medium",
    label: "Medium",
    hint: "Good default",
    videoBitsPerSecond: 1_800_000,
  },
  {
    id: "high",
    label: "High",
    hint: "Best quality",
    videoBitsPerSecond: 4_000_000,
  },
];

export type GifToMp4Result = {
  blob: Blob;
  originalSize: number;
  videoSize: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  durationSec: number;
  frameCount: number;
  mimeType: string;
  extension: "mp4" | "webm";
};

export type GifToMp4Options = {
  size?: GifToMp4Size;
  quality?: GifToMp4Quality;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

type DecodedGifFrame = {
  bitmap: ImageBitmap;
  delayMs: number;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function getSizePreset(size: GifToMp4Size): GifToMp4SizePreset {
  return (
    GIF_TO_MP4_SIZE_PRESETS.find((preset) => preset.id === size) ??
    GIF_TO_MP4_SIZE_PRESETS[1]
  );
}

function getQualityPreset(quality: GifToMp4Quality): GifToMp4QualityPreset {
  return (
    GIF_TO_MP4_QUALITY_PRESETS.find((preset) => preset.id === quality) ??
    GIF_TO_MP4_QUALITY_PRESETS[1]
  );
}

function even(value: number): number {
  return Math.max(2, Math.floor(value / 2) * 2);
}

function targetDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) {
    return { width: even(width), height: even(height) };
  }
  const scale = maxDimension / longest;
  return {
    width: even(Math.round(width * scale)),
    height: even(Math.round(height * scale)),
  };
}

function normalizeDelayMs(durationUs: number | null | undefined): number {
  if (typeof durationUs !== "number" || !Number.isFinite(durationUs)) {
    return DEFAULT_FRAME_DELAY_MS;
  }
  const ms = Math.round(durationUs / 1000);
  if (ms <= 0) return DEFAULT_FRAME_DELAY_MS;
  return Math.max(MIN_FRAME_DELAY_MS, ms);
}

function pickRecorderMime(): { mimeType: string; extension: "mp4" | "webm" } {
  const candidates: Array<{ mimeType: string; extension: "mp4" | "webm" }> = [
    { mimeType: "video/mp4;codecs=avc1.42E01E", extension: "mp4" },
    { mimeType: "video/mp4;codecs=avc1", extension: "mp4" },
    { mimeType: "video/mp4", extension: "mp4" },
    { mimeType: "video/webm;codecs=vp9", extension: "webm" },
    { mimeType: "video/webm;codecs=vp8", extension: "webm" },
    { mimeType: "video/webm", extension: "webm" },
  ];

  for (const candidate of candidates) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(candidate.mimeType)
    ) {
      return candidate;
    }
  }

  return { mimeType: "video/webm", extension: "webm" };
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Conversion cancelled.", "AbortError"));
      return;
    }

    const timer = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Conversion cancelled.", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function waitUntil(targetMs: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    let raf = 0;

    const onAbort = () => {
      cancelAnimationFrame(raf);
      reject(new DOMException("Conversion cancelled.", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    const tick = () => {
      if (signal?.aborted) return;
      if (performance.now() >= targetMs) {
        signal?.removeEventListener("abort", onAbort);
        resolve();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
  });
}

export function validateGifFile(file: File): string | null {
  const isGif =
    ACCEPTED_GIF_TYPES.includes(
      file.type as (typeof ACCEPTED_GIF_TYPES)[number],
    ) || file.name.toLowerCase().endsWith(".gif");

  if (!isGif) {
    return "Please upload a GIF file.";
  }

  if (file.size > MAX_GIF_SIZE_BYTES) {
    return `GIF must be ${formatFileSize(MAX_GIF_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

async function decodeGifFrames(
  file: File,
  signal?: AbortSignal,
  onProgress?: (message: string) => void,
): Promise<{
  frames: DecodedGifFrame[];
  originalWidth: number;
  originalHeight: number;
}> {
  throwIfAborted(signal);

  if (typeof ImageDecoder === "undefined") {
    throw new Error(
      "Animated GIF conversion needs a browser with ImageDecoder (Chrome, Edge, or Safari).",
    );
  }

  const supported = await ImageDecoder.isTypeSupported("image/gif");
  if (!supported) {
    throw new Error(
      "This browser cannot decode animated GIFs. Try Chrome, Edge, or Safari.",
    );
  }

  onProgress?.("Reading GIF frames…");
  const data = await file.arrayBuffer();
  throwIfAborted(signal);

  const decoder = new ImageDecoder({
    data,
    type: "image/gif",
    preferAnimation: true,
  });

  const frames: DecodedGifFrame[] = [];

  try {
    await decoder.tracks.ready;
    await decoder.completed;
    throwIfAborted(signal);

    const track = decoder.tracks.selectedTrack;
    if (!track) {
      throw new Error("Could not read frames from this GIF.");
    }

    const frameCount = track.frameCount;
    if (frameCount < 1) {
      throw new Error("This GIF has no decodable frames.");
    }

    if (frameCount > MAX_GIF_FRAMES) {
      throw new Error(
        `This GIF has ${frameCount} frames. Please use a file with ${MAX_GIF_FRAMES} frames or fewer.`,
      );
    }

    let originalWidth = 0;
    let originalHeight = 0;

    for (let index = 0; index < frameCount; index += 1) {
      throwIfAborted(signal);
      onProgress?.(
        `Reading frames… ${Math.round(((index + 1) / frameCount) * 100)}% (${index + 1}/${frameCount})`,
      );

      const result = await decoder.decode({ frameIndex: index });
      const videoFrame = result.image;

      try {
        originalWidth = Math.max(originalWidth, videoFrame.displayWidth);
        originalHeight = Math.max(originalHeight, videoFrame.displayHeight);
        const bitmap = await createImageBitmap(videoFrame);
        frames.push({
          bitmap,
          delayMs: normalizeDelayMs(videoFrame.duration),
        });
      } finally {
        videoFrame.close();
      }
    }

    if (originalWidth < 2 || originalHeight < 2) {
      throw new Error("Could not read GIF dimensions.");
    }

    return { frames, originalWidth, originalHeight };
  } finally {
    decoder.close();
  }
}

function closeFrames(frames: DecodedGifFrame[]) {
  for (const frame of frames) {
    frame.bitmap.close();
  }
}

export async function convertGifToMp4(
  file: File,
  options: GifToMp4Options = {},
): Promise<GifToMp4Result> {
  const validationError = validateGifFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  if (typeof MediaRecorder === "undefined") {
    throw new Error(
      "Video encoding is not supported in this browser. Try Chrome, Edge, or Firefox.",
    );
  }

  throwIfAborted(options.signal);

  const sizePreset = getSizePreset(options.size ?? "medium");
  const qualityPreset = getQualityPreset(options.quality ?? "medium");

  const { frames, originalWidth, originalHeight } = await decodeGifFrames(
    file,
    options.signal,
    options.onProgress,
  );

  try {
    let durationMs = frames.reduce((sum, frame) => sum + frame.delayMs, 0);
    if (durationMs < MIN_OUTPUT_DURATION_MS) {
      const boost = MIN_OUTPUT_DURATION_MS - durationMs;
      frames[frames.length - 1]!.delayMs += boost;
      durationMs = MIN_OUTPUT_DURATION_MS;
    }

    const durationSec = durationMs / 1000;
    if (durationSec > MAX_GIF_DURATION_SEC) {
      throw new Error(
        `For conversion, GIFs must be ${MAX_GIF_DURATION_SEC} seconds or shorter.`,
      );
    }

    const { width, height } = targetDimensions(
      originalWidth,
      originalHeight,
      sizePreset.maxDimension,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas is not available in this browser.");
    }

    const avgDelayMs = durationMs / frames.length;
    const captureFps = Math.min(
      30,
      Math.max(8, Math.round(1000 / Math.max(MIN_FRAME_DELAY_MS, avgDelayMs))),
    );

    const canvasStream = canvas.captureStream(captureFps);
    const { mimeType, extension } = pickRecorderMime();
    const recorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: qualityPreset.videoBitsPerSecond,
    });

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    const stopped = new Promise<void>((resolve, reject) => {
      recorder.onstop = () => resolve();
      recorder.onerror = () =>
        reject(new Error("Conversion failed while encoding video."));
    });

    options.onProgress?.(
      width === even(originalWidth) && height === even(originalHeight)
        ? `Encoding ${frames.length} frames…`
        : `Scaling to ${width}×${height} · encoding ${frames.length} frames…`,
    );

    recorder.start(250);
    const startTime = performance.now();
    let elapsedMs = 0;

    for (let i = 0; i < frames.length; i += 1) {
      throwIfAborted(options.signal);
      const frame = frames[i]!;

      // Video has no alpha — fill a solid backdrop before each frame.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(frame.bitmap, 0, 0, width, height);

      const track = canvasStream.getVideoTracks()[0] as
        | (MediaStreamTrack & { requestFrame?: () => void })
        | undefined;
      track?.requestFrame?.();

      elapsedMs += frame.delayMs;
      const targetTime = startTime + elapsedMs;
      await waitUntil(targetTime, options.signal);

      options.onProgress?.(
        `Converting… ${Math.round(((i + 1) / frames.length) * 100)}% (${i + 1}/${frames.length})`,
      );
    }

    // Hold the last frame briefly so the recorder can flush samples.
    await sleep(120, options.signal);

    options.onProgress?.("Finishing video…");
    if (recorder.state !== "inactive") recorder.stop();
    await stopped;
    throwIfAborted(options.signal);

    for (const track of canvasStream.getTracks()) {
      track.stop();
    }

    if (!chunks.length) {
      throw new Error(
        "Conversion produced an empty file. Try another browser or a shorter GIF.",
      );
    }

    const blob = new Blob(chunks, {
      type: mimeType.split(";")[0] || mimeType,
    });

    return {
      blob,
      originalSize: file.size,
      videoSize: blob.size,
      width,
      height,
      originalWidth,
      originalHeight,
      durationSec,
      frameCount: frames.length,
      mimeType: blob.type || mimeType,
      extension,
    };
  } finally {
    closeFrames(frames);
  }
}

export function downloadGifVideo(
  blob: Blob,
  sourceFile: File,
  extension: "mp4" | "webm",
) {
  const base = fileBaseName(sourceFile) || "gif";
  downloadBlob(blob, `${base}.${extension}`);
}

export function describeGifVideoMeta(
  width: number,
  height: number,
  originalWidth: number,
  originalHeight: number,
  durationSec: number,
  frameCount: number,
  extension: string,
): string {
  const sizePart =
    width !== originalWidth || height !== originalHeight
      ? `${width}×${height} (from ${originalWidth}×${originalHeight})`
      : `${width}×${height}`;
  return `${sizePart} · ${formatVideoDuration(durationSec)} · ${frameCount} frames · ${extension.toUpperCase()}`;
}

export function describeGifVideoSize(
  originalSize: number,
  videoSize: number,
): string {
  return `${formatVideoFileSize(originalSize)} GIF → ${formatVideoFileSize(videoSize)} video`;
}
