import {
  LineCapStyle,
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_PAGES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export const MAX_ANNOTATE_PAGES = MAX_PDF_PAGES;
export const PREVIEW_SCALE = 1.35;
export const THUMB_SCALE = 0.28;
export const MAX_TEXT_LENGTH = 500;
export const MIN_FONT_SIZE = 10;
export const MAX_FONT_SIZE = 48;
export const DEFAULT_FONT_SIZE = 16;
export const MIN_STROKE_WIDTH = 1;
export const MAX_STROKE_WIDTH = 12;
export const DEFAULT_STROKE_WIDTH = 2.5;

export type AnnotateTool = "text" | "highlight" | "pen" | "rect";

export type AnnotateColorId =
  | "yellow"
  | "red"
  | "blue"
  | "green"
  | "orange"
  | "black";

export type AnnotateColorOption = {
  value: AnnotateColorId;
  label: string;
  hex: string;
  rgb: RGB;
};

export const ANNOTATE_COLORS: AnnotateColorOption[] = [
  {
    value: "yellow",
    label: "Yellow",
    hex: "#f5d76e",
    rgb: rgb(0.96, 0.84, 0.43),
  },
  {
    value: "red",
    label: "Red",
    hex: "#e85d5d",
    rgb: rgb(0.91, 0.36, 0.36),
  },
  {
    value: "blue",
    label: "Blue",
    hex: "#4a7fd4",
    rgb: rgb(0.29, 0.5, 0.83),
  },
  {
    value: "green",
    label: "Green",
    hex: "#3f9b6a",
    rgb: rgb(0.25, 0.61, 0.42),
  },
  {
    value: "orange",
    label: "Orange",
    hex: "#e89a3c",
    rgb: rgb(0.91, 0.6, 0.24),
  },
  {
    value: "black",
    label: "Black",
    hex: "#1f2933",
    rgb: rgb(0.12, 0.16, 0.2),
  },
];

export type AnnotateToolOption = {
  value: AnnotateTool;
  label: string;
  hint: string;
};

export const ANNOTATE_TOOLS: AnnotateToolOption[] = [
  { value: "text", label: "Text", hint: "Click to place" },
  { value: "highlight", label: "Highlight", hint: "Drag a region" },
  { value: "pen", label: "Pen", hint: "Freehand draw" },
  { value: "rect", label: "Box", hint: "Drag a outline" },
];

export type Point = { x: number; y: number };

type AnnotationBase = {
  id: string;
  pageIndex: number;
  colorId: AnnotateColorId;
};

export type TextAnnotation = AnnotationBase & {
  type: "text";
  /** PDF points, bottom-left origin. */
  x: number;
  y: number;
  text: string;
  fontSize: number;
};

export type HighlightAnnotation = AnnotationBase & {
  type: "highlight";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PenAnnotation = AnnotationBase & {
  type: "pen";
  points: Point[];
  strokeWidth: number;
};

export type RectAnnotation = AnnotationBase & {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  strokeWidth: number;
};

export type PdfAnnotation =
  | TextAnnotation
  | HighlightAnnotation
  | PenAnnotation
  | RectAnnotation;

export type AnnotatePage = {
  id: string;
  pageIndex: number;
  pageNumber: number;
  width: number;
  height: number;
  thumbUrl: string | null;
};

export type LoadAnnotatePdfResult = {
  bytes: Uint8Array;
  pages: AnnotatePage[];
  pageCount: number;
};

export type AnnotatePdfResult = {
  blob: Blob;
  pageCount: number;
  annotationCount: number;
  annotatedPageCount: number;
  outputSize: number;
};

export type AnnotatePdfOptions = {
  annotations: PdfAnnotation[];
  signal?: AbortSignal;
  onProgress?: (current: number, total: number) => void;
};

let workerConfigured = false;

function ensurePdfWorker() {
  if (workerConfigured || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerConfigured = true;
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Annotation cancelled.", "AbortError");
  }
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function canvasToPngUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getAnnotateColor(id: AnnotateColorId): AnnotateColorOption {
  return (
    ANNOTATE_COLORS.find((option) => option.value === id) ?? ANNOTATE_COLORS[0]!
  );
}

/** Normalize newlines and strip characters StandardFonts cannot encode. */
export function sanitizePdfText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/[^\x09\x0A\x20-\x7E\xA0-\xFF]/g, "");
}

export function annotateLimitsHint(): string {
  return `PDFs up to ${formatFileSize(MAX_PDF_SIZE_BYTES)} · max ${MAX_ANNOTATE_PAGES} pages`;
}

export async function loadPdfForAnnotate(
  file: File,
  options: {
    signal?: AbortSignal;
    onProgress?: (current: number, total: number) => void;
  } = {},
): Promise<LoadAnnotatePdfResult> {
  const validationError = validatePdfFile(file);
  if (validationError) throw new Error(validationError);

  ensurePdfWorker();
  assertNotAborted(options.signal);

  const buffer = await file.arrayBuffer();
  assertNotAborted(options.signal);
  const bytes = new Uint8Array(buffer);

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(bytes);
  } catch {
    throw new Error(
      "This PDF could not be read. It may be damaged or password-protected.",
    );
  }

  const pageCount = pdfDoc.getPageCount();
  if (pageCount === 0) {
    throw new Error("This PDF has no pages.");
  }
  if (pageCount > MAX_ANNOTATE_PAGES) {
    throw new Error(
      `This PDF has ${pageCount} pages. Please use a file with ${MAX_ANNOTATE_PAGES} pages or fewer.`,
    );
  }

  const loadingTask = getDocument({ data: bytes.slice() });
  const pdfjsDoc = await loadingTask.promise;

  if (options.signal?.aborted) {
    await loadingTask.destroy();
    throw new DOMException("Load cancelled.", "AbortError");
  }

  const pages: AnnotatePage[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      assertNotAborted(options.signal);
      options.onProgress?.(pageNumber, pageCount);

      const pdfLibPage = pdfDoc.getPage(pageNumber - 1);
      const { width, height } = pdfLibPage.getSize();

      const pdfjsPage = await pdfjsDoc.getPage(pageNumber);
      const viewport = pdfjsPage.getViewport({ scale: THUMB_SCALE });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvas is not supported in this browser.");
      }

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      await pdfjsPage.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise;

      pages.push({
        id: createId("page"),
        pageIndex: pageNumber - 1,
        pageNumber,
        width,
        height,
        thumbUrl: canvasToPngUrl(canvas),
      });

      pdfjsPage.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  return { bytes, pages, pageCount };
}

export async function renderAnnotatePagePreview(
  sourceBytes: Uint8Array,
  pageNumber: number,
  options: { scale?: number; signal?: AbortSignal } = {},
): Promise<{
  url: string;
  width: number;
  height: number;
  scale: number;
}> {
  ensurePdfWorker();
  assertNotAborted(options.signal);

  const scale = options.scale ?? PREVIEW_SCALE;
  const loadingTask = getDocument({ data: sourceBytes.slice() });
  const pdf = await loadingTask.promise;

  try {
    assertNotAborted(options.signal);
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
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

    page.cleanup();

    return {
      url: canvasToPngUrl(canvas),
      width: canvas.width,
      height: canvas.height,
      scale,
    };
  } finally {
    await loadingTask.destroy();
  }
}

/** Convert overlay/CSS pixels (top-left) to PDF points (bottom-left). */
export function screenToPdfPoint(
  screenX: number,
  screenY: number,
  displayWidth: number,
  displayHeight: number,
  pageWidth: number,
  pageHeight: number,
): Point {
  const x = (screenX / displayWidth) * pageWidth;
  const y = pageHeight - (screenY / displayHeight) * pageHeight;
  return {
    x: clamp(x, 0, pageWidth),
    y: clamp(y, 0, pageHeight),
  };
}

/** Convert PDF points (bottom-left) to overlay/CSS pixels (top-left). */
export function pdfToScreenPoint(
  pdfX: number,
  pdfY: number,
  displayWidth: number,
  displayHeight: number,
  pageWidth: number,
  pageHeight: number,
): Point {
  return {
    x: (pdfX / pageWidth) * displayWidth,
    y: ((pageHeight - pdfY) / pageHeight) * displayHeight,
  };
}

export function createTextAnnotation(
  pageIndex: number,
  x: number,
  y: number,
  text: string,
  colorId: AnnotateColorId,
  fontSize: number,
): TextAnnotation | null {
  const cleaned = sanitizePdfText(text).trim();
  if (!cleaned) return null;

  return {
    id: createId("text"),
    type: "text",
    pageIndex,
    x,
    y,
    text: cleaned.slice(0, MAX_TEXT_LENGTH),
    colorId,
    fontSize: clamp(fontSize, MIN_FONT_SIZE, MAX_FONT_SIZE),
  };
}

export function createHighlightAnnotation(
  pageIndex: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  colorId: AnnotateColorId,
): HighlightAnnotation | null {
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  if (width < 4 || height < 4) return null;

  return {
    id: createId("highlight"),
    type: "highlight",
    pageIndex,
    x,
    y,
    width,
    height,
    colorId,
  };
}

export function createRectAnnotation(
  pageIndex: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  colorId: AnnotateColorId,
  strokeWidth: number,
): RectAnnotation | null {
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  if (width < 4 || height < 4) return null;

  return {
    id: createId("rect"),
    type: "rect",
    pageIndex,
    x,
    y,
    width,
    height,
    colorId,
    strokeWidth: clamp(strokeWidth, MIN_STROKE_WIDTH, MAX_STROKE_WIDTH),
  };
}

export function createPenAnnotation(
  pageIndex: number,
  points: Point[],
  colorId: AnnotateColorId,
  strokeWidth: number,
): PenAnnotation | null {
  if (points.length < 2) return null;

  return {
    id: createId("pen"),
    type: "pen",
    pageIndex,
    points: points.map((point) => ({ x: point.x, y: point.y })),
    colorId,
    strokeWidth: clamp(strokeWidth, MIN_STROKE_WIDTH, MAX_STROKE_WIDTH),
  };
}

function drawTextOnPage(
  page: PDFPage,
  font: PDFFont,
  annotation: TextAnnotation,
  color: RGB,
) {
  const lines = annotation.text.split("\n");
  const lineHeight = annotation.fontSize * 1.25;
  // annotation.y is baseline of the first (top) line in PDF space.
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!;
    if (!line) continue;
    page.drawText(line, {
      x: annotation.x,
      y: annotation.y - index * lineHeight,
      size: annotation.fontSize,
      font,
      color,
      opacity: 1,
    });
  }
}

function drawHighlightOnPage(
  page: PDFPage,
  annotation: HighlightAnnotation,
  color: RGB,
) {
  page.drawRectangle({
    x: annotation.x,
    y: annotation.y,
    width: annotation.width,
    height: annotation.height,
    color,
    opacity: 0.35,
    borderWidth: 0,
  });
}

function drawRectOnPage(
  page: PDFPage,
  annotation: RectAnnotation,
  color: RGB,
) {
  page.drawRectangle({
    x: annotation.x,
    y: annotation.y,
    width: annotation.width,
    height: annotation.height,
    borderColor: color,
    borderWidth: annotation.strokeWidth,
    borderOpacity: 1,
    opacity: 0,
  });
}

function drawPenOnPage(page: PDFPage, annotation: PenAnnotation, color: RGB) {
  const points = annotation.points;
  if (points.length < 2) return;

  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1]!;
    const to = points[index]!;
    page.drawLine({
      start: { x: from.x, y: from.y },
      end: { x: to.x, y: to.y },
      thickness: annotation.strokeWidth,
      color,
      opacity: 1,
      lineCap: LineCapStyle.Round,
    });
  }
}

export async function bakeAnnotationsIntoPdf(
  sourceBytes: Uint8Array,
  options: AnnotatePdfOptions,
): Promise<AnnotatePdfResult> {
  assertNotAborted(options.signal);

  if (!options.annotations.length) {
    throw new Error("Add at least one annotation before downloading.");
  }

  let pdf: PDFDocument;
  try {
    pdf = await PDFDocument.load(sourceBytes);
  } catch {
    throw new Error(
      "This PDF could not be read. It may be damaged or password-protected.",
    );
  }

  const pages = pdf.getPages();
  if (pages.length > MAX_ANNOTATE_PAGES) {
    throw new Error(
      `This PDF has ${pages.length} pages. Please use a file with ${MAX_ANNOTATE_PAGES} pages or fewer.`,
    );
  }

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const total = options.annotations.length;
  const touched = new Set<number>();

  for (let step = 0; step < options.annotations.length; step += 1) {
    assertNotAborted(options.signal);
    options.onProgress?.(step + 1, total);

    const annotation = options.annotations[step]!;
    const page = pages[annotation.pageIndex];
    if (!page) continue;

    touched.add(annotation.pageIndex);
    const color = getAnnotateColor(annotation.colorId).rgb;

    try {
      switch (annotation.type) {
        case "text":
          drawTextOnPage(page, font, annotation, color);
          break;
        case "highlight":
          drawHighlightOnPage(page, annotation, color);
          break;
        case "rect":
          drawRectOnPage(page, annotation, color);
          break;
        case "pen":
          drawPenOnPage(page, annotation, color);
          break;
      }
    } catch {
      throw new Error(
        "Could not draw one of the annotations. Try simpler text or fewer strokes.",
      );
    }
  }

  assertNotAborted(options.signal);

  const pdfBytes = await pdf.save({ useObjectStreams: true });
  const output = new Uint8Array(pdfBytes);
  const blob = new Blob([output], { type: "application/pdf" });

  return {
    blob,
    pageCount: pages.length,
    annotationCount: options.annotations.length,
    annotatedPageCount: touched.size,
    outputSize: blob.size,
  };
}

export function downloadAnnotatedPdf(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "document";
  downloadBlob(blob, `${base}-annotated.pdf`);
}

export function describeAnnotateResult(
  annotationCount: number,
  annotatedPageCount: number,
  pageCount: number,
  outputSize: number,
): string {
  const marks =
    annotationCount === 1 ? "1 mark" : `${annotationCount} marks`;
  const pages =
    annotatedPageCount === 1
      ? "1 page annotated"
      : `${annotatedPageCount} pages annotated`;
  const total = pageCount === 1 ? "1 page" : `${pageCount} pages`;
  return `${marks} · ${pages} · ${total} · ${formatFileSize(outputSize)}`;
}

export function countAnnotationsOnPage(
  annotations: PdfAnnotation[],
  pageIndex: number,
): number {
  return annotations.filter((item) => item.pageIndex === pageIndex).length;
}
