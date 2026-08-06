import { jsPDF } from "jspdf";
import { downloadBlob, formatFileSize } from "@/lib/image";

export type PdfCreatorPageSize = "a4" | "letter";
export type PdfCreatorOrientation = "portrait" | "landscape";

export type PdfCreatorInput = {
  title: string;
  body: string;
  pageSize: PdfCreatorPageSize;
  orientation: PdfCreatorOrientation;
  blankPages: number;
  filename: string;
};

export type PdfCreatorResult = {
  blob: Blob;
  url: string;
  pageCount: number;
  hasText: boolean;
  blankPages: number;
  pageSize: PdfCreatorPageSize;
  orientation: PdfCreatorOrientation;
  downloadName: string;
  outputSize: number;
};

export const MAX_PDF_CREATOR_TITLE_CHARS = 200;
export const MAX_PDF_CREATOR_BODY_CHARS = 50_000;
export const MAX_PDF_CREATOR_BLANK_PAGES = 50;
export const MAX_PDF_CREATOR_TOTAL_PAGES = 50;
export const MAX_PDF_CREATOR_FILENAME_CHARS = 80;

const MARGIN_MM = 18;
const TITLE_SIZE = 18;
const BODY_SIZE = 11;
const TITLE_LINE_HEIGHT = 8;
const BODY_LINE_HEIGHT = 6;

export function sanitizePdfFilename(raw: string): string {
  const trimmed = raw.trim().replace(/\.pdf$/i, "");
  const safe = trimmed
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_PDF_CREATOR_FILENAME_CHARS);
  return safe || "document";
}

export function validatePdfCreatorInput(
  input: PdfCreatorInput,
): string | null {
  if (input.title.length > MAX_PDF_CREATOR_TITLE_CHARS) {
    return `Title must be ${MAX_PDF_CREATOR_TITLE_CHARS} characters or fewer.`;
  }

  if (input.body.length > MAX_PDF_CREATOR_BODY_CHARS) {
    return `Body text must be ${MAX_PDF_CREATOR_BODY_CHARS.toLocaleString()} characters or fewer.`;
  }

  if (
    !Number.isInteger(input.blankPages) ||
    input.blankPages < 0 ||
    input.blankPages > MAX_PDF_CREATOR_BLANK_PAGES
  ) {
    return `Blank pages must be between 0 and ${MAX_PDF_CREATOR_BLANK_PAGES}.`;
  }

  const hasText = Boolean(input.title.trim() || input.body.trim());
  if (!hasText && input.blankPages < 1) {
    return "Add a title or body text, or set blank pages to at least 1.";
  }

  return null;
}

export function pageSizeLabel(pageSize: PdfCreatorPageSize): string {
  return pageSize === "letter" ? "Letter" : "A4";
}

export function orientationLabel(
  orientation: PdfCreatorOrientation,
): string {
  return orientation === "landscape" ? "Landscape" : "Portrait";
}

function ensurePageSpace(
  doc: jsPDF,
  y: number,
  needed: number,
  pageHeight: number,
): number {
  if (y + needed <= pageHeight - MARGIN_MM) {
    return y;
  }
  doc.addPage();
  return MARGIN_MM;
}

export function createPdfDocument(
  input: PdfCreatorInput,
): PdfCreatorResult {
  const error = validatePdfCreatorInput(input);
  if (error) {
    throw new Error(error);
  }

  const title = input.title.trim();
  const body = input.body.replace(/\r\n/g, "\n").trim();
  const hasText = Boolean(title || body);
  const downloadName = `${sanitizePdfFilename(input.filename)}.pdf`;

  const doc = new jsPDF({
    unit: "mm",
    format: input.pageSize,
    orientation: input.orientation,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN_MM * 2;
  let y = MARGIN_MM;

  if (hasText) {
    if (title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(TITLE_SIZE);
      const titleLines = doc.splitTextToSize(title, contentWidth) as string[];
      for (const line of titleLines) {
        y = ensurePageSpace(doc, y, TITLE_LINE_HEIGHT, pageHeight);
        doc.text(line, MARGIN_MM, y);
        y += TITLE_LINE_HEIGHT;
      }
      y += 4;
    }

    if (body) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(BODY_SIZE);
      const paragraphs = body.split(/\n{2,}/);

      for (let p = 0; p < paragraphs.length; p += 1) {
        const paragraph = paragraphs[p];
        const softLines = paragraph.split("\n");

        for (const softLine of softLines) {
          const lines = doc.splitTextToSize(
            softLine.length > 0 ? softLine : " ",
            contentWidth,
          ) as string[];

          for (const line of lines) {
            y = ensurePageSpace(doc, y, BODY_LINE_HEIGHT, pageHeight);
            doc.text(line, MARGIN_MM, y);
            y += BODY_LINE_HEIGHT;
          }
        }

        if (p < paragraphs.length - 1) {
          y += BODY_LINE_HEIGHT * 0.55;
        }
      }
    }
  } else {
    // Pure blank PDF: start with one blank page already created by jsPDF.
    // Remaining blank pages are added below (blankPages - 1).
  }

  const blankToAdd = hasText
    ? input.blankPages
    : Math.max(0, input.blankPages - 1);

  for (let i = 0; i < blankToAdd; i += 1) {
    doc.addPage();
  }

  const pageCount = doc.getNumberOfPages();
  if (pageCount > MAX_PDF_CREATOR_TOTAL_PAGES) {
    throw new Error(
      `This document would be ${pageCount} pages. Keep text shorter or use at most ${MAX_PDF_CREATOR_TOTAL_PAGES} pages total.`,
    );
  }

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    pageCount,
    hasText,
    blankPages: input.blankPages,
    pageSize: input.pageSize,
    orientation: input.orientation,
    downloadName,
    outputSize: blob.size,
  };
}

export function revokePdfCreatorResult(result: PdfCreatorResult | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadCreatedPdf(result: PdfCreatorResult) {
  downloadBlob(result.blob, result.downloadName);
}

export function describePdfCreatorResult(result: PdfCreatorResult): string {
  const pages =
    result.pageCount === 1 ? "1 page" : `${result.pageCount} pages`;
  return `${pages} · ${formatFileSize(result.outputSize)} · ${pageSizeLabel(result.pageSize)} ${orientationLabel(result.orientation)}`;
}

export function pdfCreatorLimitsHint(): string {
  return `Up to ${MAX_PDF_CREATOR_TOTAL_PAGES} pages · title ${MAX_PDF_CREATOR_TITLE_CHARS} chars · body ${MAX_PDF_CREATOR_BODY_CHARS.toLocaleString()} chars`;
}
