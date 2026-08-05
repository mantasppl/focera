import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import PptxGenJS from "pptxgenjs";
import { downloadBlob, formatFileSize } from "@/lib/image";
import { MAX_PDF_PAGES } from "@/lib/pdf-to-jpg";

export type PdfToPowerpointMode = "text" | "visual";

export type PdfToPowerpointResult = {
  blob: Blob;
  url: string;
  pageCount: number;
  slideCount: number;
  mode: PdfToPowerpointMode;
  wordCount: number;
  charCount: number;
  previewText: string;
  originalSize: number;
  outputSize: number;
};

export type ConvertPdfToPowerpointOptions = {
  mode?: PdfToPowerpointMode;
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
const SLIDE_WIDTH_IN = 13.333;
const SLIDE_HEIGHT_IN = 7.5;

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

function canvasToPngDataUrl(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      resolve(canvas.toDataURL("image/png"));
    } catch (err) {
      reject(
        err instanceof Error
          ? err
          : new Error("Could not encode page image."),
      );
    }
  });
}

function fitImageOnSlide(
  imageWidth: number,
  imageHeight: number,
): { x: number; y: number; w: number; h: number } {
  const imageRatio = imageWidth / Math.max(imageHeight, 1);
  const slideRatio = SLIDE_WIDTH_IN / SLIDE_HEIGHT_IN;

  if (imageRatio > slideRatio) {
    const w = SLIDE_WIDTH_IN;
    const h = w / imageRatio;
    return { x: 0, y: (SLIDE_HEIGHT_IN - h) / 2, w, h };
  }

  const h = SLIDE_HEIGHT_IN;
  const w = h * imageRatio;
  return { x: (SLIDE_WIDTH_IN - w) / 2, y: 0, w, h };
}

function createPresentation(title: string): PptxGenJS {
  const pptx = new PptxGenJS();
  pptx.author = "Focera";
  pptx.title = title;
  pptx.subject = "Converted from PDF with Focera PDF to PowerPoint";
  pptx.defineLayout({
    name: "FOCERA_WIDE",
    width: SLIDE_WIDTH_IN,
    height: SLIDE_HEIGHT_IN,
  });
  pptx.layout = "FOCERA_WIDE";
  return pptx;
}

async function convertTextMode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  pptx: PptxGenJS,
  options: ConvertPdfToPowerpointOptions,
): Promise<string> {
  const textParts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    throwIfAborted(options.signal);
    options.onProgress?.(pageNumber, pdf.numPages, "Extracting text");

    const page = await pdf.getPage(pageNumber);
    const paragraphs = await extractPageParagraphs(page);
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };

    if (!paragraphs.length) {
      slide.addText("[No extractable text on this page]", {
        x: 0.5,
        y: 0.5,
        w: SLIDE_WIDTH_IN - 1,
        h: 1,
        fontSize: 14,
        fontFace: "Calibri",
        color: "666666",
        italic: true,
        valign: "top",
      });
    } else {
      const body = paragraphs.join("\n\n");
      slide.addText(body, {
        x: 0.5,
        y: 0.4,
        w: SLIDE_WIDTH_IN - 1,
        h: SLIDE_HEIGHT_IN - 0.8,
        fontSize: 16,
        fontFace: "Calibri",
        color: "1A1A1A",
        valign: "top",
        wrap: true,
      });
      textParts.push(...paragraphs);
    }

    page.cleanup();
  }

  return textParts.join("\n\n");
}

async function convertVisualMode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  pptx: PptxGenJS,
  options: ConvertPdfToPowerpointOptions,
): Promise<string> {
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

    const dataUrl = await canvasToPngDataUrl(canvas);
    const fit = fitImageOnSlide(canvas.width, canvas.height);
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };
    slide.addImage({
      data: dataUrl,
      x: fit.x,
      y: fit.y,
      w: fit.w,
      h: fit.h,
    });

    page.cleanup();
  }

  return `Visual conversion · ${pdf.numPages} page image${pdf.numPages === 1 ? "" : "s"} embedded in PowerPoint`;
}

export async function convertPdfToPowerpoint(
  file: File,
  options: ConvertPdfToPowerpointOptions = {},
): Promise<PdfToPowerpointResult> {
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

    const title = file.name.replace(/\.pdf$/i, "") || "Converted PDF";
    const pptx = createPresentation(title);

    const fullText =
      mode === "visual"
        ? await convertVisualMode(pdf, pptx, options)
        : await convertTextMode(pdf, pptx, options);

    throwIfAborted(options.signal);
    options.onProgress?.(pdf.numPages, pdf.numPages, "Building PowerPoint file");

    const output = await pptx.write({ outputType: "blob" });
    const blob =
      output instanceof Blob
        ? output
        : new Blob([output as ArrayBuffer], {
            type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          });
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      pageCount: pdf.numPages,
      slideCount: pdf.numPages,
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

export function revokePdfToPowerpointResult(result: PdfToPowerpointResult | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadPowerpointFile(blob: Blob, sourceFile: File) {
  const base = sourceFile.name.replace(/\.pdf$/i, "") || "presentation";
  downloadBlob(blob, `${base}.pptx`);
}

export function describeOutput(result: PdfToPowerpointResult): string {
  if (result.mode === "visual") {
    return `${result.slideCount} slide${result.slideCount === 1 ? "" : "s"} · ${formatFileSize(result.outputSize)}`;
  }
  return `${result.wordCount.toLocaleString()} words · ${result.slideCount} slide${result.slideCount === 1 ? "" : "s"} · ${formatFileSize(result.outputSize)}`;
}
