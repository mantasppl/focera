import { PDFDocument } from "pdf-lib";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_PAGES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export type CropUnit = "in" | "mm" | "pt" | "percent";

export type CropUnitOption = {
  value: CropUnit;
  label: string;
  hint: string;
};

export const CROP_UNITS: CropUnitOption[] = [
  { value: "in", label: "Inches", hint: "in" },
  { value: "mm", label: "Millimeters", hint: "mm" },
  { value: "pt", label: "Points", hint: "pt" },
  { value: "percent", label: "Percent", hint: "% of page" },
];

export type CropMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type CropMarginMode = "uniform" | "custom";

export type CropMarginModeOption = {
  value: CropMarginMode;
  label: string;
  hint: string;
};

export const CROP_MARGIN_MODES: CropMarginModeOption[] = [
  { value: "uniform", label: "Uniform", hint: "Same on all sides" },
  { value: "custom", label: "Custom", hint: "Per-side margins" },
];

export type CropPresetId = "none" | "light" | "medium" | "heavy";

export type CropPreset = {
  id: CropPresetId;
  label: string;
  hint: string;
  /** Uniform margin value in the active unit. */
  values: Record<CropUnit, number>;
};

export const CROP_PRESETS: CropPreset[] = [
  {
    id: "none",
    label: "None",
    hint: "No trim",
    values: { in: 0, mm: 0, pt: 0, percent: 0 },
  },
  {
    id: "light",
    label: "Light",
    hint: "Small trim",
    values: { in: 0.25, mm: 6, pt: 18, percent: 2 },
  },
  {
    id: "medium",
    label: "Medium",
    hint: "Common trim",
    values: { in: 0.5, mm: 12, pt: 36, percent: 5 },
  },
  {
    id: "heavy",
    label: "Heavy",
    hint: "Wide trim",
    values: { in: 1, mm: 25, pt: 72, percent: 10 },
  },
];

export type CropPdfResult = {
  blob: Blob;
  pageCount: number;
  originalSize: number;
  outputSize: number;
  /** Crop applied on the first page, in points. */
  appliedMarginsPt: CropMargins;
  /** First page size after crop, in points. */
  croppedSizePt: { width: number; height: number };
};

export type CropPdfOptions = {
  unit: CropUnit;
  margins: CropMargins;
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

export type PdfCropInfo = {
  pageCount: number;
  /** First page media size in points. */
  pageWidthPt: number;
  pageHeightPt: number;
};

const PT_PER_INCH = 72;
const MM_PER_INCH = 25.4;
const MIN_PAGE_SIDE_PT = 12;

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Crop cancelled.", "AbortError");
  }
}

export function unitLabel(unit: CropUnit): string {
  switch (unit) {
    case "in":
      return "in";
    case "mm":
      return "mm";
    case "pt":
      return "pt";
    case "percent":
      return "%";
  }
}

export function formatPointsSize(widthPt: number, heightPt: number): string {
  const widthIn = widthPt / PT_PER_INCH;
  const heightIn = heightPt / PT_PER_INCH;
  return `${widthIn.toFixed(2)} × ${heightIn.toFixed(2)} in`;
}

function toPoints(
  value: number,
  unit: CropUnit,
  pageSizePt: number,
): number {
  if (!Number.isFinite(value) || value < 0) return 0;

  switch (unit) {
    case "in":
      return value * PT_PER_INCH;
    case "mm":
      return (value / MM_PER_INCH) * PT_PER_INCH;
    case "pt":
      return value;
    case "percent":
      return (Math.min(value, 49) / 100) * pageSizePt;
  }
}

export function marginsToPoints(
  margins: CropMargins,
  unit: CropUnit,
  pageWidthPt: number,
  pageHeightPt: number,
): CropMargins {
  return {
    top: toPoints(margins.top, unit, pageHeightPt),
    right: toPoints(margins.right, unit, pageWidthPt),
    bottom: toPoints(margins.bottom, unit, pageHeightPt),
    left: toPoints(margins.left, unit, pageWidthPt),
  };
}

export function validateMargins(
  margins: CropMargins,
  unit: CropUnit,
): string | null {
  const sides: (keyof CropMargins)[] = ["top", "right", "bottom", "left"];
  for (const side of sides) {
    const value = margins[side];
    if (!Number.isFinite(value) || value < 0) {
      return "Margins must be zero or a positive number.";
    }
    if (unit === "percent" && value >= 50) {
      return "Each percent margin must be under 50% so the page stays visible.";
    }
  }

  if (unit === "percent") {
    if (margins.left + margins.right >= 100) {
      return "Left and right percent margins must total less than 100%.";
    }
    if (margins.top + margins.bottom >= 100) {
      return "Top and bottom percent margins must total less than 100%.";
    }
  }

  const hasCrop =
    margins.top > 0 ||
    margins.right > 0 ||
    margins.bottom > 0 ||
    margins.left > 0;
  if (!hasCrop) {
    return "Set a margin greater than zero to crop the PDF.";
  }

  return null;
}

export async function loadPdfCropInfo(
  file: File,
  signal?: AbortSignal,
): Promise<PdfCropInfo> {
  assertNotAborted(signal);

  const validationError = validatePdfFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

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
    throw new Error("This PDF has no pages to crop.");
  }
  if (pageCount > MAX_PDF_PAGES) {
    throw new Error(
      `This PDF has ${pageCount} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
    );
  }

  const first = source.getPage(0);
  const { width, height } = first.getSize();

  return {
    pageCount,
    pageWidthPt: width,
    pageHeightPt: height,
  };
}

function applyCropToPage(
  page: ReturnType<PDFDocument["getPage"]>,
  marginsPt: CropMargins,
) {
  const { width, height } = page.getSize();
  const newWidth = width - marginsPt.left - marginsPt.right;
  const newHeight = height - marginsPt.top - marginsPt.bottom;

  if (newWidth < MIN_PAGE_SIDE_PT || newHeight < MIN_PAGE_SIDE_PT) {
    throw new Error(
      "Crop margins are too large for one or more pages. Reduce the trim and try again.",
    );
  }

  const x = marginsPt.left;
  const y = marginsPt.bottom;

  page.setMediaBox(x, y, newWidth, newHeight);
  page.setCropBox(x, y, newWidth, newHeight);
  page.setBleedBox(x, y, newWidth, newHeight);
  page.setTrimBox(x, y, newWidth, newHeight);
  page.setArtBox(x, y, newWidth, newHeight);

  return { width: newWidth, height: newHeight };
}

export async function cropPdfFile(
  file: File,
  options: CropPdfOptions,
): Promise<CropPdfResult> {
  assertNotAborted(options.signal);

  const validationError = validatePdfFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const marginError = validateMargins(options.margins, options.unit);
  if (marginError) {
    throw new Error(marginError);
  }

  const bytes = await file.arrayBuffer();
  assertNotAborted(options.signal);

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes);
  } catch {
    throw new Error(
      "This PDF could not be read. It may be damaged or password-protected.",
    );
  }

  const pageCount = doc.getPageCount();
  if (pageCount < 1) {
    throw new Error("This PDF has no pages to crop.");
  }
  if (pageCount > MAX_PDF_PAGES) {
    throw new Error(
      `This PDF has ${pageCount} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
    );
  }

  const pages = doc.getPages();
  let appliedMarginsPt: CropMargins | null = null;
  let croppedSizePt = { width: 0, height: 0 };

  for (let index = 0; index < pages.length; index += 1) {
    assertNotAborted(options.signal);
    options.onProgress?.(index + 1, pageCount);

    const page = pages[index];
    const { width, height } = page.getSize();
    const marginsPt = marginsToPoints(
      options.margins,
      options.unit,
      width,
      height,
    );

    if (!appliedMarginsPt) {
      appliedMarginsPt = marginsPt;
    }

    croppedSizePt = applyCropToPage(page, marginsPt);
  }

  assertNotAborted(options.signal);

  const pdfBytes = await doc.save({ useObjectStreams: true });
  const output = new Uint8Array(pdfBytes);
  const blob = new Blob([output], { type: "application/pdf" });

  return {
    blob,
    pageCount,
    originalSize: file.size,
    outputSize: blob.size,
    appliedMarginsPt: appliedMarginsPt ?? {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    croppedSizePt,
  };
}

export function downloadCroppedPdf(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "document";
  downloadBlob(blob, `${base}-cropped.pdf`);
}

export function describeCropResult(result: CropPdfResult): string {
  const size = formatPointsSize(
    result.croppedSizePt.width,
    result.croppedSizePt.height,
  );
  return `${result.pageCount} ${result.pageCount === 1 ? "page" : "pages"} · cropped to ${size} · ${formatFileSize(result.outputSize)}`;
}
