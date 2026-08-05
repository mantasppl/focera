import { PDFDocument } from "pdf-lib";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_PAGES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export const MAX_DELETE_PAGES = MAX_PDF_PAGES;
export const THUMB_SCALE = 0.35;

export type DeletePdfPage = {
  id: string;
  /** 0-based index in the source PDF. */
  sourceIndex: number;
  pageNumber: number;
  width: number;
  height: number;
  thumbUrl: string | null;
};

export type LoadDeletePdfResult = {
  bytes: Uint8Array;
  pages: DeletePdfPage[];
  pageCount: number;
};

export type DeletePdfPagesResult = {
  blob: Blob;
  pageCount: number;
  deletedCount: number;
  keptCount: number;
  downloadName: string;
  size: number;
};

export type DeletePdfPagesOptions = {
  /** 0-based page indices to remove. */
  deleteIndices: number[];
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

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Operation cancelled.", "AbortError");
  }
}

export function deletePdfLimitsHint() {
  return `PDF · up to ${formatFileSize(MAX_PDF_SIZE_BYTES)} · max ${MAX_DELETE_PAGES} pages`;
}

/**
 * Parse range text like "2, 4-6" into 0-based page indices to delete.
 */
export function parseDeletePageRanges(
  text: string,
  pageCount: number,
): number[] | string {
  const trimmed = text.trim();
  if (!trimmed) {
    return "Enter at least one page (for example 2, 4-6).";
  }

  const parts = trimmed.split(/[,;\s]+/).filter(Boolean);
  if (parts.length === 0) {
    return "Enter at least one page (for example 2, 4-6).";
  }

  const indices = new Set<number>();

  for (const part of parts) {
    const match = /^(\d+)(?:\s*[-–—]\s*(\d+))?$/.exec(part);
    if (!match) {
      return `Could not parse "${part}". Use forms like 3 or 1-4.`;
    }

    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      return `Could not parse "${part}". Page numbers must be whole numbers.`;
    }
    if (start < 1 || end < 1) {
      return "Page numbers start at 1.";
    }
    if (start > pageCount || end > pageCount) {
      return `This PDF only has ${pageCount} ${pageCount === 1 ? "page" : "pages"}.`;
    }
    if (start > end) {
      return `Range "${part}" is invalid — start must be less than or equal to end.`;
    }

    for (let page = start; page <= end; page += 1) {
      indices.add(page - 1);
    }
  }

  return [...indices].sort((a, b) => a - b);
}

export function validateDeleteSelection(
  pageCount: number,
  deleteIndices: number[],
): string | null {
  if (pageCount < 1) {
    return "This PDF has no pages.";
  }
  if (pageCount === 1) {
    return "A single-page PDF has nothing left to keep after deletion.";
  }
  if (deleteIndices.length === 0) {
    return "Select at least one page to delete.";
  }

  const unique = new Set(deleteIndices);
  for (const index of unique) {
    if (!Number.isInteger(index) || index < 0 || index >= pageCount) {
      return "One or more selected pages are out of range.";
    }
  }

  if (unique.size >= pageCount) {
    return "Keep at least one page in the document.";
  }

  return null;
}

export async function loadPdfForDelete(
  file: File,
  options: {
    signal?: AbortSignal;
    onProgress?: (current: number, total: number) => void;
  } = {},
): Promise<LoadDeletePdfResult> {
  const validationError = validatePdfFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  assertNotAborted(options.signal);
  ensurePdfWorker();

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
  if (pageCount > MAX_DELETE_PAGES) {
    throw new Error(
      `This PDF has ${pageCount} pages. Please use a file with ${MAX_DELETE_PAGES} pages or fewer.`,
    );
  }

  const loadingTask = getDocument({ data: bytes.slice() });
  const pdfjsDoc = await loadingTask.promise;

  if (options.signal?.aborted) {
    await loadingTask.destroy();
    throw new DOMException("Load cancelled.", "AbortError");
  }

  const pages: DeletePdfPage[] = [];

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
        id: createPageId(),
        sourceIndex: pageNumber - 1,
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

export async function deletePdfPages(
  sourceBytes: Uint8Array,
  file: File,
  options: DeletePdfPagesOptions,
): Promise<DeletePdfPagesResult> {
  assertNotAborted(options.signal);

  let source: PDFDocument;
  try {
    source = await PDFDocument.load(sourceBytes);
  } catch {
    throw new Error(
      "This PDF could not be read. It may be damaged or password-protected.",
    );
  }

  const pageCount = source.getPageCount();
  const validationError = validateDeleteSelection(
    pageCount,
    options.deleteIndices,
  );
  if (validationError) {
    throw new Error(validationError);
  }

  const deleteSet = new Set(options.deleteIndices);
  const keepIndices: number[] = [];
  for (let index = 0; index < pageCount; index += 1) {
    if (!deleteSet.has(index)) keepIndices.push(index);
  }

  const dest = await PDFDocument.create();
  const total = keepIndices.length;

  for (let i = 0; i < keepIndices.length; i += 1) {
    assertNotAborted(options.signal);
    options.onProgress?.(i + 1, total);
    const [copied] = await dest.copyPages(source, [keepIndices[i]]);
    dest.addPage(copied);
  }

  assertNotAborted(options.signal);

  const pdfBytes = await dest.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const base = fileBaseName(file) || "document";

  return {
    blob,
    pageCount,
    deletedCount: deleteSet.size,
    keptCount: keepIndices.length,
    downloadName: `${base}-pages-deleted.pdf`,
    size: blob.size,
  };
}

export function downloadDeletedPdf(result: DeletePdfPagesResult) {
  downloadBlob(result.blob, result.downloadName);
}

export function describeDeleteResult(result: DeletePdfPagesResult): string {
  const deleted =
    result.deletedCount === 1 ? "1 page removed" : `${result.deletedCount} pages removed`;
  const kept =
    result.keptCount === 1 ? "1 page kept" : `${result.keptCount} pages kept`;
  return `${deleted} · ${kept} · ${formatFileSize(result.size)}`;
}
