import { PDFDocument } from "pdf-lib";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_PAGES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";
import {
  MAX_PNG_FILES,
  type PngPdfMargin,
  type PngPdfPageSize,
  validatePngAddition,
} from "@/lib/png-to-pdf";

export {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_SIZE_BYTES,
  MAX_PDF_PAGES,
  validatePdfFile,
};
export { MAX_PNG_FILES, validatePngAddition };

export type ImagePdfPlacement = "start" | "end" | "after";
export type ImagePdfPageSize = PngPdfPageSize;
export type ImagePdfMargin = PngPdfMargin;

export type ImagePdfPlacementOption = {
  value: ImagePdfPlacement;
  label: string;
  hint: string;
};

export const IMAGE_PDF_PLACEMENTS: ImagePdfPlacementOption[] = [
  { value: "end", label: "At end", hint: "Append after last page" },
  { value: "start", label: "At start", hint: "Insert before page 1" },
  { value: "after", label: "After page", hint: "Insert after a page #" },
];

export type AddImagesToPdfResult = {
  blob: Blob;
  pageCount: number;
  sourcePageCount: number;
  imageCount: number;
  placement: ImagePdfPlacement;
  pageSize: ImagePdfPageSize;
  margin: ImagePdfMargin;
  outputSize: number;
};

export type AddImagesToPdfOptions = {
  placement?: ImagePdfPlacement;
  /** 1-based page number when placement is "after". */
  afterPage?: number;
  pageSize?: ImagePdfPageSize;
  margin?: ImagePdfMargin;
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

const PAGE_POINTS: Record<"a4" | "letter", { width: number; height: number }> =
  {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612, height: 792 },
  };

const MARGIN_POINTS: Record<ImagePdfMargin, number> = {
  none: 0,
  small: 18,
  medium: 36,
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Adding images cancelled.", "AbortError");
  }
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
  pageSize: ImagePdfPageSize,
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

function resolveInsertIndex(
  placement: ImagePdfPlacement,
  sourcePageCount: number,
  afterPage: number,
): number {
  if (placement === "start") return 0;
  if (placement === "end") return sourcePageCount;

  if (!Number.isInteger(afterPage) || afterPage < 1 || afterPage > sourcePageCount) {
    throw new Error(
      `Enter a page number between 1 and ${sourcePageCount} to insert after.`,
    );
  }
  return afterPage;
}

export async function getPdfPageCount(file: File): Promise<number> {
  const pdfError = validatePdfFile(file);
  if (pdfError) throw new Error(pdfError);

  const pdf = await PDFDocument.load(await file.arrayBuffer());
  return pdf.getPageCount();
}

export async function addImagesToPdf(
  pdfFile: File,
  imageFiles: File[],
  options: AddImagesToPdfOptions = {},
): Promise<AddImagesToPdfResult> {
  const pdfError = validatePdfFile(pdfFile);
  if (pdfError) throw new Error(pdfError);

  const imageError = validatePngAddition(imageFiles, []);
  if (imageError) throw new Error(imageError);

  throwIfAborted(options.signal);

  const placement = options.placement ?? "end";
  const pageSize = options.pageSize ?? "fit";
  const margin = pageSize === "fit" ? "none" : (options.margin ?? "small");
  const marginPts = MARGIN_POINTS[margin];
  const afterPage = options.afterPage ?? 1;

  options.onProgress?.(0, imageFiles.length + 1);

  const source = await PDFDocument.load(await pdfFile.arrayBuffer());
  const sourcePageCount = source.getPageCount();

  if (sourcePageCount === 0) {
    throw new Error("This PDF has no pages.");
  }

  if (sourcePageCount > MAX_PDF_PAGES) {
    throw new Error(
      `This PDF has ${sourcePageCount} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
    );
  }

  const totalPages = sourcePageCount + imageFiles.length;
  if (totalPages > MAX_PDF_PAGES) {
    throw new Error(
      `Adding ${imageFiles.length} image${imageFiles.length === 1 ? "" : "s"} would create ${totalPages} pages. Keep the total at ${MAX_PDF_PAGES} or fewer.`,
    );
  }

  throwIfAborted(options.signal);

  const insertAt = resolveInsertIndex(placement, sourcePageCount, afterPage);
  const dest = await PDFDocument.create();

  const beforeIndices = Array.from({ length: insertAt }, (_, i) => i);
  if (beforeIndices.length > 0) {
    const beforePages = await dest.copyPages(source, beforeIndices);
    for (const page of beforePages) {
      dest.addPage(page);
    }
  }

  for (let index = 0; index < imageFiles.length; index += 1) {
    throwIfAborted(options.signal);
    options.onProgress?.(index + 1, imageFiles.length + 1);

    const file = imageFiles[index];
    let embedded;
    try {
      const { bytes, kind } = await fileToPngOrJpg(file);
      embedded =
        kind === "png"
          ? await dest.embedPng(bytes)
          : await dest.embedJpg(bytes);
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
    const page = dest.addPage([pageWidth, pageHeight]);
    const draw = drawImageOnPage(
      pageWidth,
      pageHeight,
      embedded.width,
      embedded.height,
      pageSize === "fit" ? 0 : marginPts,
    );
    page.drawImage(embedded, draw);
  }

  const afterIndices = Array.from(
    { length: sourcePageCount - insertAt },
    (_, i) => insertAt + i,
  );
  if (afterIndices.length > 0) {
    throwIfAborted(options.signal);
    const afterPages = await dest.copyPages(source, afterIndices);
    for (const page of afterPages) {
      dest.addPage(page);
    }
  }

  throwIfAborted(options.signal);
  options.onProgress?.(imageFiles.length + 1, imageFiles.length + 1);

  const pdfBytes = await dest.save({ useObjectStreams: true });
  const output = new Uint8Array(pdfBytes);
  const blob = new Blob([output], { type: "application/pdf" });

  return {
    blob,
    pageCount: dest.getPageCount(),
    sourcePageCount,
    imageCount: imageFiles.length,
    placement,
    pageSize,
    margin,
    outputSize: blob.size,
  };
}

export function downloadPdfWithImages(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "document";
  downloadBlob(blob, `${base}-with-images.pdf`);
}

export function describeAddImagesResult(result: AddImagesToPdfResult): string {
  const pages =
    result.pageCount === 1 ? "1 page" : `${result.pageCount} pages`;
  const images =
    result.imageCount === 1 ? "1 image" : `${result.imageCount} images`;
  return `${pages} · ${images} added · ${formatFileSize(result.outputSize)}`;
}

export function pageSizeLabel(pageSize: ImagePdfPageSize): string {
  switch (pageSize) {
    case "a4":
      return "A4";
    case "letter":
      return "Letter";
    default:
      return "Fit to image";
  }
}

export function placementLabel(placement: ImagePdfPlacement): string {
  switch (placement) {
    case "start":
      return "At start";
    case "after":
      return "After page";
    default:
      return "At end";
  }
}
