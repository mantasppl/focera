import { downloadBlob, fileBaseName } from "@/lib/image";

export type OcrLanguageId =
  | "eng"
  | "spa"
  | "fra"
  | "deu"
  | "por"
  | "chi_sim"
  | "jpn";

export type OcrLanguage = {
  id: OcrLanguageId;
  label: string;
  hint: string;
};

export const OCR_LANGUAGES: OcrLanguage[] = [
  { id: "eng", label: "English", hint: "Default" },
  { id: "spa", label: "Spanish", hint: "Español" },
  { id: "fra", label: "French", hint: "Français" },
  { id: "deu", label: "German", hint: "Deutsch" },
  { id: "por", label: "Portuguese", hint: "Português" },
  { id: "chi_sim", label: "Chinese", hint: "简体" },
  { id: "jpn", label: "Japanese", hint: "日本語" },
];

export type ImageToTextResult = {
  text: string;
  confidence: number;
  language: OcrLanguageId;
};

export type ImageToTextOptions = {
  language?: OcrLanguageId;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("OCR cancelled.", "AbortError");
  }
}

function progressMessage(status: string, progress: number): string {
  const pct = Math.round(progress * 100);
  switch (status) {
    case "loading tesseract core":
      return "Loading OCR engine…";
    case "initializing tesseract":
      return "Starting OCR…";
    case "loading language traineddata":
      return "Downloading language data…";
    case "initializing api":
      return "Preparing recognizer…";
    case "recognizing text":
      return pct > 0 ? `Reading text… ${pct}%` : "Reading text…";
    default:
      return pct > 0 ? `Working… ${pct}%` : "Working…";
  }
}

export async function extractTextFromImage(
  file: File,
  options: ImageToTextOptions = {},
): Promise<ImageToTextResult> {
  const { language = "eng", onProgress, signal } = options;
  throwIfAborted(signal);

  onProgress?.("Loading OCR engine…");

  const { createWorker } = await import("tesseract.js");
  throwIfAborted(signal);

  const worker = await createWorker(language, undefined, {
    logger: (message) => {
      if (signal?.aborted) return;
      onProgress?.(progressMessage(message.status, message.progress ?? 0));
    },
  });

  const abort = () => {
    void worker.terminate();
  };
  signal?.addEventListener("abort", abort, { once: true });

  try {
    throwIfAborted(signal);
    onProgress?.("Reading text…");
    const { data } = await worker.recognize(file);
    throwIfAborted(signal);

    const text = (data.text ?? "").replace(/\r\n/g, "\n").trim();
    return {
      text,
      confidence: Math.round(data.confidence ?? 0),
      language,
    };
  } finally {
    signal?.removeEventListener("abort", abort);
    await worker.terminate().catch(() => undefined);
  }
}

export function downloadExtractedText(text: string, sourceFile: File): void {
  const blob = new Blob([`${text}\n`], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `${fileBaseName(sourceFile)}-ocr.txt`);
}

export function describeOcrResult(
  result: ImageToTextResult,
  textOverride?: string,
): string {
  const lang =
    OCR_LANGUAGES.find((item) => item.id === result.language)?.label ??
    result.language;
  const chars = (textOverride ?? result.text).length;
  if (!chars) {
    return `No text detected · ${lang}`;
  }
  return `${chars.toLocaleString()} characters · ${result.confidence}% confidence · ${lang}`;
}
