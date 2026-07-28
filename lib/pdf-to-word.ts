import {
  Document,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  TextRun,
} from "docx";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { downloadBlob, formatFileSize } from "@/lib/image";
import { MAX_PDF_PAGES } from "@/lib/pdf-to-jpg";

export type PdfToWordMode = "text" | "visual";

export type PdfToWordResult = {
  blob: Blob;
  url: string;
  pageCount: number;
  mode: PdfToWordMode;
  wordCount: number;
  charCount: number;
  previewText: string;
  originalSize: number;
  outputSize: number;
};

export type ConvertPdfToWordOptions = {
  mode?: PdfToWordMode;
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

const VISUAL_SCALE = 1.5;
const MAX_IMAGE_WIDTH_PX = 620;

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

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Could not encode page image."));
          return;
        }
        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      "image/png",
    );
  });
}

async function convertTextMode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  options: ConvertPdfToWordOptions,
): Promise<{ children: Paragraph[]; fullText: string }> {
  const children: Paragraph[] = [];
  const textParts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    throwIfAborted(options.signal);
    options.onProgress?.(pageNumber, pdf.numPages, "Extracting text");

    const page = await pdf.getPage(pageNumber);
    const paragraphs = await extractPageParagraphs(page);

    if (pageNumber > 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    if (!paragraphs.length) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "[No extractable text on this page]",
              italics: true,
              color: "666666",
              size: 20,
            }),
          ],
          spacing: { after: 200 },
        }),
      );
    } else {
      for (const paragraph of paragraphs) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: paragraph,
                size: 22,
                font: "Calibri",
              }),
            ],
            spacing: { after: 200, line: 276 },
          }),
        );
        textParts.push(paragraph);
      }
    }

    page.cleanup();
  }

  return { children, fullText: textParts.join("\n\n") };
}

async function convertVisualMode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  options: ConvertPdfToWordOptions,
): Promise<{ children: Paragraph[]; fullText: string }> {
  const children: Paragraph[] = [];

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

    const data = await canvasToPngBytes(canvas);
    const scale = Math.min(1, MAX_IMAGE_WIDTH_PX / canvas.width);
    const width = Math.max(1, Math.round(canvas.width * scale));
    const height = Math.max(1, Math.round(canvas.height * scale));

    if (pageNumber > 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            type: "png",
            data,
            transformation: { width, height },
            altText: {
              name: `PDF page ${pageNumber}`,
              description: `Rendered page ${pageNumber} from the source PDF`,
              title: `Page ${pageNumber}`,
            },
          }),
        ],
      }),
    );

    page.cleanup();
  }

  return {
    children,
    fullText: `Visual conversion · ${pdf.numPages} page image${pdf.numPages === 1 ? "" : "s"} embedded in Word`,
  };
}

export async function convertPdfToWord(
  file: File,
  options: ConvertPdfToWordOptions = {},
): Promise<PdfToWordResult> {
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

    const { children, fullText } =
      mode === "visual"
        ? await convertVisualMode(pdf, options)
        : await convertTextMode(pdf, options);

    throwIfAborted(options.signal);
    options.onProgress?.(pdf.numPages, pdf.numPages, "Building Word file");

    const doc = new Document({
      creator: "Focera",
      title: file.name.replace(/\.pdf$/i, "") || "Converted PDF",
      description: "Converted from PDF with Focera PDF to Word",
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children:
            children.length > 0
              ? children
              : [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "This PDF did not contain extractable content.",
                        italics: true,
                      }),
                    ],
                  }),
                ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      pageCount: pdf.numPages,
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

export function revokePdfToWordResult(result: PdfToWordResult | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadWordFile(blob: Blob, sourceFile: File) {
  const base = sourceFile.name.replace(/\.pdf$/i, "") || "document";
  downloadBlob(blob, `${base}.docx`);
}

export function describeOutput(result: PdfToWordResult): string {
  if (result.mode === "visual") {
    return `${result.pageCount} page image${result.pageCount === 1 ? "" : "s"} · ${formatFileSize(result.outputSize)}`;
  }
  return `${result.wordCount.toLocaleString()} words · ${result.pageCount} page${result.pageCount === 1 ? "" : "s"} · ${formatFileSize(result.outputSize)}`;
}
