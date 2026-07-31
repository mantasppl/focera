import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";
import {
  MAX_AUDIO_UPLOAD_BYTES,
  TRANSCRIBE_LANGUAGES,
  type TranscribeLanguageId,
} from "@/lib/video-transcribe-shared";

export const MAX_AUDIO_DURATION_SEC = 10 * 60;

export const ACCEPTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/webm",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
  "audio/x-flac",
] as const;

const ACCEPTED_AUDIO_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".webm",
  ".m4a",
  ".mp4",
  ".aac",
  ".ogg",
  ".oga",
  ".flac",
] as const;

export type AudioOutputMode = "plain" | "timestamped";

export type AudioTranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

export type AudioToTextResult = {
  text: string;
  segments: AudioTranscriptSegment[];
  duration: number;
  language: TranscribeLanguageId;
};

export type AudioTranscribeProgress = {
  phase: "prepare" | "upload" | "transcribe";
  progress: number;
  message: string;
};

export type { TranscribeLanguageId };
export { MAX_AUDIO_UPLOAD_BYTES, TRANSCRIBE_LANGUAGES };

export const AUDIO_OUTPUT_MODES: Array<{
  id: AudioOutputMode;
  label: string;
  hint: string;
}> = [
  { id: "plain", label: "Plain text", hint: "Readable paragraphs" },
  { id: "timestamped", label: "With timestamps", hint: "[mm:ss] lines" },
];

type ApiSegment = {
  start?: unknown;
  end?: unknown;
  text?: unknown;
};

type ApiResponse = {
  text?: string;
  segments?: ApiSegment[];
  cues?: ApiSegment[];
  error?: string;
  duration?: number;
};

function hasAcceptedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ACCEPTED_AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function validateAudioFile(file: File): string | null {
  const typeOk = ACCEPTED_AUDIO_TYPES.includes(
    file.type as (typeof ACCEPTED_AUDIO_TYPES)[number],
  );
  if (!typeOk && !hasAcceptedExtension(file.name)) {
    return "Please upload an MP3, WAV, M4A, WebM, OGG, AAC, or FLAC audio file.";
  }

  if (file.size > MAX_AUDIO_UPLOAD_BYTES) {
    return `Audio must be ${formatFileSize(MAX_AUDIO_UPLOAD_BYTES)} or smaller.`;
  }

  return null;
}

export function formatAudioDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function formatTimestamp(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function toSrtTime(seconds: number): string {
  const totalMs = Math.round(Math.max(0, seconds) * 1000);
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1000);
  const ms = totalMs % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

async function readAudioDuration(
  file: File,
  signal?: AbortSignal,
): Promise<number> {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const url = URL.createObjectURL(file);
  const audio = document.createElement("audio");
  audio.preload = "metadata";
  audio.src = url;

  try {
    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        cleanup();
        reject(new DOMException("Aborted", "AbortError"));
      };
      const onLoaded = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("Could not read this audio file."));
      };
      const cleanup = () => {
        audio.removeEventListener("loadedmetadata", onLoaded);
        audio.removeEventListener("error", onError);
        signal?.removeEventListener("abort", onAbort);
      };

      audio.addEventListener("loadedmetadata", onLoaded, { once: true });
      audio.addEventListener("error", onError, { once: true });
      signal?.addEventListener("abort", onAbort, { once: true });
    });

    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
      throw new Error("Could not read audio duration.");
    }

    return audio.duration;
  } finally {
    audio.removeAttribute("src");
    audio.load();
    URL.revokeObjectURL(url);
  }
}

function parseApiSegments(payload: ApiResponse): AudioTranscriptSegment[] {
  const fromCues = Array.isArray(payload.cues) ? payload.cues : [];
  const fromSegments = Array.isArray(payload.segments) ? payload.segments : [];
  const source = fromCues.length ? fromCues : fromSegments;

  return source
    .map((item) => ({
      start: typeof item.start === "number" ? item.start : Number(item.start),
      end: typeof item.end === "number" ? item.end : Number(item.end),
      text: typeof item.text === "string" ? item.text.trim() : "",
    }))
    .filter(
      (item) =>
        Number.isFinite(item.start) &&
        Number.isFinite(item.end) &&
        item.text.length > 0,
    );
}

export function segmentsToPlainText(
  segments: AudioTranscriptSegment[],
  fallback = "",
): string {
  if (!segments.length) return fallback.trim();

  const chunks: string[] = [];
  let buffer = "";

  for (const segment of segments) {
    const piece = segment.text.trim();
    if (!piece) continue;
    if (!buffer) {
      buffer = piece;
      continue;
    }
    const needsSpace = !buffer.endsWith("\n") && !piece.startsWith("\n");
    buffer += needsSpace ? ` ${piece}` : piece;
    if (/[.!?…]["')\]]*$/.test(piece) || buffer.length > 420) {
      chunks.push(buffer.trim());
      buffer = "";
    }
  }

  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks.join("\n\n") || fallback.trim();
}

export function segmentsToTimestampedText(
  segments: AudioTranscriptSegment[],
  fallback = "",
): string {
  if (!segments.length) return fallback.trim();
  return segments
    .map((segment) => {
      const text = segment.text.trim();
      if (!text) return "";
      return `[${formatTimestamp(segment.start)}] ${text}`;
    })
    .filter(Boolean)
    .join("\n");
}

export function formatTranscriptOutput(
  result: Pick<AudioToTextResult, "segments" | "text">,
  mode: AudioOutputMode,
): string {
  if (mode === "timestamped") {
    return segmentsToTimestampedText(result.segments, result.text);
  }
  return segmentsToPlainText(result.segments, result.text);
}

export function segmentsToSrt(segments: AudioTranscriptSegment[]): string {
  const blocks: string[] = [];
  let index = 1;

  for (const segment of segments) {
    const text = segment.text.trim();
    if (!text) continue;
    const start = Math.max(0, segment.start);
    const end = Math.max(start + 0.2, segment.end);
    blocks.push(
      `${index}\n${toSrtTime(start)} --> ${toSrtTime(end)}\n${text}\n`,
    );
    index += 1;
  }

  return blocks.join("\n");
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function describeTranscriptResult(
  result: AudioToTextResult,
  outputText: string,
): string {
  const words = countWords(outputText);
  const duration = formatAudioDuration(result.duration);
  const segments = result.segments.length;
  return `${words.toLocaleString()} words · ${segments} segment${segments === 1 ? "" : "s"} · ${duration}`;
}

export function downloadTranscriptTxt(
  text: string,
  sourceFile: File,
  mode: AudioOutputMode,
): void {
  const suffix = mode === "timestamped" ? "timestamps" : "transcript";
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `${fileBaseName(sourceFile)}-${suffix}.txt`);
}

export function downloadTranscriptSrt(
  segments: AudioTranscriptSegment[],
  sourceFile: File,
): void {
  const blob = new Blob([segmentsToSrt(segments)], {
    type: "application/x-subrip;charset=utf-8",
  });
  downloadBlob(blob, `${fileBaseName(sourceFile)}.srt`);
}

/**
 * Upload an audio file and transcribe speech via the Focera Whisper API.
 */
export async function transcribeAudioFile(
  file: File,
  options?: {
    language?: TranscribeLanguageId;
    signal?: AbortSignal;
    onProgress?: (progress: AudioTranscribeProgress) => void;
  },
): Promise<AudioToTextResult> {
  const language = options?.language ?? "auto";
  const { signal, onProgress } = options ?? {};

  const validationError = validateAudioFile(file);
  if (validationError) throw new Error(validationError);

  onProgress?.({
    phase: "prepare",
    progress: 0.1,
    message: "Reading audio…",
  });

  const duration = await readAudioDuration(file, signal);
  if (duration > MAX_AUDIO_DURATION_SEC) {
    throw new Error(
      `Audio must be ${Math.floor(MAX_AUDIO_DURATION_SEC / 60)} minutes or shorter.`,
    );
  }

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  onProgress?.({
    phase: "upload",
    progress: 0.35,
    message: "Sending audio for transcription…",
  });

  const form = new FormData();
  form.append("file", file, file.name || "audio.mp3");
  form.append("language", language);
  form.append("duration", String(duration));

  const response = await fetch("/api/video-transcribe", {
    method: "POST",
    body: form,
    signal,
  });

  let payload: ApiResponse = {};
  try {
    payload = (await response.json()) as ApiResponse;
  } catch {
    throw new Error("Transcription returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      payload.error ||
        "Transcription failed. Try again in a moment, or use a clearer recording.",
    );
  }

  onProgress?.({
    phase: "transcribe",
    progress: 0.9,
    message: "Formatting transcript…",
  });

  const segments = parseApiSegments(payload);
  const text =
    typeof payload.text === "string" && payload.text.trim()
      ? payload.text.trim()
      : segments.map((segment) => segment.text).join(" ").trim();

  if (!text && !segments.length) {
    throw new Error(
      "No speech detected. Try another file, or switch language to English.",
    );
  }

  const resolvedDuration =
    typeof payload.duration === "number" && Number.isFinite(payload.duration)
      ? payload.duration
      : duration;

  onProgress?.({
    phase: "transcribe",
    progress: 1,
    message: "Transcript ready.",
  });

  return {
    text,
    segments,
    duration: resolvedDuration,
    language,
  };
}
