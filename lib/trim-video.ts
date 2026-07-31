import {
  downloadBlob,
  formatVideoDuration,
  formatVideoFileSize,
  MAX_VIDEO_DURATION_SEC,
  validateVideoFile,
  videoFileBaseName,
} from "@/lib/video-caption";

export type TrimVideoResult = {
  blob: Blob;
  originalSize: number;
  trimmedSize: number;
  width: number;
  height: number;
  startSec: number;
  endSec: number;
  durationSec: number;
  sourceDurationSec: number;
  mimeType: string;
  extension: "webm" | "mp4";
};

export type TrimVideoOptions = {
  startSec: number;
  endSec: number;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

const MIN_TRIM_DURATION_SEC = 0.2;

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Trim cancelled.", "AbortError");
  }
}

function even(value: number): number {
  return Math.max(2, Math.floor(value / 2) * 2);
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
  eventName: "loadedmetadata" | "canplay" | "seeked",
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Trim cancelled.", "AbortError"));
      return;
    }

    const onAbort = () => {
      cleanup();
      reject(new DOMException("Trim cancelled.", "AbortError"));
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
  const target = Math.max(0, Math.min(time, Math.max(0, video.duration || 0)));
  if (Math.abs(video.currentTime - target) < 0.01) return;
  const seeked = waitForEvent(video, "seeked", signal);
  video.currentTime = target;
  await seeked;
}

export function clampTrimRange(
  startSec: number,
  endSec: number,
  durationSec: number,
): { startSec: number; endSec: number } {
  const duration = Math.max(0, durationSec);
  let start = Number.isFinite(startSec) ? startSec : 0;
  let end = Number.isFinite(endSec) ? endSec : duration;

  start = Math.min(Math.max(0, start), Math.max(0, duration - MIN_TRIM_DURATION_SEC));
  end = Math.min(Math.max(start + MIN_TRIM_DURATION_SEC, end), duration);

  if (end - start < MIN_TRIM_DURATION_SEC) {
    end = Math.min(duration, start + MIN_TRIM_DURATION_SEC);
    start = Math.max(0, end - MIN_TRIM_DURATION_SEC);
  }

  return {
    startSec: Math.round(start * 10) / 10,
    endSec: Math.round(end * 10) / 10,
  };
}

export function validateTrimRange(
  startSec: number,
  endSec: number,
  durationSec: number,
): string | null {
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    return "Could not read video duration.";
  }
  if (!Number.isFinite(startSec) || !Number.isFinite(endSec)) {
    return "Enter valid start and end times.";
  }
  if (startSec < 0) return "Start time cannot be negative.";
  if (endSec > durationSec + 0.05) {
    return "End time cannot be past the video length.";
  }
  if (endSec - startSec < MIN_TRIM_DURATION_SEC) {
    return `Selection must be at least ${MIN_TRIM_DURATION_SEC} seconds.`;
  }
  return null;
}

export async function trimVideoFile(
  file: File,
  options: TrimVideoOptions,
): Promise<TrimVideoResult> {
  const validationError = validateVideoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  if (typeof MediaRecorder === "undefined") {
    throw new Error(
      "Video trimming is not supported in this browser. Try Chrome, Edge, or Firefox.",
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

    const sourceDurationSec = video.duration;
    const { startSec, endSec } = clampTrimRange(
      options.startSec,
      options.endSec,
      sourceDurationSec,
    );
    const rangeError = validateTrimRange(startSec, endSec, sourceDurationSec);
    if (rangeError) throw new Error(rangeError);

    const width = even(video.videoWidth || 1280);
    const height = even(video.videoHeight || 720);
    if (width < 2 || height < 2) {
      throw new Error("Could not read video dimensions.");
    }

    options.onProgress?.("Preparing encoder…");

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
      videoBitsPerSecond: 2_500_000,
      audioBitsPerSecond: 160_000,
    });

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    const stopped = new Promise<void>((resolve, reject) => {
      recorder.onstop = () => resolve();
      recorder.onerror = () =>
        reject(new Error("Trim failed while encoding."));
    });

    options.onProgress?.("Seeking to start…");
    await seekVideo(video, startSec, options.signal);
    await seekVideo(audioVideo, startSec, options.signal);

    options.onProgress?.("Trimming video…");
    recorder.start(250);

    await Promise.all([
      video.play().catch(() => undefined),
      audioVideo.play().catch(() => undefined),
    ]);

    const clipDuration = endSec - startSec;
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
        reject(new DOMException("Trim cancelled.", "AbortError"));
      };
      options.signal?.addEventListener("abort", onAbort, { once: true });

      const tick = () => {
        if (options.signal?.aborted) return;

        ctx.drawImage(video, 0, 0, width, height);

        if (
          video.ended ||
          video.currentTime >= endSec - 0.04 ||
          video.currentTime >= sourceDurationSec - 0.04
        ) {
          cancelAnimationFrame(raf);
          options.signal?.removeEventListener("abort", onAbort);
          resolve();
          return;
        }

        const elapsed = Math.max(0, video.currentTime - startSec);
        const ratio = Math.min(0.95, elapsed / clipDuration);
        options.onProgress?.(`Trimming… ${Math.round(ratio * 100)}%`);

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
      throw new Error("Trim produced an empty file. Try another browser.");
    }

    const blob = new Blob(chunks, { type: mimeType.split(";")[0] || mimeType });

    return {
      blob,
      originalSize: file.size,
      trimmedSize: blob.size,
      width,
      height,
      startSec,
      endSec,
      durationSec: endSec - startSec,
      sourceDurationSec,
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

export function downloadTrimmedVideo(
  blob: Blob,
  sourceFile: File,
  extension: "webm" | "mp4",
) {
  const base = videoFileBaseName(sourceFile) || "video";
  downloadBlob(blob, `${base}-trimmed.${extension}`);
}

export function describeTrimMeta(
  width: number,
  height: number,
  startSec: number,
  endSec: number,
  durationSec: number,
  extension: string,
): string {
  return `${width}×${height} · ${formatVideoDuration(durationSec)} (${formatPreciseTime(startSec)}–${formatPreciseTime(endSec)}) · ${extension.toUpperCase()}`;
}

export function describeTrimSize(
  originalSize: number,
  trimmedSize: number,
): string {
  return `${formatVideoFileSize(trimmedSize)} (source ${formatVideoFileSize(originalSize)})`;
}

/** mm:ss.t for trim UI labels */
export function formatPreciseTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00.0";
  const totalTenths = Math.round(seconds * 10);
  const m = Math.floor(totalTenths / 600);
  const s = Math.floor((totalTenths % 600) / 10);
  const t = totalTenths % 10;
  return `${m}:${String(s).padStart(2, "0")}.${t}`;
}
