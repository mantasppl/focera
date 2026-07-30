export const MAX_AUDIO_UPLOAD_BYTES = 24 * 1024 * 1024;

export type TranscribeLanguageId = "auto" | "en";

export const TRANSCRIBE_LANGUAGES: Array<{
  id: TranscribeLanguageId;
  label: string;
}> = [
  { id: "auto", label: "Auto detect" },
  { id: "en", label: "English (faster)" },
];

export function isTranscribeLanguageId(
  value: unknown,
): value is TranscribeLanguageId {
  return value === "auto" || value === "en";
}
