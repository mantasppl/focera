import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { downloadBlob, fileBaseName } from "@/lib/image";
import { MAX_PDF_PAGES } from "@/lib/pdf-to-jpg";

export type PdfToTextLayout = "continuous" | "pages";

export type PdfToTextResult = {
  text: string;
  pageCount: number;
  pagesWithText: number;
  wordCount: number;
  charCount: number;
  layout: PdfToTextLayout;
};

export type ExtractPdfTextOptions = {
  layout?: PdfToTextLayout;
  onProgress?: (current: number, total: number, label: string) => void;
  signal?: AbortSignal;
};

type TextPiece = {
  text: string;
  x: number;
  y: number;
  height: number;
  width: number;
};

let workerConfigured = false;

function ensurePdfWorker() {
  if (workerConfigured || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerConfigured = true;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Extraction cancelled.", "AbortError");
  }
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function groupPiecesIntoLines(pieces: TextPiece[]): TextPiece[][] {
  if (!pieces.length) return [];

  const sorted = [...pieces].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 2) return b.y - a.y;
    return a.x - b.x;
  });

  const lines: TextPiece[][] = [];
  let current: TextPiece[] = [sorted[0]!];

  for (let i = 1; i < sorted.length; i += 1) {
    const piece = sorted[i]!;
    const prev = current[current.length - 1]!;
    const threshold = Math.max(prev.height, piece.height, 8) * 0.55;

    if (Math.abs(prev.y - piece.y) <= threshold) {
      current.push(piece);
    } else {
      lines.push(current.sort((a, b) => a.x - b.x));
      current = [piece];
    }
  }

  lines.push(current.sort((a, b) => a.x - b.x));
  return lines;
}

function lineToText(line: TextPiece[]): string {
  if (!line.length) return "";

  let result = line[0]!.text;
  for (let i = 1; i < line.length; i += 1) {
    const prev = line[i - 1]!;
    const curr = line[i]!;
    const gap = curr.x - (prev.x + prev.width);
    const spaceWidth = Math.max(prev.height, curr.height) * 0.25;
    result += gap > spaceWidth ? ` ${curr.text}` : curr.text;
  }

  return result.replace(/\s+/g, " ").trim();
}

function linesToParagraphs(lines: TextPiece[][]): string[] {
  if (!lines.length) return [];

  const paragraphs: string[] = [];
  let buffer = lineToText(lines[0]!);

  for (let i = 1; i < lines.length; i += 1) {
    const prevLine = lines[i - 1]!;
    const currLine = lines[i]!;
    const prevY = prevLine[0]?.y ?? 0;
    const currY = currLine[0]?.y ?? 0;
    const avgHeight =
      (prevLine.reduce((sum, p) => sum + p.height, 0) / prevLine.length +
        currLine.reduce((sum, p) => sum + p.height, 0) / currLine.length) /
      2;
    const gap = prevY - currY;
    const text = lineToText(currLine);

    if (!text) continue;

    if (gap > avgHeight * 1.45) {
      if (buffer.trim()) paragraphs.push(buffer.trim());
      buffer = text;
    } else {
      buffer = `${buffer} ${text}`.replace(/\s+/g, " ").trim();
    }
  }

  if (buffer.trim()) paragraphs.push(buffer.trim());
  return paragraphs;
}

async function extractPageParagraphs(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: any,
): Promise<string[]> {
  const content = await page.getTextContent();
  const pieces: TextPiece[] = [];

  for (const item of content.items) {
    if (!("str" in item) || typeof item.str !== "string") continue;
    const text = item.str;
    if (!text.trim()) continue;

    const transform = item.transform as number[];
    pieces.push({
      text,
      x: transform[4] ?? 0,
      y: transform[5] ?? 0,
      height: Math.abs(transform[3] ?? item.height ?? 10) || 10,
      width: item.width ?? 0,
    });
  }

  return linesToParagraphs(groupPiecesIntoLines(pieces));
}

function joinPageText(
  pageTexts: string[],
  layout: PdfToTextLayout,
): string {
  if (layout === "continuous") {
    return pageTexts.filter(Boolean).join("\n\n");
  }

  return pageTexts
    .map((pageText, index) => {
      const header = `--- Page ${index + 1} ---`;
      return pageText ? `${header}\n\n${pageText}` : header;
    })
    .join("\n\n");
}

export async function extractTextFromPdf(
  file: File,
  options: ExtractPdfTextOptions = {},
): Promise<PdfToTextResult> {
  ensurePdfWorker();

  const layout = options.layout ?? "continuous";
  const data = new Uint8Array(await file.arrayBuffer());
  throwIfAborted(options.signal);

  const input = getDocument({ data });
  const pdf = await input.promise;

  try {
    throwIfAborted(options.signal);

    if (pdf.numPages > MAX_PDF_PAGES) {
      throw new Error(
        `This PDF has ${pdf.numPages} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
      );
    }

    const pageTexts: string[] = [];
    let pagesWithText = 0;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      throwIfAborted(options.signal);
      options.onProgress?.(pageNumber, pdf.numPages, "Extracting text");

      const page = await pdf.getPage(pageNumber);
      const paragraphs = await extractPageParagraphs(page);
      const pageText = paragraphs.join("\n\n").trim();

      if (pageText) pagesWithText += 1;
      pageTexts.push(pageText);
      page.cleanup();
    }

    const text = joinPageText(pageTexts, layout).trim();

    return {
      text,
      pageCount: pdf.numPages,
      pagesWithText,
      wordCount: countWords(text),
      charCount: text.length,
      layout,
    };
  } finally {
    await input.destroy();
  }
}

export function downloadExtractedPdfText(text: string, sourceFile: File): void {
  const blob = new Blob([`${text}\n`], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `${fileBaseName(sourceFile)}.txt`);
}

export function describePdfTextResult(
  result: PdfToTextResult,
  textOverride?: string,
): string {
  const text = textOverride ?? result.text;
  const chars = text.length;
  const words = countWords(text);

  if (!chars) {
    return `No extractable text · ${result.pageCount} page${result.pageCount === 1 ? "" : "s"}`;
  }

  return `${words.toLocaleString()} words · ${chars.toLocaleString()} characters · ${result.pagesWithText}/${result.pageCount} pages with text`;
}
