import { PDFDocument, degrees } from "pdf-lib";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_PAGES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export const MAX_ROTATE_PAGES = MAX_PDF_PAGES;
export const THUMB_SCALE = 0.35;

export type PageRotation = 0 | 90 | 180 | 270;

export type RotatePdfPage = {
  id: string;
  /** 0-based index in the source PDF. */
  sourceIndex: number;
  pageNumber: number;
  /** Extra rotation applied in the tool (on top of the PDF’s own rotation). */
  rotation: PageRotation;
  width: number;
  height: number;
  thumbUrl: string | null;
};

export type LoadRotatePdfResult = {
  bytes: Uint8Array;
  pages: RotatePdfPage[];
  pageCount: number;
};

export type RotatePdfResult = {
  blob: Blob;
  pageCount: number;
  rotatedCount: number;
  downloadName: string;
  size: number;
};

export type RotatePdfOptions = {
  /** Extra rotation (degrees) per 0-based source index. */
  rotations: PageRotation[];
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

export function rotatePdfLimitsHint() {
  return `PDF · up to ${formatFileSize(MAX_PDF_SIZE_BYTES)} · max ${MAX_ROTATE_PAGES} pages`;
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

export function rotatePage(
  page: RotatePdfPage,
  direction: 90 | -90 | 180,
): RotatePdfPage {
  return {
    ...page,
    rotation: normalizeRotation(page.rotation + direction),
  };
}

export function hasRotations(pages: RotatePdfPage[]): boolean {
  return pages.some((page) => page.rotation !== 0);
}

export function countRotatedPages(pages: RotatePdfPage[]): number {
  return pages.filter((page) => page.rotation !== 0).length;
}

export function resetPageRotations(pages: RotatePdfPage[]): RotatePdfPage[] {
  return pages.map((page) =>
    page.rotation === 0 ? page : { ...page, rotation: 0 },
  );
}

export async function loadPdfForRotate(
  file: File,
  options: {
    signal?: AbortSignal;
    onProgress?: (current: number, total: number) => void;
  } = {},
): Promise<LoadRotatePdfResult> {
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
  if (pageCount > MAX_ROTATE_PAGES) {
    throw new Error(
      `This PDF has ${pageCount} pages. Please use a file with ${MAX_ROTATE_PAGES} pages or fewer.`,
    );
  }

  const loadingTask = getDocument({ data: bytes.slice() });
  const pdfjsDoc = await loadingTask.promise;

  if (options.signal?.aborted) {
    await loadingTask.destroy();
    throw new DOMException("Load cancelled.", "AbortError");
  }

  const pages: RotatePdfPage[] = [];

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

export async function rotatePdfPages(
  sourceBytes: Uint8Array,
  file: File,
  options: RotatePdfOptions,
): Promise<RotatePdfResult> {
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
  if (pageCount === 0) {
    throw new Error("This PDF has no pages.");
  }
  if (options.rotations.length !== pageCount) {
    throw new Error("Page rotations are incomplete. Reload the PDF and try again.");
  }

  const rotatedCount = options.rotations.filter((rotation) => rotation !== 0).length;
  if (rotatedCount === 0) {
    throw new Error("Rotate at least one page before downloading.");
  }

  const dest = await PDFDocument.create();

  for (let index = 0; index < pageCount; index += 1) {
    assertNotAborted(options.signal);
    options.onProgress?.(index + 1, pageCount);

    const [copied] = await dest.copyPages(source, [index]);
    const sourcePage = source.getPage(index);
    const baseRotation = normalizeRotation(sourcePage.getRotation().angle);
    const finalRotation = normalizeRotation(baseRotation + options.rotations[index]);
    copied.setRotation(degrees(finalRotation));
    dest.addPage(copied);
  }

  assertNotAborted(options.signal);

  const pdfBytes = await dest.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const base = fileBaseName(file) || "document";

  return {
    blob,
    pageCount,
    rotatedCount,
    downloadName: `${base}-rotated.pdf`,
    size: blob.size,
  };
}

export function downloadRotatedPdf(result: RotatePdfResult) {
  downloadBlob(result.blob, result.downloadName);
}

export function describeRotateResult(result: RotatePdfResult): string {
  const rotated =
    result.rotatedCount === 1
      ? "1 page rotated"
      : `${result.rotatedCount} pages rotated`;
  const pages =
    result.pageCount === 1 ? "1 page" : `${result.pageCount} pages`;
  return `${rotated} · ${pages} · ${formatFileSize(result.size)}`;
}
