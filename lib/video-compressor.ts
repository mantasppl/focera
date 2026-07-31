import {
  downloadBlob,
  formatVideoDuration,
  formatVideoFileSize,
  MAX_VIDEO_DURATION_SEC,
  validateVideoFile,
  videoFileBaseName,
} from "@/lib/video-caption";

export type CompressVideoLevel = "extreme" | "strong" | "balanced" | "light";

export type CompressVideoPreset = {
  level: CompressVideoLevel;
  label: string;
  hint: string;
  maxDimension: number;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
};

export const COMPRESS_VIDEO_PRESETS: CompressVideoPreset[] = [
  {
    level: "extreme",
    label: "Extreme",
    hint: "Smallest file",
    maxDimension: 480,
    videoBitsPerSecond: 400_000,
    audioBitsPerSecond: 64_000,
  },
  {
    level: "strong",
    label: "Strong",
    hint: "High savings",
    maxDimension: 720,
    videoBitsPerSecond: 800_000,
    audioBitsPerSecond: 96_000,
  },
  {
    level: "balanced",
    label: "Balanced",
    hint: "Good default",
    maxDimension: 1080,
    videoBitsPerSecond: 1_500_000,
    audioBitsPerSecond: 128_000,
  },
  {
    level: "light",
    label: "Light",
    hint: "Best quality",
    maxDimension: 1440,
    videoBitsPerSecond: 2_500_000,
    audioBitsPerSecond: 160_000,
  },
];

export type CompressVideoResult = {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  durationSec: number;
  mimeType: string;
  extension: "webm" | "mp4";
};

export type CompressVideoOptions = {
  level?: CompressVideoLevel;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Compression cancelled.", "AbortError");
  }
}

function getPreset(level: CompressVideoLevel): CompressVideoPreset {
  return (
    COMPRESS_VIDEO_PRESETS.find((preset) => preset.level === level) ??
    COMPRESS_VIDEO_PRESETS[2]
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

function pickRecorderMime(): { mimeType: string; extension: "webm" | "mp4" } {
  const candidates: Array<{ mimeType: string; extension: "webm" | "mp4" }> = [
    { mimeType: "video/webm;codecs=vp9,opus", extension: "webm" },
    { mimeType: "video/webm;codecs=vp8,opus", extension: "webm" },
    { mimeType: "video/webm", extension: "webm" },
    { mimeType: "video/mp4", extension: "mp4" },
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

function waitForEvent(
  target: HTMLMediaElement,
  eventName: "loadedmetadata" | "canplay",
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Compression cancelled.", "AbortError"));
      return;
    }

    const onAbort = () => {
      cleanup();
      reject(new DOMException("Compression cancelled.", "AbortError"));
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

export async function compressVideoFile(
  file: File,
  options: CompressVideoOptions = {},
): Promise<CompressVideoResult> {
  const validationError = validateVideoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  if (typeof MediaRecorder === "undefined") {
    throw new Error(
      "Video compression is not supported in this browser. Try Chrome, Edge, or Firefox.",
    );
  }

  throwIfAborted(options.signal);
  options.onProgress?.("Loading video…");

  const sourceUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = sourceUrl;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  const audioVideo = document.createElement("video");
  audioVideo.src = sourceUrl;
  audioVideo.muted = false;
  audioVideo.playsInline = true;
  audioVideo.preload = "auto";

  let audioCtx: AudioContext | null = null;

  try {
    await waitForEvent(video, "loadedmetadata", options.signal);
    await waitForEvent(audioVideo, "loadedmetadata", options.signal);
    throwIfAborted(options.signal);

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error("Could not read video duration.");
    }

    if (video.duration > MAX_VIDEO_DURATION_SEC) {
      throw new Error(
        `Video must be ${Math.floor(MAX_VIDEO_DURATION_SEC / 60)} minutes or shorter.`,
      );
    }

    const originalWidth = video.videoWidth || 1280;
    const originalHeight = video.videoHeight || 720;
    if (originalWidth < 2 || originalHeight < 2) {
      throw new Error("Could not read video dimensions.");
    }

    const preset = getPreset(options.level ?? "balanced");
    const { width, height } = targetDimensions(
      originalWidth,
      originalHeight,
      preset.maxDimension,
    );

    options.onProgress?.(
      width === even(originalWidth) && height === even(originalHeight)
        ? "Preparing encoder…"
        : `Scaling to ${width}×${height}…`,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas is not available in this browser.");
    }

    const canvasStream = canvas.captureStream(30);
    audioCtx = new AudioContext();
    const destination = audioCtx.createMediaStreamDestination();

    let mixedStream: MediaStream = canvasStream;
    try {
      const sourceNode = audioCtx.createMediaElementSource(audioVideo);
      sourceNode.connect(destination);
      mixedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ]);
    } catch {
      mixedStream = canvasStream;
    }

    const { mimeType, extension } = pickRecorderMime();
    const recorder = new MediaRecorder(mixedStream, {
      mimeType,
      videoBitsPerSecond: preset.videoBitsPerSecond,
      audioBitsPerSecond: preset.audioBitsPerSecond,
    });

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    const stopped = new Promise<void>((resolve, reject) => {
      recorder.onstop = () => resolve();
      recorder.onerror = () =>
        reject(new Error("Compression failed while encoding."));
    });

    options.onProgress?.("Compressing video…");
    recorder.start(250);
    video.currentTime = 0;
    audioVideo.currentTime = 0;

    await Promise.all([
      video.play().catch(() => undefined),
      audioVideo.play().catch(() => undefined),
    ]);

    const duration = video.duration;
    let raf = 0;

    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        cancelAnimationFrame(raf);
        try {
          if (recorder.state !== "inactive") recorder.stop();
        } catch {
          /* ignore */
        }
        video.pause();
        audioVideo.pause();
        reject(new DOMException("Compression cancelled.", "AbortError"));
      };
      options.signal?.addEventListener("abort", onAbort, { once: true });

      const tick = () => {
        if (options.signal?.aborted) return;

        ctx.drawImage(video, 0, 0, width, height);

        if (video.ended || video.currentTime >= duration - 0.05) {
          cancelAnimationFrame(raf);
          options.signal?.removeEventListener("abort", onAbort);
          resolve();
          return;
        }

        const ratio = Math.min(0.95, video.currentTime / duration);
        options.onProgress?.(
          `Compressing… ${Math.round(ratio * 100)}%`,
        );

        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
    });

    video.pause();
    audioVideo.pause();

    options.onProgress?.("Finishing encode…");

    if (recorder.state !== "inactive") recorder.stop();
    await stopped;
    throwIfAborted(options.signal);

    if (!chunks.length) {
      throw new Error("Compression produced an empty file. Try another browser.");
    }

    const blob = new Blob(chunks, { type: mimeType.split(";")[0] || mimeType });
    const originalSize = file.size;
    const compressedSize = blob.size;
    const savingsPercent =
      originalSize > 0
        ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
        : 0;

    return {
      blob,
      originalSize,
      compressedSize,
      savingsPercent,
      width,
      height,
      originalWidth,
      originalHeight,
      durationSec: duration,
      mimeType: blob.type || mimeType,
      extension,
    };
  } finally {
    video.pause();
    audioVideo.pause();
    video.removeAttribute("src");
    audioVideo.removeAttribute("src");
    video.load();
    audioVideo.load();
    URL.revokeObjectURL(sourceUrl);
    await audioCtx?.close().catch(() => undefined);
  }
}

export function downloadCompressedVideo(
  blob: Blob,
  sourceFile: File,
  extension: "webm" | "mp4",
) {
  const base = videoFileBaseName(sourceFile) || "video";
  downloadBlob(blob, `${base}-compressed.${extension}`);
}

export function describeVideoSavings(
  originalSize: number,
  compressedSize: number,
  savingsPercent: number,
): string {
  if (compressedSize < originalSize) {
    return `Reduced ${formatVideoFileSize(originalSize)} → ${formatVideoFileSize(compressedSize)} (${savingsPercent}% smaller)`;
  }
  if (compressedSize === originalSize) {
    return `Size unchanged at ${formatVideoFileSize(compressedSize)}`;
  }
  return `Result is ${formatVideoFileSize(compressedSize)} (original ${formatVideoFileSize(originalSize)}). Try a stronger level.`;
}

export function describeVideoMeta(
  width: number,
  height: number,
  originalWidth: number,
  originalHeight: number,
  durationSec: number,
  extension: string,
): string {
  const sizePart =
    width !== originalWidth || height !== originalHeight
      ? `${width}×${height} (from ${originalWidth}×${originalHeight})`
      : `${width}×${height}`;
  return `${sizePart} · ${formatVideoDuration(durationSec)} · ${extension.toUpperCase()}`;
}
