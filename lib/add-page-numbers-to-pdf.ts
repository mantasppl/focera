import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_PAGES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export type PageNumberPosition =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "top-left"
  | "top-right";

export type PageNumberPositionOption = {
  value: PageNumberPosition;
  label: string;
  hint: string;
};

export const PAGE_NUMBER_POSITIONS: PageNumberPositionOption[] = [
  { value: "bottom-center", label: "Bottom center", hint: "Classic footer" },
  { value: "bottom-left", label: "Bottom left", hint: "Left footer" },
  { value: "bottom-right", label: "Bottom right", hint: "Right footer" },
  { value: "top-center", label: "Top center", hint: "Centered header" },
  { value: "top-left", label: "Top left", hint: "Left header" },
  { value: "top-right", label: "Top right", hint: "Right header" },
];

export type PageNumberFormat = "number" | "n-of-total" | "page-n" | "page-n-of-total";

export type PageNumberFormatOption = {
  value: PageNumberFormat;
  label: string;
  hint: string;
};

export const PAGE_NUMBER_FORMATS: PageNumberFormatOption[] = [
  { value: "number", label: "1", hint: "Number only" },
  { value: "n-of-total", label: "1 / N", hint: "With total" },
  { value: "page-n", label: "Page 1", hint: "Labeled" },
  { value: "page-n-of-total", label: "Page 1 of N", hint: "Full label" },
];

export type AddPageNumbersResult = {
  blob: Blob;
  pageCount: number;
  outputSize: number;
};

export type AddPageNumbersOptions = {
  position?: PageNumberPosition;
  format?: PageNumberFormat;
  /** First page number (default 1). */
  startNumber?: number;
  /** Font size in points (8–36). */
  fontSize?: number;
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

const MARGIN = 28;
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 36;
const DEFAULT_FONT_SIZE = 12;
const DEFAULT_START = 1;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function formatPageNumber(
  pageIndex: number,
  pageCount: number,
  startNumber: number,
  format: PageNumberFormat,
): string {
  const n = startNumber + pageIndex;
  const total = startNumber + pageCount - 1;

  switch (format) {
    case "n-of-total":
      return `${n} / ${total}`;
    case "page-n":
      return `Page ${n}`;
    case "page-n-of-total":
      return `Page ${n} of ${total}`;
    case "number":
    default:
      return String(n);
  }
}

function positionText(
  position: PageNumberPosition,
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  fontSize: number,
): { x: number; y: number } {
  const baselinePad = fontSize * 0.25;

  switch (position) {
    case "bottom-left":
      return { x: MARGIN, y: MARGIN };
    case "bottom-right":
      return { x: pageWidth - textWidth - MARGIN, y: MARGIN };
    case "top-center":
      return {
        x: (pageWidth - textWidth) / 2,
        y: pageHeight - fontSize - MARGIN + baselinePad,
      };
    case "top-left":
      return {
        x: MARGIN,
        y: pageHeight - fontSize - MARGIN + baselinePad,
      };
    case "top-right":
      return {
        x: pageWidth - textWidth - MARGIN,
        y: pageHeight - fontSize - MARGIN + baselinePad,
      };
    case "bottom-center":
    default:
      return { x: (pageWidth - textWidth) / 2, y: MARGIN };
  }
}

function drawPageNumber(
  page: PDFPage,
  font: PDFFont,
  text: string,
  position: PageNumberPosition,
  fontSize: number,
) {
  const { width: pageWidth, height: pageHeight } = page.getSize();
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  const { x, y } = positionText(
    position,
    pageWidth,
    pageHeight,
    textWidth,
    fontSize,
  );

  page.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
}

export async function addPageNumbersToPdf(
  pdfFile: File,
  options: AddPageNumbersOptions = {},
): Promise<AddPageNumbersResult> {
  const pdfError = validatePdfFile(pdfFile);
  if (pdfError) throw new Error(pdfError);

  if (options.signal?.aborted) {
    throw new DOMException("Page numbering cancelled.", "AbortError");
  }

  const position = options.position ?? "bottom-center";
  const format = options.format ?? "number";
  const startNumber = Math.max(
    1,
    Math.floor(options.startNumber ?? DEFAULT_START),
  );
  const fontSize = clamp(
    options.fontSize ?? DEFAULT_FONT_SIZE,
    MIN_FONT_SIZE,
    MAX_FONT_SIZE,
  );

  options.onProgress?.(0, 1);

  const pdf = await PDFDocument.load(await pdfFile.arrayBuffer());
  const pages = pdf.getPages();

  if (pages.length > MAX_PDF_PAGES) {
    throw new Error(
      `This PDF has ${pages.length} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
    );
  }

  if (options.signal?.aborted) {
    throw new DOMException("Page numbering cancelled.", "AbortError");
  }

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pageCount = pages.length;

  for (let index = 0; index < pageCount; index += 1) {
    if (options.signal?.aborted) {
      throw new DOMException("Page numbering cancelled.", "AbortError");
    }

    options.onProgress?.(index + 1, pageCount);

    const text = formatPageNumber(index, pageCount, startNumber, format);
    drawPageNumber(pages[index], font, text, position, fontSize);
  }

  if (options.signal?.aborted) {
    throw new DOMException("Page numbering cancelled.", "AbortError");
  }

  const pdfBytes = await pdf.save({ useObjectStreams: true });
  const output = new Uint8Array(pdfBytes);
  const blob = new Blob([output], { type: "application/pdf" });

  return {
    blob,
    pageCount,
    outputSize: blob.size,
  };
}

export function downloadNumberedPdf(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "document";
  downloadBlob(blob, `${base}-numbered.pdf`);
}

export function describeNumberedResult(
  pageCount: number,
  outputSize: number,
): string {
  const pages = pageCount === 1 ? "1 page" : `${pageCount} pages`;
  return `${pages} · ${formatFileSize(outputSize)}`;
}

export {
  DEFAULT_FONT_SIZE,
  DEFAULT_START,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
};
