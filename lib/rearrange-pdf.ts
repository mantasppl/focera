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

export const MAX_REARRANGE_PAGES = MAX_PDF_PAGES;
export const THUMB_SCALE = 0.35;

export type RearrangePdfPage = {
  id: string;
  /** 0-based index in the source PDF. */
  sourceIndex: number;
  /** Original 1-based page number in the source file. */
  originalPageNumber: number;
  width: number;
  height: number;
  thumbUrl: string | null;
};

export type LoadRearrangePdfResult = {
  bytes: Uint8Array;
  pages: RearrangePdfPage[];
  pageCount: number;
};

export type RearrangePdfResult = {
  blob: Blob;
  pageCount: number;
  changed: boolean;
  downloadName: string;
  size: number;
};

export type RearrangePdfOptions = {
  /** 0-based source indices in the desired output order. */
  orderedIndices: number[];
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

export function rearrangePdfLimitsHint() {
  return `PDF · up to ${formatFileSize(MAX_PDF_SIZE_BYTES)} · max ${MAX_REARRANGE_PAGES} pages`;
}

export function moveRearrangePage(
  pages: RearrangePdfPage[],
  id: string,
  direction: -1 | 1,
): RearrangePdfPage[] {
  const index = pages.findIndex((page) => page.id === id);
  if (index < 0) return pages;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= pages.length) return pages;
  const next = [...pages];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

export function reorderRearrangePages(
  pages: RearrangePdfPage[],
  fromId: string,
  toId: string,
): RearrangePdfPage[] {
  if (fromId === toId) return pages;
  const fromIndex = pages.findIndex((page) => page.id === fromId);
  const toIndex = pages.findIndex((page) => page.id === toId);
  if (fromIndex < 0 || toIndex < 0) return pages;
  const next = [...pages];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function isPageOrderChanged(pages: RearrangePdfPage[]): boolean {
  return pages.some((page, index) => page.sourceIndex !== index);
}

export function validateRearrangeOrder(
  pageCount: number,
  orderedIndices: number[],
): string | null {
  if (pageCount < 1) {
    return "This PDF has no pages.";
  }
  if (pageCount === 1) {
    return "A single-page PDF has nothing to rearrange.";
  }
  if (orderedIndices.length !== pageCount) {
    return "Page order is incomplete. Reload the PDF and try again.";
  }

  const seen = new Set<number>();
  for (const index of orderedIndices) {
    if (!Number.isInteger(index) || index < 0 || index >= pageCount) {
      return "One or more pages are out of range.";
    }
    if (seen.has(index)) {
      return "Page order contains duplicates. Reload the PDF and try again.";
    }
    seen.add(index);
  }

  return null;
}

export async function loadPdfForRearrange(
  file: File,
  options: {
    signal?: AbortSignal;
    onProgress?: (current: number, total: number) => void;
  } = {},
): Promise<LoadRearrangePdfResult> {
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
  if (pageCount > MAX_REARRANGE_PAGES) {
    throw new Error(
      `This PDF has ${pageCount} pages. Please use a file with ${MAX_REARRANGE_PAGES} pages or fewer.`,
    );
  }

  const loadingTask = getDocument({ data: bytes.slice() });
  const pdfjsDoc = await loadingTask.promise;

  if (options.signal?.aborted) {
    await loadingTask.destroy();
    throw new DOMException("Load cancelled.", "AbortError");
  }

  const pages: RearrangePdfPage[] = [];

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
        originalPageNumber: pageNumber,
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

export async function rearrangePdfPages(
  sourceBytes: Uint8Array,
  file: File,
  options: RearrangePdfOptions,
): Promise<RearrangePdfResult> {
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
  const validationError = validateRearrangeOrder(
    pageCount,
    options.orderedIndices,
  );
  if (validationError) {
    throw new Error(validationError);
  }

  const changed = options.orderedIndices.some(
    (sourceIndex, outputIndex) => sourceIndex !== outputIndex,
  );
  if (!changed) {
    throw new Error("Move at least one page before downloading.");
  }

  const dest = await PDFDocument.create();
  const total = options.orderedIndices.length;

  for (let i = 0; i < options.orderedIndices.length; i += 1) {
    assertNotAborted(options.signal);
    options.onProgress?.(i + 1, total);
    const [copied] = await dest.copyPages(source, [options.orderedIndices[i]]);
    dest.addPage(copied);
  }

  assertNotAborted(options.signal);

  const pdfBytes = await dest.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const base = fileBaseName(file) || "document";

  return {
    blob,
    pageCount,
    changed,
    downloadName: `${base}-rearranged.pdf`,
    size: blob.size,
  };
}

export function downloadRearrangedPdf(result: RearrangePdfResult) {
  downloadBlob(result.blob, result.downloadName);
}

export function describeRearrangeResult(result: RearrangePdfResult): string {
  const pages =
    result.pageCount === 1 ? "1 page" : `${result.pageCount} pages`;
  return `Pages rearranged · ${pages} · ${formatFileSize(result.size)}`;
}
