import { brandedDownloadFilename } from "@/lib/image";

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;
export const MAX_VIDEO_DURATION_SEC = 10 * 60;

export type CaptionCue = {
  id: string;
  start: number;
  end: number;
  text: string;
};

export type CaptionFontId =
  | "sans"
  | "serif"
  | "mono"
  | "display"
  | "impact";

export type CaptionSizeId = "sm" | "md" | "lg" | "xl";

export type CaptionPositionId =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export const CAPTION_FONTS: Array<{
  id: CaptionFontId;
  label: string;
  family: string;
  weight: number;
}> = [
  {
    id: "sans",
    label: "Sans",
    family: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif',
    weight: 700,
  },
  {
    id: "serif",
    label: "Serif",
    family: 'Georgia, "Times New Roman", serif',
    weight: 700,
  },
  {
    id: "mono",
    label: "Mono",
    family: 'ui-monospace, "Cascadia Code", Consolas, monospace',
    weight: 600,
  },
  {
    id: "display",
    label: "Display",
    family: 'var(--display), "Arial Black", sans-serif',
    weight: 800,
  },
  {
    id: "impact",
    label: "Impact",
    family: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
    weight: 400,
  },
];

export const CAPTION_SIZES: Array<{
  id: CaptionSizeId;
  label: string;
  /** Fraction of video height used as font size. */
  ratio: number;
}> = [
  { id: "sm", label: "Small", ratio: 0.04 },
  { id: "md", label: "Medium", ratio: 0.055 },
  { id: "lg", label: "Large", ratio: 0.07 },
  { id: "xl", label: "XL", ratio: 0.09 },
];

export const CAPTION_POSITIONS: Array<{
  id: CaptionPositionId;
  label: string;
  x: "left" | "center" | "right";
  y: "top" | "middle" | "bottom";
}> = [
  { id: "top-left", label: "Top left", x: "left", y: "top" },
  { id: "top-center", label: "Top center", x: "center", y: "top" },
  { id: "top-right", label: "Top right", x: "right", y: "top" },
  { id: "middle-left", label: "Middle left", x: "left", y: "middle" },
  { id: "middle-center", label: "Middle", x: "center", y: "middle" },
  { id: "middle-right", label: "Middle right", x: "right", y: "middle" },
  { id: "bottom-left", label: "Bottom left", x: "left", y: "bottom" },
  { id: "bottom-center", label: "Bottom center", x: "center", y: "bottom" },
  { id: "bottom-right", label: "Bottom right", x: "right", y: "bottom" },
];

export function isCaptionFontId(value: unknown): value is CaptionFontId {
  return CAPTION_FONTS.some((font) => font.id === value);
}

export function isCaptionSizeId(value: unknown): value is CaptionSizeId {
  return CAPTION_SIZES.some((size) => size.id === value);
}

export function isCaptionPositionId(
  value: unknown,
): value is CaptionPositionId {
  return CAPTION_POSITIONS.some((pos) => pos.id === value);
}

export function getCaptionFont(id: CaptionFontId) {
  return CAPTION_FONTS.find((font) => font.id === id) ?? CAPTION_FONTS[0];
}

export function getCaptionSize(id: CaptionSizeId) {
  return CAPTION_SIZES.find((size) => size.id === id) ?? CAPTION_SIZES[1];
}

export function getCaptionPosition(id: CaptionPositionId) {
  return (
    CAPTION_POSITIONS.find((pos) => pos.id === id) ??
    CAPTION_POSITIONS.find((pos) => pos.id === "bottom-center")!
  );
}

export function validateVideoFile(file: File): string | null {
  const typeOk =
    ACCEPTED_VIDEO_TYPES.includes(
      file.type as (typeof ACCEPTED_VIDEO_TYPES)[number],
    ) ||
    /\.(mp4|webm|mov)$/i.test(file.name);

  if (!typeOk) {
    return "Please upload an MP4, WebM, or MOV video.";
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return `Video must be ${formatVideoFileSize(MAX_VIDEO_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export function formatVideoFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatVideoDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function videoFileBaseName(file: File): string {
  const name = file.name.replace(/\.[^.]+$/, "");
  return name || "video";
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

/** SRT timestamp: HH:MM:SS,mmm */
export function toSrtTimestamp(seconds: number): string {
  const msTotal = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(msTotal / 3_600_000);
  const minutes = Math.floor((msTotal % 3_600_000) / 60_000);
  const secs = Math.floor((msTotal % 60_000) / 1000);
  const ms = msTotal % 1000;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(secs)},${pad3(ms)}`;
}

/** VTT timestamp: HH:MM:SS.mmm */
export function toVttTimestamp(seconds: number): string {
  return toSrtTimestamp(seconds).replace(",", ".");
}

export function captionsToSrt(cues: CaptionCue[]): string {
  return cues
    .map(
      (cue, index) =>
        `${index + 1}\n${toSrtTimestamp(cue.start)} --> ${toSrtTimestamp(cue.end)}\n${cue.text.trim()}`,
    )
    .join("\n\n")
    .concat("\n");
}

export function captionsToVtt(cues: CaptionCue[]): string {
  const body = cues
    .map(
      (cue) =>
        `${toVttTimestamp(cue.start)} --> ${toVttTimestamp(cue.end)}\n${cue.text.trim()}`,
    )
    .join("\n\n");
  return `WEBVTT\n\n${body}\n`;
}

export function downloadTextFile(
  content: string,
  filename: string,
  mime = "text/plain;charset=utf-8",
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = brandedDownloadFilename(filename);
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = brandedDownloadFilename(filename);
  link.click();
  URL.revokeObjectURL(url);
}

export function cueAtTime(
  cues: CaptionCue[],
  timeSec: number,
): CaptionCue | null {
  for (const cue of cues) {
    if (timeSec >= cue.start && timeSec < cue.end) return cue;
  }
  return null;
}

export type DrawCaptionOptions = {
  fontId: CaptionFontId;
  sizeId: CaptionSizeId;
  positionId: CaptionPositionId;
  text: string;
};

export function drawCaptionOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: DrawCaptionOptions,
): void {
  const text = options.text.trim();
  if (!text) return;

  const font = getCaptionFont(options.fontId);
  const size = getCaptionSize(options.sizeId);
  const position = getCaptionPosition(options.positionId);
  const fontSize = Math.max(14, Math.round(height * size.ratio));
  const maxWidth = width * 0.88;
  const lineHeight = fontSize * 1.25;
  const padX = fontSize * 0.45;
  const padY = fontSize * 0.28;

  ctx.save();
  ctx.font = `${font.weight} ${fontSize}px ${font.family}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  const lines = wrapText(ctx, text, maxWidth);
  const blockWidth = Math.min(
    maxWidth,
    Math.max(...lines.map((line) => ctx.measureText(line).width)),
  );
  const blockHeight = lines.length * lineHeight;
  const boxW = blockWidth + padX * 2;
  const boxH = blockHeight + padY * 2;

  const margin = Math.max(12, Math.round(height * 0.04));
  let x = margin;
  if (position.x === "center") x = (width - boxW) / 2;
  if (position.x === "right") x = width - boxW - margin;

  let y = margin;
  if (position.y === "middle") y = (height - boxH) / 2;
  if (position.y === "bottom") y = height - boxH - margin;

  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  roundRect(ctx, x, y, boxW, boxH, Math.min(10, fontSize * 0.25));
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
  ctx.shadowBlur = Math.max(2, fontSize * 0.08);
  ctx.shadowOffsetY = Math.max(1, fontSize * 0.04);

  lines.forEach((line, index) => {
    const lineX = x + padX + (blockWidth - ctx.measureText(line).width) / 2;
    const lineY = y + padY + index * lineHeight;
    ctx.fillText(line, lineX, lineY);
  });

  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const next = `${current} ${words[i]}`;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export type BurnCaptionsProgress = {
  phase: "preparing" | "recording" | "encoding";
  progress: number;
  message: string;
};

/**
 * Re-encode the video with burned-in captions via canvas + MediaRecorder.
 * Output is WebM (browser-supported). Audio is preserved when possible.
 */
export async function burnCaptionsToVideo(options: {
  sourceUrl: string;
  cues: CaptionCue[];
  fontId: CaptionFontId;
  sizeId: CaptionSizeId;
  positionId: CaptionPositionId;
  signal?: AbortSignal;
  onProgress?: (progress: BurnCaptionsProgress) => void;
}): Promise<Blob> {
  const {
    sourceUrl,
    cues,
    fontId,
    sizeId,
    positionId,
    signal,
    onProgress,
  } = options;

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  onProgress?.({
    phase: "preparing",
    progress: 0,
    message: "Preparing video…",
  });

  const video = document.createElement("video");
  video.src = sourceUrl;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";

  await waitForEvent(video, "loadedmetadata", signal);
  if (!Number.isFinite(video.duration) || video.duration <= 0) {
    throw new Error("Could not read video duration.");
  }

  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");

  const canvasStream = canvas.captureStream(30);
  const audioCtx = new AudioContext();
  const destination = audioCtx.createMediaStreamDestination();

  const audioVideo = document.createElement("video");
  audioVideo.src = sourceUrl;
  audioVideo.muted = false;
  audioVideo.playsInline = true;
  audioVideo.preload = "auto";

  await waitForEvent(audioVideo, "loadedmetadata", signal);

  let mixedStream: MediaStream = canvasStream;
  try {
    const sourceNode = audioCtx.createMediaElementSource(audioVideo);
    sourceNode.connect(destination);
    mixedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...destination.stream.getAudioTracks(),
    ]);
  } catch {
    // Some browsers block MediaElementSource; export video-only.
    mixedStream = canvasStream;
  }

  const mimeType = pickRecorderMime();
  const recorder = new MediaRecorder(mixedStream, {
    mimeType,
    videoBitsPerSecond: 4_000_000,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const stopped = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error("Recording failed."));
  });

  onProgress?.({
    phase: "recording",
    progress: 0.05,
    message: "Burning captions…",
  });

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
        recorder.stop();
      } catch {
        /* ignore */
      }
      video.pause();
      audioVideo.pause();
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });

    const tick = () => {
      if (signal?.aborted) return;

      if (video.ended || video.currentTime >= duration - 0.05) {
        ctx.drawImage(video, 0, 0, width, height);
        const last = cueAtTime(cues, Math.min(video.currentTime, duration - 0.01));
        if (last) {
          drawCaptionOnCanvas(ctx, width, height, {
            fontId,
            sizeId,
            positionId,
            text: last.text,
          });
        }
        cancelAnimationFrame(raf);
        signal?.removeEventListener("abort", onAbort);
        resolve();
        return;
      }

      ctx.drawImage(video, 0, 0, width, height);
      const active = cueAtTime(cues, video.currentTime);
      if (active) {
        drawCaptionOnCanvas(ctx, width, height, {
          fontId,
          sizeId,
          positionId,
          text: active.text,
        });
      }

      onProgress?.({
        phase: "recording",
        progress: Math.min(0.95, video.currentTime / duration),
        message: "Burning captions…",
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
  });

  video.pause();
  audioVideo.pause();

  onProgress?.({
    phase: "encoding",
    progress: 0.96,
    message: "Encoding download…",
  });

  if (recorder.state !== "inactive") recorder.stop();
  await stopped;

  await audioCtx.close().catch(() => undefined);
  video.removeAttribute("src");
  audioVideo.removeAttribute("src");
  video.load();
  audioVideo.load();

  if (!chunks.length) {
    throw new Error("Export produced an empty file. Try another browser.");
  }

  onProgress?.({
    phase: "encoding",
    progress: 1,
    message: "Done",
  });

  return new Blob(chunks, { type: mimeType });
}

function pickRecorderMime(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const type of candidates) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type)
    ) {
      return type;
    }
  }
  return "video/webm";
}

function waitForEvent(
  target: HTMLMediaElement,
  eventName: "loadedmetadata" | "canplay",
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const onAbort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };

    const onOk = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error("Failed to load video."));
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
