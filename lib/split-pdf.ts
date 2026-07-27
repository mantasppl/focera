import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_PAGES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export const MAX_SPLIT_PAGES = MAX_PDF_PAGES;

export type SplitMode = "every" | "ranges" | "fixed";

export type SplitModePreset = {
  mode: SplitMode;
  label: string;
  hint: string;
};

export const SPLIT_MODE_PRESETS: SplitModePreset[] = [
  {
    mode: "every",
    label: "Every page",
    hint: "One PDF per page",
  },
  {
    mode: "ranges",
    label: "Page ranges",
    hint: "e.g. 1-3, 5, 8-10",
  },
  {
    mode: "fixed",
    label: "Fixed size",
    hint: "Every N pages",
  },
];

export type PageRange = {
  start: number;
  end: number;
};

export type SplitPart = {
  label: string;
  pageIndices: number[];
  blob: Blob;
  size: number;
};

export type SplitPdfResult = {
  parts: SplitPart[];
  pageCount: number;
  downloadBlob: Blob;
  downloadName: string;
  isZip: boolean;
};

export type SplitPdfOptions = {
  mode: SplitMode;
  rangesText?: string;
  pagesPerFile?: number;
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

export type PdfInfo = {
  pageCount: number;
};

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Split cancelled.", "AbortError");
  }
}

export async function loadPdfInfo(
  file: File,
  signal?: AbortSignal,
): Promise<PdfInfo> {
  assertNotAborted(signal);

  const bytes = await file.arrayBuffer();
  assertNotAborted(signal);

  let source: PDFDocument;
  try {
    source = await PDFDocument.load(bytes);
  } catch {
    throw new Error(
      "This PDF could not be read. It may be damaged or password-protected.",
    );
  }

  const pageCount = source.getPageCount();
  if (pageCount < 1) {
    throw new Error("This PDF has no pages to split.");
  }
  if (pageCount > MAX_SPLIT_PAGES) {
    throw new Error(
      `PDFs are limited to ${MAX_SPLIT_PAGES} pages for splitting.`,
    );
  }

  return { pageCount };
}

/**
 * Parse range text like "1-3, 5, 8-10" into 1-based inclusive ranges.
 */
export function parsePageRanges(
  text: string,
  pageCount: number,
): PageRange[] | string {
  const trimmed = text.trim();
  if (!trimmed) {
    return "Enter at least one page range (for example 1-3, 5).";
  }

  const parts = trimmed.split(/[,;\s]+/).filter(Boolean);
  if (parts.length === 0) {
    return "Enter at least one page range (for example 1-3, 5).";
  }

  const ranges: PageRange[] = [];

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

    ranges.push({ start, end });
  }

  return ranges;
}

export function buildFixedRanges(
  pageCount: number,
  pagesPerFile: number,
): PageRange[] | string {
  if (!Number.isInteger(pagesPerFile) || pagesPerFile < 1) {
    return "Pages per file must be a whole number of at least 1.";
  }
  if (pagesPerFile > pageCount) {
    return `Pages per file cannot exceed the PDF length (${pageCount}).`;
  }

  const ranges: PageRange[] = [];
  for (let start = 1; start <= pageCount; start += pagesPerFile) {
    ranges.push({
      start,
      end: Math.min(start + pagesPerFile - 1, pageCount),
    });
  }
  return ranges;
}

function rangesToIndexGroups(ranges: PageRange[]): number[][] {
  return ranges.map((range) => {
    const indices: number[] = [];
    for (let page = range.start; page <= range.end; page += 1) {
      indices.push(page - 1);
    }
    return indices;
  });
}

function formatRangeLabel(indices: number[]): string {
  if (indices.length === 0) return "empty";
  const start = indices[0] + 1;
  const end = indices[indices.length - 1] + 1;
  return start === end ? `page-${start}` : `pages-${start}-${end}`;
}

async function createPdfFromPages(
  source: PDFDocument,
  pageIndices: number[],
): Promise<Blob> {
  const dest = await PDFDocument.create();
  const copied = await dest.copyPages(source, pageIndices);
  for (const page of copied) {
    dest.addPage(page);
  }
  const pdfBytes = await dest.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
}

export function validateSplitOptions(
  pageCount: number,
  options: Pick<SplitPdfOptions, "mode" | "rangesText" | "pagesPerFile">,
): string | null {
  if (pageCount < 1) {
    return "This PDF has no pages to split.";
  }

  if (options.mode === "every") {
    if (pageCount < 2) {
      return "A single-page PDF cannot be split further.";
    }
    return null;
  }

  if (options.mode === "ranges") {
    const parsed = parsePageRanges(options.rangesText ?? "", pageCount);
    return typeof parsed === "string" ? parsed : null;
  }

  if (options.mode === "fixed") {
    const parsed = buildFixedRanges(pageCount, options.pagesPerFile ?? 1);
    return typeof parsed === "string" ? parsed : null;
  }

  return "Choose a split mode.";
}

export async function splitPdfFile(
  file: File,
  options: SplitPdfOptions,
): Promise<SplitPdfResult> {
  assertNotAborted(options.signal);

  const bytes = await file.arrayBuffer();
  assertNotAborted(options.signal);

  let source: PDFDocument;
  try {
    source = await PDFDocument.load(bytes);
  } catch {
    throw new Error(
      "This PDF could not be read. It may be damaged or password-protected.",
    );
  }

  const pageCount = source.getPageCount();
  if (pageCount < 1) {
    throw new Error("This PDF has no pages to split.");
  }
  if (pageCount > MAX_SPLIT_PAGES) {
    throw new Error(
      `PDFs are limited to ${MAX_SPLIT_PAGES} pages for splitting.`,
    );
  }

  const validationError = validateSplitOptions(pageCount, options);
  if (validationError) {
    throw new Error(validationError);
  }

  let indexGroups: number[][];

  if (options.mode === "every") {
    indexGroups = Array.from({ length: pageCount }, (_, index) => [index]);
  } else if (options.mode === "ranges") {
    const parsed = parsePageRanges(options.rangesText ?? "", pageCount);
    if (typeof parsed === "string") {
      throw new Error(parsed);
    }
    indexGroups = rangesToIndexGroups(parsed);
  } else {
    const parsed = buildFixedRanges(pageCount, options.pagesPerFile ?? 1);
    if (typeof parsed === "string") {
      throw new Error(parsed);
    }
    indexGroups = rangesToIndexGroups(parsed);
  }

  const base = fileBaseName(file) || "split";
  const parts: SplitPart[] = [];
  const total = indexGroups.length;

  for (let index = 0; index < indexGroups.length; index += 1) {
    assertNotAborted(options.signal);
    options.onProgress?.(index + 1, total);

    const pageIndices = indexGroups[index];
    const blob = await createPdfFromPages(source, pageIndices);
    parts.push({
      label: formatRangeLabel(pageIndices),
      pageIndices,
      blob,
      size: blob.size,
    });
  }

  assertNotAborted(options.signal);

  if (parts.length === 1) {
    const part = parts[0];
    return {
      parts,
      pageCount,
      downloadBlob: part.blob,
      downloadName: `${base}-${part.label}.pdf`,
      isZip: false,
    };
  }

  const zip = new JSZip();
  for (const part of parts) {
    zip.file(`${base}-${part.label}.pdf`, part.blob);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });

  return {
    parts,
    pageCount,
    downloadBlob: zipBlob,
    downloadName: `${base}-split.zip`,
    isZip: true,
  };
}

export function downloadSplitResult(result: SplitPdfResult) {
  downloadBlob(result.downloadBlob, result.downloadName);
}

export function describeSplitResult(result: SplitPdfResult): string {
  const partWord = result.parts.length === 1 ? "file" : "files";
  if (result.isZip) {
    return `${result.parts.length} ${partWord} in a ZIP · ${formatFileSize(result.downloadBlob.size)}`;
  }
  return `1 PDF · ${formatFileSize(result.downloadBlob.size)}`;
}
