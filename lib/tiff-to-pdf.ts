import { PDFDocument } from "pdf-lib";
import * as UTIF from "utif";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/image";

export const ACCEPTED_TIFF_TYPES = ["image/tiff", "image/tif"] as const;

export const MAX_TIFF_FILES = 30;
export const MAX_TIFF_TOTAL_BYTES = 80 * 1024 * 1024;
export const MAX_TIFF_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;
export const MAX_TIFF_PAGES = 100;

export type TiffPdfPageSize = "fit" | "a4" | "letter";
export type TiffPdfMargin = "none" | "small" | "medium";

export type TiffToPdfResult = {
  blob: Blob;
  url: string;
  pageCount: number;
  imageCount: number;
  pageSize: TiffPdfPageSize;
  margin: TiffPdfMargin;
  originalSize: number;
  outputSize: number;
  previewUrl: string | null;
};

export type ConvertTiffToPdfOptions = {
  pageSize?: TiffPdfPageSize;
  margin?: TiffPdfMargin;
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

const PAGE_POINTS: Record<"a4" | "letter", { width: number; height: number }> =
  {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612, height: 792 },
  };

const MARGIN_POINTS: Record<TiffPdfMargin, number> = {
  none: 0,
  small: 18,
  medium: 36,
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function isAcceptedTiff(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".tif") || name.endsWith(".tiff")) {
    return true;
  }
  return ACCEPTED_TIFF_TYPES.includes(
    file.type as (typeof ACCEPTED_TIFF_TYPES)[number],
  );
}

export function validateTiffFile(file: File): string | null {
  if (!isAcceptedTiff(file)) {
    return "Please upload a TIFF image (.tif or .tiff).";
  }

  if (file.size > MAX_TIFF_SIZE_BYTES) {
    return `Each TIFF must be ${formatFileSize(MAX_TIFF_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export function validateTiffAddition(
  incoming: File[],
  existing: File[],
): string | null {
  if (incoming.length === 0) {
    return "Please upload at least one TIFF.";
  }

  for (const file of incoming) {
    const singleError = validateTiffFile(file);
    if (singleError) {
      return singleError;
    }
  }

  const nextCount = existing.length + incoming.length;
  if (nextCount > MAX_TIFF_FILES) {
    return `You can convert up to ${MAX_TIFF_FILES} TIFF files at a time.`;
  }

  const existingTotal = existing.reduce((sum, file) => sum + file.size, 0);
  const incomingTotal = incoming.reduce((sum, file) => sum + file.size, 0);
  if (existingTotal + incomingTotal > MAX_TIFF_TOTAL_BYTES) {
    return `Combined TIFF size must be ${formatFileSize(MAX_TIFF_TOTAL_BYTES)} or smaller.`;
  }

  return null;
}

function isRenderableIfd(ifd: UTIF.IFD): boolean {
  const newSubfile = ifd.t254;
  if (Array.isArray(newSubfile) && typeof newSubfile[0] === "number") {
    // Bit 0 = reduced-resolution (thumbnail)
    if ((newSubfile[0] & 1) === 1) {
      return false;
    }
  }

  const oldSubfile = ifd.t255;
  if (Array.isArray(oldSubfile) && oldSubfile[0] === 2) {
    return false;
  }

  return true;
}

async function rgbaToPngBytes(
  rgba: Uint8Array,
  width: number,
  height: number,
): Promise<{ pngBytes: Uint8Array; previewBlob: Blob }> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  const clamped = new Uint8ClampedArray(rgba.length);
  clamped.set(rgba);
  context.putImageData(new ImageData(clamped, width, height), 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error("Could not encode this TIFF page for the PDF."));
        return;
      }
      resolve(result);
    }, "image/png");
  });

  return {
    pngBytes: new Uint8Array(await blob.arrayBuffer()),
    previewBlob: blob,
  };
}

type DecodedTiffPage = {
  pngBytes: Uint8Array;
  width: number;
  height: number;
  previewBlob: Blob;
};

async function decodeTiffFile(file: File): Promise<DecodedTiffPage[]> {
  const buffer = await file.arrayBuffer();
  let ifds: UTIF.IFD[];
  try {
    ifds = UTIF.decode(buffer);
  } catch {
    throw new Error(
      `"${file.name}" could not be read. Try another TIFF (.tif or .tiff).`,
    );
  }

  const pages: DecodedTiffPage[] = [];

  for (const ifd of ifds) {
    if (!isRenderableIfd(ifd)) {
      continue;
    }

    try {
      UTIF.decodeImage(buffer, ifd);
    } catch {
      continue;
    }

    const width = ifd.width;
    const height = ifd.height;
    if (!width || !height || width < 1 || height < 1) {
      continue;
    }

    let rgba: Uint8Array;
    try {
      rgba = UTIF.toRGBA8(ifd);
    } catch {
      continue;
    }

    if (rgba.length < width * height * 4) {
      continue;
    }

    const encoded = await rgbaToPngBytes(rgba, width, height);
    pages.push({
      pngBytes: encoded.pngBytes,
      width,
      height,
      previewBlob: encoded.previewBlob,
    });
  }

  if (pages.length === 0) {
    throw new Error(
      `"${file.name}" has no readable image pages. Try another TIFF.`,
    );
  }

  return pages;
}

function pageSizeForImage(
  pageSize: TiffPdfPageSize,
  imageWidth: number,
  imageHeight: number,
): { width: number; height: number } {
  if (pageSize === "fit") {
    return { width: imageWidth, height: imageHeight };
  }

  const base = PAGE_POINTS[pageSize];
  const landscape = imageWidth > imageHeight;
  if (landscape) {
    return { width: base.height, height: base.width };
  }
  return { width: base.width, height: base.height };
}

function drawImageOnPage(
  pageWidth: number,
  pageHeight: number,
  imageWidth: number,
  imageHeight: number,
  margin: number,
): { x: number; y: number; width: number; height: number } {
  const usableWidth = Math.max(1, pageWidth - margin * 2);
  const usableHeight = Math.max(1, pageHeight - margin * 2);
  const scale = Math.min(usableWidth / imageWidth, usableHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return {
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
    width,
    height,
  };
}

export async function convertTiffToPdf(
  files: File[],
  options: ConvertTiffToPdfOptions = {},
): Promise<TiffToPdfResult> {
  if (files.length === 0) {
    throw new Error("Add at least one TIFF to convert.");
  }

  const additionError = validateTiffAddition(files, []);
  if (additionError) {
    throw new Error(additionError);
  }

  const pageSize = options.pageSize ?? "fit";
  const margin = pageSize === "fit" ? "none" : (options.margin ?? "small");
  const marginPts = MARGIN_POINTS[margin];

  throwIfAborted(options.signal);

  const decodedFiles: DecodedTiffPage[][] = [];
  let totalPages = 0;

  for (const file of files) {
    throwIfAborted(options.signal);
    const pages = await decodeTiffFile(file);
    totalPages += pages.length;
    if (totalPages > MAX_TIFF_PAGES) {
      throw new Error(
        `You can convert up to ${MAX_TIFF_PAGES} TIFF pages at a time.`,
      );
    }
    decodedFiles.push(pages);
  }

  const pdf = await PDFDocument.create();
  let previewUrl: string | null = null;
  let pageIndex = 0;

  for (const pages of decodedFiles) {
    for (const pageImage of pages) {
      throwIfAborted(options.signal);
      pageIndex += 1;
      options.onProgress?.(pageIndex, totalPages);

      const embedded = await pdf.embedPng(pageImage.pngBytes);
      const { width: pageWidth, height: pageHeight } = pageSizeForImage(
        pageSize,
        embedded.width,
        embedded.height,
      );
      const page = pdf.addPage([pageWidth, pageHeight]);
      const draw = drawImageOnPage(
        pageWidth,
        pageHeight,
        embedded.width,
        embedded.height,
        pageSize === "fit" ? 0 : marginPts,
      );
      page.drawImage(embedded, draw);

      if (!previewUrl) {
        previewUrl = URL.createObjectURL(pageImage.previewBlob);
      }
    }
  }

  throwIfAborted(options.signal);

  const pdfBytes = await pdf.save();
  const bytes = new Uint8Array(pdfBytes);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const originalSize = files.reduce((sum, file) => sum + file.size, 0);

  return {
    blob,
    url,
    pageCount: totalPages,
    imageCount: files.length,
    pageSize,
    margin,
    originalSize,
    outputSize: blob.size,
    previewUrl,
  };
}

export function revokeTiffToPdfResult(result: TiffToPdfResult | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
  if (result?.previewUrl) {
    URL.revokeObjectURL(result.previewUrl);
  }
}

export function downloadTiffPdf(blob: Blob, files: File[]) {
  const base =
    files.length === 1
      ? fileBaseName(files[0]) || "tiff"
      : `${fileBaseName(files[0]) || "tiff"}-and-${files.length - 1}-more`;
  downloadBlob(blob, `${base}.pdf`);
}

export function describeTiffPdfOutput(result: TiffToPdfResult): string {
  const pages =
    result.pageCount === 1 ? "1 page" : `${result.pageCount} pages`;
  return `${pages} · ${formatFileSize(result.outputSize)}`;
}

export function pageSizeLabel(pageSize: TiffPdfPageSize): string {
  switch (pageSize) {
    case "a4":
      return "A4";
    case "letter":
      return "Letter";
    default:
      return "Fit to image";
  }
}
