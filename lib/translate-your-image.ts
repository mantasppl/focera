import { downloadBlob, fileBaseName } from "@/lib/image";
import {
  extractTextFromImage,
  OCR_LANGUAGES,
  type OcrLanguageId,
} from "@/lib/image-to-text";
import {
  isTargetLanguageId,
  languageLabel,
  MAX_TRANSLATE_CHARS,
  TRANSLATE_LANGUAGES,
  translateTextChunks,
  type TranslateLanguageId,
} from "@/lib/pdf-translator";

export { OCR_LANGUAGES, TRANSLATE_LANGUAGES };
export type { OcrLanguageId, TranslateLanguageId };

const OCR_TO_TRANSLATE: Record<
  OcrLanguageId,
  Exclude<TranslateLanguageId, "auto">
> = {
  eng: "en",
  spa: "es",
  fra: "fr",
  deu: "de",
  por: "pt",
  chi_sim: "zh",
  jpn: "ja",
};

export type TranslateYourImageResult = {
  sourceText: string;
  translatedText: string;
  ocrLanguage: OcrLanguageId;
  ocrConfidence: number;
  sourceLang: Exclude<TranslateLanguageId, "auto">;
  targetLang: Exclude<TranslateLanguageId, "auto">;
  wordCount: number;
  charCount: number;
};

export type TranslateYourImageOptions = {
  ocrLanguage?: OcrLanguageId;
  targetLang: Exclude<TranslateLanguageId, "auto">;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Translation cancelled.", "AbortError");
  }
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function ocrLanguageToTranslateSource(
  ocrLanguage: OcrLanguageId,
): Exclude<TranslateLanguageId, "auto"> {
  return OCR_TO_TRANSLATE[ocrLanguage];
}

export async function translateYourImage(
  file: File,
  options: TranslateYourImageOptions,
): Promise<TranslateYourImageResult> {
  const ocrLanguage = options.ocrLanguage ?? "eng";
  const { targetLang, onProgress, signal } = options;

  if (!isTargetLanguageId(targetLang)) {
    throw new Error("Choose a valid target language.");
  }

  const sourceLang = ocrLanguageToTranslateSource(ocrLanguage);
  if (sourceLang === targetLang) {
    throw new Error("Image language and target language must be different.");
  }

  onProgress?.("Reading text from image…");

  const extracted = await extractTextFromImage(file, {
    language: ocrLanguage,
    signal,
    onProgress,
  });
  throwIfAborted(signal);

  const sourceText = extracted.text.trim();
  if (!sourceText) {
    throw new Error(
      "No readable text found. Try a clearer photo, higher contrast, or another image language.",
    );
  }

  if (sourceText.length > MAX_TRANSLATE_CHARS) {
    throw new Error(
      `Text is too long to translate in one go (${sourceText.length.toLocaleString()} characters). Try a shorter image or crop to the text you need (max ${MAX_TRANSLATE_CHARS.toLocaleString()} characters).`,
    );
  }

  onProgress?.("Translating…");

  const translatedText = await translateTextChunks(
    sourceText,
    sourceLang,
    targetLang,
    {
      signal,
      toolSlug: "translate-your-image",
      onProgress: (current, total) => {
        onProgress?.(
          total > 1
            ? `Translating part ${current} of ${total}…`
            : "Translating…",
        );
      },
    },
  );

  throwIfAborted(signal);

  return {
    sourceText,
    translatedText,
    ocrLanguage,
    ocrConfidence: extracted.confidence,
    sourceLang,
    targetLang,
    wordCount: countWords(translatedText),
    charCount: translatedText.length,
  };
}

export function describeTranslateYourImageResult(
  result: TranslateYourImageResult,
  textOverride?: string,
): string {
  const text = textOverride ?? result.translatedText;
  const words = countWords(text);
  const from = languageLabel(result.sourceLang);
  const to = languageLabel(result.targetLang);
  const ocr =
    OCR_LANGUAGES.find((item) => item.id === result.ocrLanguage)?.label ??
    result.ocrLanguage;

  if (!text.trim()) {
    return `No translated text · ${from} → ${to}`;
  }

  return `${words.toLocaleString()} words · ${from} → ${to} · OCR ${result.ocrConfidence}% (${ocr})`;
}

export function downloadTranslatedImageText(
  text: string,
  sourceFile: File,
  targetLang: TranslateLanguageId,
): void {
  const blob = new Blob([`${text}\n`], { type: "text/plain;charset=utf-8" });
  downloadBlob(
    blob,
    `${fileBaseName(sourceFile)}-${targetLang}-translated.txt`,
  );
}
