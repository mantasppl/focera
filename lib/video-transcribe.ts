import {
  type CaptionCue,
  MAX_VIDEO_DURATION_SEC,
} from "@/lib/video-caption";
import {
  MAX_AUDIO_UPLOAD_BYTES,
  type TranscribeLanguageId,
} from "@/lib/video-transcribe-shared";

export type TranscribeProgress = {
  phase: "extract" | "upload" | "transcribe";
  progress: number;
  message: string;
};

export type { TranscribeLanguageId };
export {
  MAX_AUDIO_UPLOAD_BYTES,
  TRANSCRIBE_LANGUAGES,
} from "@/lib/video-transcribe-shared";

type ApiSegment = {
  start?: unknown;
  end?: unknown;
  text?: unknown;
};

type ApiResponse = {
  text?: string;
  segments?: ApiSegment[];
  cues?: Array<{
    start?: unknown;
    end?: unknown;
    text?: unknown;
  }>;
  error?: string;
  duration?: number;
};

function cueId(): string {
  return `cue-${Math.random().toString(36).slice(2, 10)}`;
}

function roundTime(value: number): number {
  return Math.round(Math.max(0, value) * 100) / 100;
}

function waitMediaEvent(
  target: HTMLMediaElement,
  eventName: "loadedmetadata" | "ended" | "canplay",
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
      reject(new Error("Failed to load video audio."));
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

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function encodeWavMono16(
  samples: Float32Array,
  sampleRate: number,
): Blob {
  const dataLength = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(
      offset,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true,
    );
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function mixToMono(buffer: AudioBuffer): Float32Array {
  const { numberOfChannels, length } = buffer;
  if (numberOfChannels === 1) {
    return buffer.getChannelData(0).slice(0);
  }
  const mono = new Float32Array(length);
  for (let ch = 0; ch < numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      mono[i] += data[i] / numberOfChannels;
    }
  }
  return mono;
}

function resampleLinear(
  input: Float32Array,
  fromRate: number,
  toRate: number,
): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const outLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const srcIndex = i * ratio;
    const left = Math.floor(srcIndex);
    const right = Math.min(left + 1, input.length - 1);
    const t = srcIndex - left;
    output[i] = input[left] * (1 - t) + input[right] * t;
  }
  return output;
}

async function decodeToWavBlob(file: File): Promise<{
  blob: Blob;
  duration: number;
  filename: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const ctx = new AudioContext();
  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
    if (decoded.duration > MAX_VIDEO_DURATION_SEC) {
      throw new Error(
        `Video must be ${Math.floor(MAX_VIDEO_DURATION_SEC / 60)} minutes or shorter for autocaption.`,
      );
    }
    const mono = mixToMono(decoded);
    const resampled = resampleLinear(mono, decoded.sampleRate, 16_000);
    const blob = encodeWavMono16(resampled, 16_000);
    return { blob, duration: decoded.duration, filename: "audio.wav" };
  } finally {
    await ctx.close().catch(() => undefined);
  }
}

/**
 * Capture a compressed audio-only WebM from the video element.
 * Keeps uploads small so transcription stays under provider size limits.
 */
async function captureCompressedAudio(
  file: File,
  signal?: AbortSignal,
): Promise<{ blob: Blob; duration: number; filename: string }> {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = url;
  video.playsInline = true;
  video.muted = true;
  video.preload = "auto";

  const audioCtx = new AudioContext();

  try {
    await waitMediaEvent(video, "loadedmetadata", signal);
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error("Could not read video duration for transcription.");
    }
    if (video.duration > MAX_VIDEO_DURATION_SEC) {
      throw new Error(
        `Video must be ${Math.floor(MAX_VIDEO_DURATION_SEC / 60)} minutes or shorter for autocaption.`,
      );
    }

    const source = audioCtx.createMediaElementSource(video);
    const destination = audioCtx.createMediaStreamDestination();
    source.connect(destination);

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

    if (!mimeType) {
      throw new Error("This browser cannot compress audio for upload.");
    }

    const recorder = new MediaRecorder(destination.stream, {
      mimeType,
      audioBitsPerSecond: 48_000,
    });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    const stopped = new Promise<void>((resolve, reject) => {
      recorder.onstop = () => resolve();
      recorder.onerror = () =>
        reject(new Error("Could not capture audio from this video."));
    });

    recorder.start(250);
    video.currentTime = 0;
    await video.play();

    await Promise.race([
      waitMediaEvent(video, "ended", signal),
      sleep(video.duration * 1000 + 1500, signal),
    ]);

    video.pause();
    if (recorder.state !== "inactive") recorder.stop();
    await stopped;

    if (!chunks.length) {
      throw new Error(
        "No audio track found. Use a video that includes spoken audio.",
      );
    }

    return {
      blob: new Blob(chunks, { type: mimeType }),
      duration: video.duration,
      filename: "audio.webm",
    };
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
    await audioCtx.close().catch(() => undefined);
  }
}

export async function extractAudioBlob(
  file: File,
  options?: {
    signal?: AbortSignal;
    onProgress?: (progress: TranscribeProgress) => void;
  },
): Promise<{ blob: Blob; duration: number; filename: string }> {
  const { signal, onProgress } = options ?? {};
  onProgress?.({
    phase: "extract",
    progress: 0.08,
    message: "Extracting audio from video…",
  });

  try {
    const compressed = await captureCompressedAudio(file, signal);
    if (compressed.blob.size > 0 && compressed.blob.size <= MAX_AUDIO_UPLOAD_BYTES) {
      onProgress?.({
        phase: "extract",
        progress: 0.35,
        message: "Audio ready.",
      });
      return compressed;
    }
  } catch {
    // Fall through to WAV decode path.
  }

  onProgress?.({
    phase: "extract",
    progress: 0.2,
    message: "Decoding audio track…",
  });

  const wav = await decodeToWavBlob(file);
  if (wav.blob.size > MAX_AUDIO_UPLOAD_BYTES) {
    throw new Error(
      "Audio is too large to transcribe. Try a shorter clip (under ~10 minutes).",
    );
  }

  onProgress?.({
    phase: "extract",
    progress: 0.35,
    message: "Audio ready.",
  });
  return wav;
}

export function segmentsToCues(
  segments: Array<{ start: number; end: number; text: string }>,
  fallbackText: string,
  duration: number,
): CaptionCue[] {
  const safeDuration = Math.max(0.5, duration);
  const cues: CaptionCue[] = [];

  for (const segment of segments) {
    const text = segment.text.trim();
    if (!text) continue;
    let start = Number.isFinite(segment.start) ? segment.start : 0;
    let end = Number.isFinite(segment.end) ? segment.end : start + 2;
    if (end <= start) end = Math.min(safeDuration, start + 0.8);
    start = Math.min(Math.max(0, start), safeDuration);
    end = Math.min(Math.max(end, start + 0.2), safeDuration);
    cues.push({
      id: cueId(),
      start: roundTime(start),
      end: roundTime(end),
      text,
    });
  }

  if (cues.length) return cues;

  const text = fallbackText.trim();
  if (!text) return [];
  return [
    {
      id: cueId(),
      start: 0,
      end: roundTime(safeDuration),
      text,
    },
  ];
}

function parseApiSegments(payload: ApiResponse): Array<{
  start: number;
  end: number;
  text: string;
}> {
  const fromCues = Array.isArray(payload.cues) ? payload.cues : [];
  const fromSegments = Array.isArray(payload.segments) ? payload.segments : [];
  const source = fromCues.length ? fromCues : fromSegments;

  return source
    .map((item) => ({
      start: typeof item.start === "number" ? item.start : Number(item.start),
      end: typeof item.end === "number" ? item.end : Number(item.end),
      text: typeof item.text === "string" ? item.text : "",
    }))
    .filter(
      (item) =>
        Number.isFinite(item.start) &&
        Number.isFinite(item.end) &&
        item.text.trim().length > 0,
    );
}

/**
 * Extract audio locally, then transcribe via the Focera API (server-side Whisper).
 * Users do not download a speech model.
 */
export async function transcribeVideoFile(
  file: File,
  options?: {
    language?: TranscribeLanguageId;
    signal?: AbortSignal;
    onProgress?: (progress: TranscribeProgress) => void;
  },
): Promise<{ cues: CaptionCue[]; text: string; duration: number }> {
  const language = options?.language ?? "auto";
  const { signal, onProgress } = options ?? {};

  const audio = await extractAudioBlob(file, { signal, onProgress });
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  onProgress?.({
    phase: "upload",
    progress: 0.45,
    message: "Sending audio for transcription…",
  });

  const form = new FormData();
  form.append("file", audio.blob, audio.filename);
  form.append("language", language);
  form.append("duration", String(audio.duration));

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
        "Transcription failed. Try again in a moment, or use a clearer clip.",
    );
  }

  onProgress?.({
    phase: "transcribe",
    progress: 0.9,
    message: "Building timed captions…",
  });

  const duration =
    typeof payload.duration === "number" && Number.isFinite(payload.duration)
      ? payload.duration
      : audio.duration;

  const cues = segmentsToCues(
    parseApiSegments(payload),
    payload.text ?? "",
    duration,
  );

  if (!cues.length) {
    throw new Error(
      "No speech detected. Try another clip, or switch language to English.",
    );
  }

  onProgress?.({
    phase: "transcribe",
    progress: 1,
    message: `Found ${cues.length} caption${cues.length === 1 ? "" : "s"}.`,
  });

  return {
    cues,
    text: payload.text?.trim() ?? cues.map((c) => c.text).join(" "),
    duration,
  };
}
