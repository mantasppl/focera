import { jsPDF } from "jspdf";
import { downloadBlob, fileBaseName } from "@/lib/image";
import {
  extractTextFromPdf,
  type ExtractPdfTextOptions,
} from "@/lib/pdf-to-text";
import {
  isTargetLanguageId,
  isTranslateLanguageId,
  languageLabel,
  MAX_TRANSLATE_CHUNK_CHARS,
  MAX_TRANSLATE_CHARS,
  SOURCE_LANGUAGES,
  TRANSLATE_LANGUAGES,
  type TranslateLanguage,
  type TranslateLanguageId,
} from "@/lib/pdf-translator-core";

export {
  isTargetLanguageId,
  isTranslateLanguageId,
  languageLabel,
  MAX_TRANSLATE_CHUNK_CHARS,
  MAX_TRANSLATE_CHARS,
  SOURCE_LANGUAGES,
  TRANSLATE_LANGUAGES,
  type TranslateLanguage,
  type TranslateLanguageId,
};

export type PdfTranslatorResult = {
  sourceText: string;
  translatedText: string;
  pageCount: number;
  pagesWithText: number;
  sourceLang: TranslateLanguageId;
  targetLang: TranslateLanguageId;
  wordCount: number;
  charCount: number;
};

export type TranslatePdfOptions = {
  sourceLang?: TranslateLanguageId;
  targetLang: TranslateLanguageId;
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

/** Split long text into chunks that preserve paragraph boundaries when possible. */
export function chunkTextForTranslation(
  text: string,
  maxChars = MAX_TRANSLATE_CHUNK_CHARS,
): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  if (normalized.length <= maxChars) return [normalized];

  const paragraphs = normalized.split(/\n{2,}/);
  const chunks: string[] = [];
  let buffer = "";

  const flush = () => {
    if (buffer.trim()) chunks.push(buffer.trim());
    buffer = "";
  };

  const pushPiece = (piece: string) => {
    if (!piece) return;
    if (piece.length > maxChars) {
      flush();
      for (let i = 0; i < piece.length; i += maxChars) {
        chunks.push(piece.slice(i, i + maxChars).trim());
      }
      return;
    }
    const next = buffer ? `${buffer}\n\n${piece}` : piece;
    if (next.length > maxChars) {
      flush();
      buffer = piece;
      return;
    }
    buffer = next;
  };

  for (const paragraph of paragraphs) {
    pushPiece(paragraph.trim());
  }
  flush();

  return chunks.filter(Boolean);
}

export function validateTranslateRequest(
  text: string,
  sourceLang: unknown,
  targetLang: unknown,
): string | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return "Nothing to translate. Extract text from a PDF first.";
  }
  if (trimmed.length > MAX_TRANSLATE_CHARS) {
    return `Text is too long to translate in one go (${trimmed.length.toLocaleString()} characters). Please use a shorter PDF or fewer pages (max ${MAX_TRANSLATE_CHARS.toLocaleString()} characters).`;
  }
  if (!isTranslateLanguageId(sourceLang)) {
    return "Choose a valid source language.";
  }
  if (!isTargetLanguageId(targetLang)) {
    return "Choose a valid target language.";
  }
  if (sourceLang !== "auto" && sourceLang === targetLang) {
    return "Source and target languages must be different.";
  }
  return null;
}

export async function translateTextChunks(
  text: string,
  sourceLang: TranslateLanguageId,
  targetLang: Exclude<TranslateLanguageId, "auto">,
  options: {
    onProgress?: (current: number, total: number) => void;
    signal?: AbortSignal;
  } = {},
): Promise<string> {
  const chunks = chunkTextForTranslation(text);
  if (!chunks.length) return "";

  const translated: string[] = [];

  for (let i = 0; i < chunks.length; i += 1) {
    throwIfAborted(options.signal);
    options.onProgress?.(i + 1, chunks.length);

    const response = await fetch("/api/pdf-translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: chunks[i],
        sourceLang,
        targetLang,
      }),
      signal: options.signal,
    });

    const data = (await response.json().catch(() => null)) as {
      translatedText?: string;
      error?: string;
    } | null;

    if (!response.ok) {
      throw new Error(
        data?.error ?? "Could not translate this PDF. Try again in a moment.",
      );
    }

    const piece = data?.translatedText?.trim();
    if (!piece) {
      throw new Error("Translation returned empty text. Try again.");
    }

    translated.push(piece);
  }

  return translated.join("\n\n");
}

export async function translatePdfFile(
  file: File,
  options: TranslatePdfOptions,
): Promise<PdfTranslatorResult> {
  const sourceLang = options.sourceLang ?? "auto";
  const { targetLang, onProgress, signal } = options;

  if (!isTargetLanguageId(targetLang)) {
    throw new Error("Choose a valid target language.");
  }

  onProgress?.("Extracting text from PDF…");

  const extractOptions: ExtractPdfTextOptions = {
    layout: "pages",
    signal,
    onProgress: (current, total) => {
      onProgress?.(`Extracting text ${current} of ${total}…`);
    },
  };

  const extracted = await extractTextFromPdf(file, extractOptions);
  throwIfAborted(signal);

  if (!extracted.text.trim()) {
    throw new Error(
      "No extractable text found. This PDF may be scanned — try PDF to JPG, then Image to Text for OCR, and paste the text here later.",
    );
  }

  const validationError = validateTranslateRequest(
    extracted.text,
    sourceLang,
    targetLang,
  );
  if (validationError) {
    throw new Error(validationError);
  }

  onProgress?.("Translating…");

  const translatedText = await translateTextChunks(
    extracted.text,
    sourceLang,
    targetLang,
    {
      signal,
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
    sourceText: extracted.text,
    translatedText,
    pageCount: extracted.pageCount,
    pagesWithText: extracted.pagesWithText,
    sourceLang,
    targetLang,
    wordCount: countWords(translatedText),
    charCount: translatedText.length,
  };
}

export function describePdfTranslatorResult(
  result: PdfTranslatorResult,
  textOverride?: string,
): string {
  const text = textOverride ?? result.translatedText;
  const words = countWords(text);
  const from =
    result.sourceLang === "auto"
      ? "Auto-detect"
      : languageLabel(result.sourceLang);
  const to = languageLabel(result.targetLang);

  if (!text.trim()) {
    return `No translated text · ${from} → ${to}`;
  }

  return `${words.toLocaleString()} words · ${from} → ${to} · ${result.pagesWithText}/${result.pageCount} pages with text`;
}

export function downloadTranslatedPdfText(
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

export function downloadTranslatedPdfDocument(
  text: string,
  sourceFile: File,
  targetLang: TranslateLanguageId,
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 6;
  let y = margin;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const paragraphs = text.replace(/\r\n/g, "\n").split(/\n{2,}/);

  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(
      paragraph.trim() || " ",
      contentWidth,
    ) as string[];

    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }

    y += lineHeight * 0.55;
  }

  const blob = doc.output("blob");
  downloadBlob(
    blob,
    `${fileBaseName(sourceFile)}-${targetLang}-translated.pdf`,
  );
}
