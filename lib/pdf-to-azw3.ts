import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { buildAzw3Blob, formatAzw3EmbedId } from "@/lib/azw3-writer";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";
import { MAX_PDF_PAGES } from "@/lib/pdf-to-jpg";

export type PdfToAzw3Mode = "text" | "visual";

export type PdfToAzw3Result = {
  blob: Blob;
  url: string;
  pageCount: number;
  chapterCount: number;
  mode: PdfToAzw3Mode;
  wordCount: number;
  charCount: number;
  previewText: string;
  originalSize: number;
  outputSize: number;
};

export type ConvertPdfToAzw3Options = {
  mode?: PdfToAzw3Mode;
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

const VISUAL_SCALE = 1.25;
const MAX_AZW3_IMAGE_BYTES = 120 * 1024;

let workerConfigured = false;

function ensurePdfWorker() {
  if (workerConfigured || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerConfigured = true;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function buildPreview(text: string, maxChars = 1200): string {
  const normalized = text.replace(/\s+\n/g, "\n").trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars).trimEnd()}…`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

function canvasToJpegBytes(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Could not encode page image."));
          return;
        }
        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      "image/jpeg",
      quality,
    );
  });
}

async function canvasToAzw3Jpeg(
  canvas: HTMLCanvasElement,
): Promise<Uint8Array> {
  let quality = 0.82;
  let data = await canvasToJpegBytes(canvas, quality);

  while (data.length > MAX_AZW3_IMAGE_BYTES && quality > 0.35) {
    quality -= 0.08;
    data = await canvasToJpegBytes(canvas, quality);
  }

  if (data.length <= MAX_AZW3_IMAGE_BYTES) {
    return data;
  }

  const scale = Math.sqrt(MAX_AZW3_IMAGE_BYTES / data.length) * 0.92;
  const resized = document.createElement("canvas");
  resized.width = Math.max(1, Math.floor(canvas.width * scale));
  resized.height = Math.max(1, Math.floor(canvas.height * scale));
  const ctx = resized.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, resized.width, resized.height);
  ctx.drawImage(canvas, 0, 0, resized.width, resized.height);
  return canvasToJpegBytes(resized, 0.75);
}

function paragraphsToHtml(paragraphs: string[]): string {
  if (!paragraphs.length) {
    return "<p><i>[No extractable text on this page]</i></p>";
  }
  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("\n");
}

async function convertTextMode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  options: ConvertPdfToAzw3Options,
): Promise<{
  chapters: { title: string; bodyHtml: string }[];
  fullText: string;
}> {
  const chapters: { title: string; bodyHtml: string }[] = [];
  const textParts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    throwIfAborted(options.signal);
    options.onProgress?.(pageNumber, pdf.numPages, "Extracting text");

    const page = await pdf.getPage(pageNumber);
    const paragraphs = await extractPageParagraphs(page);
    const title = `Page ${pageNumber}`;

    chapters.push({
      title,
      bodyHtml: paragraphsToHtml(paragraphs),
    });

    if (paragraphs.length) {
      textParts.push(paragraphs.join("\n\n"));
    }

    page.cleanup();
  }

  return {
    chapters,
    fullText: textParts.join("\n\n"),
  };
}

async function convertVisualMode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  options: ConvertPdfToAzw3Options,
): Promise<{
  chapters: { title: string; bodyHtml: string }[];
  fullText: string;
  images: { data: Uint8Array }[];
}> {
  const chapters: { title: string; bodyHtml: string }[] = [];
  const images: { data: Uint8Array }[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    throwIfAborted(options.signal);
    options.onProgress?.(pageNumber, pdf.numPages, "Rendering page");

    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: VISUAL_SCALE });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not supported in this browser.");
    }

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvas,
      canvasContext: context,
      viewport,
    }).promise;

    const data = await canvasToAzw3Jpeg(canvas);
    images.push({ data });

    const embedId = formatAzw3EmbedId(pageNumber);
    chapters.push({
      title: `Page ${pageNumber}`,
      bodyHtml: `<p style="text-align:center"><img src="kindle:embed:${embedId}"/></p>`,
    });

    page.cleanup();
  }

  return {
    chapters,
    fullText: `Visual conversion · ${pdf.numPages} page image${pdf.numPages === 1 ? "" : "s"} embedded in AZW3`,
    images,
  };
}

export async function convertPdfToAzw3(
  file: File,
  options: ConvertPdfToAzw3Options = {},
): Promise<PdfToAzw3Result> {
  ensurePdfWorker();

  const mode = options.mode ?? "text";
  const data = new Uint8Array(await file.arrayBuffer());
  throwIfAborted(options.signal);

  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;

  try {
    throwIfAborted(options.signal);

    if (pdf.numPages > MAX_PDF_PAGES) {
      throw new Error(
        `This PDF has ${pdf.numPages} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
      );
    }

    const bookTitle = fileBaseName(file) || "Converted PDF";

    let chapters: { title: string; bodyHtml: string }[];
    let fullText: string;
    let images: { data: Uint8Array }[] = [];

    if (mode === "visual") {
      const converted = await convertVisualMode(pdf, options);
      chapters = converted.chapters;
      fullText = converted.fullText;
      images = converted.images;
    } else {
      const converted = await convertTextMode(pdf, options);
      chapters = converted.chapters;
      fullText = converted.fullText;
    }

    throwIfAborted(options.signal);
    options.onProgress?.(pdf.numPages, pdf.numPages, "Building AZW3");

    const blob = buildAzw3Blob({
      title: bookTitle,
      author: "Focera PDF to AZW3",
      chapters,
      images,
    });
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      pageCount: pdf.numPages,
      chapterCount: chapters.length,
      mode,
      wordCount: countWords(fullText),
      charCount: fullText.length,
      previewText: buildPreview(fullText),
      originalSize: file.size,
      outputSize: blob.size,
    };
  } finally {
    await loadingTask.destroy();
  }
}

export function revokePdfToAzw3Result(result: PdfToAzw3Result | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadAzw3File(blob: Blob, sourceFile: File) {
  downloadBlob(blob, `${fileBaseName(sourceFile)}.azw3`);
}

export function describeOutput(result: PdfToAzw3Result): string {
  if (result.mode === "visual") {
    return `${result.chapterCount} page image${result.chapterCount === 1 ? "" : "s"} · ${formatFileSize(result.outputSize)}`;
  }
  return `${result.wordCount.toLocaleString()} words · ${result.chapterCount} chapter${result.chapterCount === 1 ? "" : "s"} · ${formatFileSize(result.outputSize)}`;
}
