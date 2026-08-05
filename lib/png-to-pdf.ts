import { PDFDocument } from "pdf-lib";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/image";

export const ACCEPTED_PNG_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const MAX_PNG_FILES = 30;
export const MAX_PNG_TOTAL_BYTES = 80 * 1024 * 1024;
export const MAX_PNG_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;

export type PngPdfPageSize = "fit" | "a4" | "letter";
export type PngPdfMargin = "none" | "small" | "medium";

export type PngToPdfResult = {
  blob: Blob;
  url: string;
  pageCount: number;
  imageCount: number;
  pageSize: PngPdfPageSize;
  margin: PngPdfMargin;
  originalSize: number;
  outputSize: number;
  previewUrl: string | null;
};

export type ConvertPngToPdfOptions = {
  pageSize?: PngPdfPageSize;
  margin?: PngPdfMargin;
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

const PAGE_POINTS: Record<"a4" | "letter", { width: number; height: number }> =
  {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612, height: 792 },
  };

const MARGIN_POINTS: Record<PngPdfMargin, number> = {
  none: 0,
  small: 18,
  medium: 36,
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function isAcceptedImage(file: File): boolean {
  const name = file.name.toLowerCase();
  if (
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp")
  ) {
    return true;
  }
  return ACCEPTED_PNG_TYPES.includes(
    file.type as (typeof ACCEPTED_PNG_TYPES)[number],
  );
}

export function validatePngFile(file: File): string | null {
  if (!isAcceptedImage(file)) {
    return "Please upload a PNG, JPG, or WebP image.";
  }

  if (file.size > MAX_PNG_SIZE_BYTES) {
    return `Each image must be ${formatFileSize(MAX_PNG_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export function validatePngAddition(
  incoming: File[],
  existing: File[],
): string | null {
  if (incoming.length === 0) {
    return "Please upload at least one image.";
  }

  for (const file of incoming) {
    const singleError = validatePngFile(file);
    if (singleError) {
      return singleError;
    }
  }

  const nextCount = existing.length + incoming.length;
  if (nextCount > MAX_PNG_FILES) {
    return `You can convert up to ${MAX_PNG_FILES} images at a time.`;
  }

  const existingTotal = existing.reduce((sum, file) => sum + file.size, 0);
  const incomingTotal = incoming.reduce((sum, file) => sum + file.size, 0);
  if (existingTotal + incomingTotal > MAX_PNG_TOTAL_BYTES) {
    return `Combined image size must be ${formatFileSize(MAX_PNG_TOTAL_BYTES)} or smaller.`;
  }

  return null;
}

async function fileToPngOrJpg(file: File): Promise<{
  bytes: Uint8Array;
  kind: "png" | "jpg";
}> {
  if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
    return {
      bytes: new Uint8Array(await file.arrayBuffer()),
      kind: "png",
    };
  }

  if (
    file.type === "image/jpeg" ||
    file.name.toLowerCase().endsWith(".jpg") ||
    file.name.toLowerCase().endsWith(".jpeg")
  ) {
    return {
      bytes: new Uint8Array(await file.arrayBuffer()),
      kind: "jpg",
    };
  }

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not supported in this browser.");
    }
    context.drawImage(bitmap, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (!result) {
          reject(new Error("Could not convert this image for the PDF."));
          return;
        }
        resolve(result);
      }, "image/png");
    });

    return {
      bytes: new Uint8Array(await blob.arrayBuffer()),
      kind: "png",
    };
  } finally {
    bitmap.close();
  }
}

function pageSizeForImage(
  pageSize: PngPdfPageSize,
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

export async function convertPngToPdf(
  files: File[],
  options: ConvertPngToPdfOptions = {},
): Promise<PngToPdfResult> {
  if (files.length === 0) {
    throw new Error("Add at least one image to convert.");
  }

  const additionError = validatePngAddition(files, []);
  if (additionError) {
    throw new Error(additionError);
  }

  const pageSize = options.pageSize ?? "fit";
  const margin = pageSize === "fit" ? "none" : (options.margin ?? "small");
  const marginPts = MARGIN_POINTS[margin];

  throwIfAborted(options.signal);

  const pdf = await PDFDocument.create();
  const total = files.length;
  let previewUrl: string | null = null;

  for (let index = 0; index < files.length; index += 1) {
    throwIfAborted(options.signal);
    options.onProgress?.(index + 1, total);

    const file = files[index];
    let embedded;
    try {
      const { bytes, kind } = await fileToPngOrJpg(file);
      embedded =
        kind === "png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    } catch {
      throw new Error(
        `"${file.name}" could not be read. Try another PNG, JPG, or WebP.`,
      );
    }

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

    if (index === 0 && !previewUrl) {
      previewUrl = URL.createObjectURL(file);
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
    pageCount: files.length,
    imageCount: files.length,
    pageSize,
    margin,
    originalSize,
    outputSize: blob.size,
    previewUrl,
  };
}

export function revokePngToPdfResult(result: PngToPdfResult | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
  if (result?.previewUrl) {
    URL.revokeObjectURL(result.previewUrl);
  }
}

export function downloadPngPdf(blob: Blob, files: File[]) {
  const base =
    files.length === 1
      ? fileBaseName(files[0]) || "image"
      : `${fileBaseName(files[0]) || "images"}-and-${files.length - 1}-more`;
  downloadBlob(blob, `${base}.pdf`);
}

export function describePngPdfOutput(result: PngToPdfResult): string {
  const pages =
    result.pageCount === 1 ? "1 page" : `${result.pageCount} pages`;
  return `${pages} · ${formatFileSize(result.outputSize)}`;
}

export function pageSizeLabel(pageSize: PngPdfPageSize): string {
  switch (pageSize) {
    case "a4":
      return "A4";
    case "letter":
      return "Letter";
    default:
      return "Fit to image";
  }
}
