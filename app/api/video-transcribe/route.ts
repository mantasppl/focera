import {
  MAX_AUDIO_UPLOAD_BYTES,
  isTranscribeLanguageId,
} from "@/lib/video-transcribe-shared";

export const runtime = "nodejs";
export const maxDuration = 60;

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

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return jsonError(
      "Video autocaption is not configured. Set GROQ_API_KEY on the server.",
      503,
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Invalid multipart form data.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size <= 0) {
    return jsonError("Upload an audio file extracted from your video.", 400);
  }

  if (file.size > MAX_AUDIO_UPLOAD_BYTES) {
    return jsonError(
      "Audio is too large to transcribe. Try a shorter clip.",
      413,
    );
  }

  const languageRaw = form.get("language");
  const language = isTranscribeLanguageId(languageRaw) ? languageRaw : "auto";

  const durationRaw = form.get("duration");
  const clientDuration =
    typeof durationRaw === "string" ? Number.parseFloat(durationRaw) : NaN;

  const upstream = new FormData();
  upstream.append("file", file, file.name || "audio.webm");
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
    return jsonError(
      "Could not reach the transcription service. Try again in a moment.",
      502,
    );
  }

  let payload: GroqVerboseResponse = {};
  try {
    payload = (await response.json()) as GroqVerboseResponse;
  } catch {
    return jsonError(
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
    return jsonError(message, status);
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
    return jsonError(
      "No speech detected. Try another clip, or switch language to English.",
      422,
    );
  }

  const duration =
    typeof payload.duration === "number" && Number.isFinite(payload.duration)
      ? payload.duration
      : Number.isFinite(clientDuration)
        ? clientDuration
        : undefined;

  return Response.json({
    text,
    segments,
    cues: segments,
    duration,
  });
}
