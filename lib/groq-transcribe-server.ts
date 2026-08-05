import {
  MAX_AUDIO_UPLOAD_BYTES,
  type TranscribeLanguageId,
} from "@/lib/video-transcribe-shared";

const GROQ_TRANSCRIBE_URL =
  "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_MODEL = "whisper-large-v3-turbo";

type GroqSegment = {
  id?: number;
  start?: number;
  end?: number;
  text?: string;
};

type GroqVerboseResponse = {
  text?: string;
  duration?: number;
  segments?: GroqSegment[];
  error?: { message?: string };
};

export type GroqTranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

export type GroqTranscriptResult = {
  text: string;
  segments: GroqTranscriptSegment[];
  duration?: number;
};

export class GroqTranscribeError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GroqTranscribeError";
    this.status = status;
  }
}

export async function transcribeAudioWithGroq(options: {
  bytes: ArrayBuffer | Uint8Array | Buffer;
  filename: string;
  mimeType?: string;
  language?: TranscribeLanguageId;
  durationHint?: number;
}): Promise<GroqTranscriptResult> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new GroqTranscribeError(
      "Transcription service is temporarily unavailable. Try again later.",
      503,
    );
  }

  const size =
    options.bytes instanceof Buffer
      ? options.bytes.byteLength
      : options.bytes.byteLength;

  if (size <= 0) {
    throw new GroqTranscribeError("Audio file is empty.", 400);
  }

  if (size > MAX_AUDIO_UPLOAD_BYTES) {
    throw new GroqTranscribeError(
      "Audio is too large to transcribe. Try a shorter clip.",
      413,
    );
  }

  const language = options.language ?? "auto";
  const source =
    options.bytes instanceof Uint8Array
      ? options.bytes
      : new Uint8Array(options.bytes);
  const copy = new Uint8Array(source.byteLength);
  copy.set(source);
  const blob = new Blob([copy], {
    type: options.mimeType || "application/octet-stream",
  });

  const upstream = new FormData();
  upstream.append("file", blob, options.filename);
  upstream.append("model", GROQ_MODEL);
  upstream.append("response_format", "verbose_json");
  upstream.append("temperature", "0");
  upstream.append("timestamp_granularities[]", "segment");

  if (language === "en") {
    upstream.append("language", "en");
  }

  let response: Response;
  try {
    response = await fetch(GROQ_TRANSCRIBE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: upstream,
    });
  } catch {
    throw new GroqTranscribeError(
      "Could not reach the transcription service. Try again in a moment.",
      502,
    );
  }

  let payload: GroqVerboseResponse = {};
  try {
    payload = (await response.json()) as GroqVerboseResponse;
  } catch {
    throw new GroqTranscribeError(
      "Transcription service returned an invalid response.",
      502,
    );
  }

  if (!response.ok) {
    const message =
      payload.error?.message ||
      (response.status === 429
        ? "Transcription is busy right now. Wait a few seconds and try again."
        : "Transcription failed. Try a clearer clip or try again shortly.");
    const status =
      response.status >= 400 && response.status < 600 ? response.status : 502;
    throw new GroqTranscribeError(message, status);
  }

  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  const segments = Array.isArray(payload.segments)
    ? payload.segments
        .map((segment) => ({
          start: typeof segment.start === "number" ? segment.start : 0,
          end: typeof segment.end === "number" ? segment.end : 0,
          text: typeof segment.text === "string" ? segment.text.trim() : "",
        }))
        .filter((segment) => segment.text.length > 0)
    : [];

  if (!text && !segments.length) {
    throw new GroqTranscribeError(
      "No speech detected. Try another video, or switch language to English.",
      422,
    );
  }

  const duration =
    typeof payload.duration === "number" && Number.isFinite(payload.duration)
      ? payload.duration
      : typeof options.durationHint === "number" &&
          Number.isFinite(options.durationHint)
        ? options.durationHint
        : undefined;

  return { text, segments, duration };
}
