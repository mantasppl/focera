import {
  type AudioToTextResult,
  type AudioOutputMode,
  countWords,
  describeTranscriptResult,
  downloadTranscriptSrt,
  downloadTranscriptTxt,
  formatAudioDuration,
  formatTranscriptOutput,
  AUDIO_OUTPUT_MODES,
} from "@/lib/audio-to-text";
import {
  TRANSCRIBE_LANGUAGES,
  transcribeVideoFile,
  type TranscribeLanguageId,
  type TranscribeProgress,
} from "@/lib/video-transcribe";
import { validateVideoFile } from "@/lib/video-caption";

export type VideoToTextResult = AudioToTextResult;
export type VideoOutputMode = AudioOutputMode;
export type VideoTranscribeProgress = TranscribeProgress;

export type { TranscribeLanguageId };
export {
  AUDIO_OUTPUT_MODES as VIDEO_OUTPUT_MODES,
  TRANSCRIBE_LANGUAGES,
  countWords,
  describeTranscriptResult,
  downloadTranscriptSrt,
  downloadTranscriptTxt,
  formatAudioDuration,
  formatTranscriptOutput,
};

/**
 * Extract audio from a video locally, then transcribe via the Focera Whisper API.
 */
export async function transcribeVideoToText(
  file: File,
  options?: {
    language?: TranscribeLanguageId;
    signal?: AbortSignal;
    onProgress?: (progress: TranscribeProgress) => void;
  },
): Promise<VideoToTextResult> {
  const language = options?.language ?? "auto";
  const validationError = validateVideoFile(file);
  if (validationError) throw new Error(validationError);

  const transcribed = await transcribeVideoFile(file, {
    language,
    signal: options?.signal,
    onProgress: options?.onProgress,
  });

  return {
    text: transcribed.text,
    segments: transcribed.cues.map((cue) => ({
      start: cue.start,
      end: cue.end,
      text: cue.text,
    })),
    duration: transcribed.duration,
    language,
  };
}
