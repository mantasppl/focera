import {
  GroqTranscribeError,
  transcribeAudioWithGroq,
} from "@/lib/groq-transcribe-server";
import {
  MAX_AUDIO_UPLOAD_BYTES,
  isTranscribeLanguageId,
} from "@/lib/video-transcribe-shared";

export const runtime = "nodejs";
export const maxDuration = 60;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Invalid multipart form data.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size <= 0) {
    return jsonError("Upload an audio file to transcribe.", 400);
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

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await transcribeAudioWithGroq({
      bytes,
      filename: file.name || "audio.webm",
      mimeType: file.type || "application/octet-stream",
      language,
      durationHint: Number.isFinite(clientDuration)
        ? clientDuration
        : undefined,
    });

    return Response.json({
      text: result.text,
      segments: result.segments,
      cues: result.segments,
      duration: result.duration,
    });
  } catch (err) {
    if (err instanceof GroqTranscribeError) {
      return jsonError(err.message, err.status);
    }
    return jsonError(
      err instanceof Error
        ? err.message
        : "Transcription failed. Try again shortly.",
      502,
    );
  }
}
