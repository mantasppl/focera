/** Server-safe language helpers for PDF translation (no browser-only deps). */

export type TranslateLanguageId =
  | "auto"
  | "en"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "it"
  | "nl"
  | "pl"
  | "ru"
  | "zh"
  | "ja"
  | "ko"
  | "ar"
  | "tr"
  | "hi";

export type TranslateLanguage = {
  id: TranslateLanguageId;
  label: string;
  hint: string;
};

export const TRANSLATE_LANGUAGES: TranslateLanguage[] = [
  { id: "en", label: "English", hint: "EN" },
  { id: "es", label: "Spanish", hint: "ES" },
  { id: "fr", label: "French", hint: "FR" },
  { id: "de", label: "German", hint: "DE" },
  { id: "pt", label: "Portuguese", hint: "PT" },
  { id: "it", label: "Italian", hint: "IT" },
  { id: "nl", label: "Dutch", hint: "NL" },
  { id: "pl", label: "Polish", hint: "PL" },
  { id: "ru", label: "Russian", hint: "RU" },
  { id: "zh", label: "Chinese", hint: "ZH" },
  { id: "ja", label: "Japanese", hint: "JA" },
  { id: "ko", label: "Korean", hint: "KO" },
  { id: "ar", label: "Arabic", hint: "AR" },
  { id: "tr", label: "Turkish", hint: "TR" },
  { id: "hi", label: "Hindi", hint: "HI" },
];

export const SOURCE_LANGUAGES: TranslateLanguage[] = [
  { id: "auto", label: "Auto-detect", hint: "Detect" },
  ...TRANSLATE_LANGUAGES,
];

export const MAX_TRANSLATE_CHARS = 12_000;
export const MAX_TRANSLATE_CHUNK_CHARS = 2_800;

export function isTranslateLanguageId(
  value: unknown,
): value is TranslateLanguageId {
  if (typeof value !== "string") return false;
  return (
    value === "auto" ||
    TRANSLATE_LANGUAGES.some((language) => language.id === value)
  );
}

export function isTargetLanguageId(
  value: unknown,
): value is Exclude<TranslateLanguageId, "auto"> {
  if (typeof value !== "string" || value === "auto") return false;
  return TRANSLATE_LANGUAGES.some((language) => language.id === value);
}

export function languageLabel(id: TranslateLanguageId): string {
  if (id === "auto") return "Auto-detect";
  return (
    TRANSLATE_LANGUAGES.find((language) => language.id === id)?.label ?? id
  );
}
