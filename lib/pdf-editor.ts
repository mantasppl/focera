import { PDFDocument, degrees, rgb } from "pdf-lib";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { downloadBlob, formatFileSize } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export const MAX_EDITOR_PAGES = 50;
export const THUMB_SCALE = 0.35;

export type PageRotation = 0 | 90 | 180 | 270;

export type EditorPage = {
  id: string;
  /** Index in the original loaded PDF, or null for inserted blank pages. */
  sourceIndex: number | null;
  /** Extra rotation applied in the editor (on top of the PDF’s own rotation). */
  rotation: PageRotation;
  width: number;
  height: number;
  thumbUrl: string | null;
};

export type LoadPdfEditorResult = {
  bytes: Uint8Array;
  pages: EditorPage[];
  pageCount: number;
};

export type BuildEditedPdfOptions = {
  signal?: AbortSignal;
  onProgress?: (current: number, total: number) => void;
};

let workerConfigured = false;

function ensurePdfWorker() {
  if (workerConfigured || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerConfigured = true;
}

function createPageId() {
  return `page-${Math.random().toString(36).slice(2, 10)}`;
}

function canvasToPngUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}

function blankThumbUrl(width: number, height: number): string {
  const canvas = document.createElement("canvas");
  const maxSide = 180;
  const scale = Math.min(maxSide / width, maxSide / height, 1);
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#d7e0dc";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  return canvas.toDataURL("image/png");
}

export function normalizeRotation(value: number): PageRotation {
  const normalized = ((value % 360) + 360) % 360;
  if (
    normalized === 0 ||
    normalized === 90 ||
    normalized === 180 ||
    normalized === 270
  ) {
    return normalized;
  }
  return 0;
}

export function revokeEditorPages(pages: EditorPage[]) {
  for (const page of pages) {
    if (page.thumbUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(page.thumbUrl);
    }
  }
}

export async function loadPdfForEditor(
  file: File,
  options: { signal?: AbortSignal; onProgress?: (current: number, total: number) => void } = {},
): Promise<LoadPdfEditorResult> {
  const validationError = validatePdfFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  ensurePdfWorker();

  const buffer = await file.arrayBuffer();
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
  if (pageCount > MAX_EDITOR_PAGES) {
    throw new Error(
      `This PDF has ${pageCount} pages. Please use a file with ${MAX_EDITOR_PAGES} pages or fewer.`,
    );
  }

  const loadingTask = getDocument({ data: bytes.slice() });
  const pdfjsDoc = await loadingTask.promise;

  if (options.signal?.aborted) {
    await loadingTask.destroy();
    throw new DOMException("Load cancelled.", "AbortError");
  }

  const pages: EditorPage[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      if (options.signal?.aborted) {
        throw new DOMException("Load cancelled.", "AbortError");
      }

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
        id: createPageId(),
        sourceIndex: pageNumber - 1,
        rotation: 0,
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

export function createBlankEditorPage(
  width = 612,
  height = 792,
): EditorPage {
  return {
    id: createPageId(),
    sourceIndex: null,
    rotation: 0,
    width,
    height,
    thumbUrl: typeof document !== "undefined" ? blankThumbUrl(width, height) : null,
  };
}

export function duplicateEditorPage(page: EditorPage): EditorPage {
  return {
    ...page,
    id: createPageId(),
  };
}

export function rotateEditorPage(
  page: EditorPage,
  direction: 90 | -90,
): EditorPage {
  return {
    ...page,
    rotation: normalizeRotation(page.rotation + direction),
  };
}

export function moveEditorPage(
  pages: EditorPage[],
  id: string,
  direction: -1 | 1,
): EditorPage[] {
  const index = pages.findIndex((page) => page.id === id);
  if (index < 0) return pages;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= pages.length) return pages;
  const next = [...pages];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

export function reorderEditorPages(
  pages: EditorPage[],
  fromId: string,
  toId: string,
): EditorPage[] {
  if (fromId === toId) return pages;
  const fromIndex = pages.findIndex((page) => page.id === fromId);
  const toIndex = pages.findIndex((page) => page.id === toId);
  if (fromIndex < 0 || toIndex < 0) return pages;
  const next = [...pages];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

async function appendEditedPage(
  dest: PDFDocument,
  source: PDFDocument,
  page: EditorPage,
) {
  if (page.sourceIndex === null) {
    const blank = dest.addPage([page.width, page.height]);
    blank.drawRectangle({
      x: 0,
      y: 0,
      width: page.width,
      height: page.height,
      color: rgb(1, 1, 1),
    });
    if (page.rotation !== 0) {
      blank.setRotation(degrees(page.rotation));
    }
    return;
  }

  const [copied] = await dest.copyPages(source, [page.sourceIndex]);
  const sourcePage = source.getPage(page.sourceIndex);
  const baseRotation = normalizeRotation(sourcePage.getRotation().angle);
  const finalRotation = normalizeRotation(baseRotation + page.rotation);
  copied.setRotation(degrees(finalRotation));
  dest.addPage(copied);
}

export async function buildEditedPdf(
  sourceBytes: Uint8Array,
  pages: EditorPage[],
  options: BuildEditedPdfOptions = {},
): Promise<Blob> {
  if (pages.length === 0) {
    throw new Error("Add at least one page before downloading.");
  }

  let source: PDFDocument;
  try {
    source = await PDFDocument.load(sourceBytes);
  } catch {
    throw new Error("Could not re-read the source PDF.");
  }

  const dest = await PDFDocument.create();
  const total = pages.length;

  for (let index = 0; index < pages.length; index += 1) {
    if (options.signal?.aborted) {
      throw new DOMException("Export cancelled.", "AbortError");
    }
    options.onProgress?.(index + 1, total);
    await appendEditedPage(dest, source, pages[index]);
  }

  if (options.signal?.aborted) {
    throw new DOMException("Export cancelled.", "AbortError");
  }

  const pdfBytes = await dest.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
}

export function downloadEditedPdf(blob: Blob, filename = "edited.pdf") {
  downloadBlob(blob, filename);
}

export function editorLimitsHint() {
  return `PDF · up to ${formatFileSize(MAX_PDF_SIZE_BYTES)} · max ${MAX_EDITOR_PAGES} pages`;
}
