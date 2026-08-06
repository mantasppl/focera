import {
  PDFDocument,
  StandardFonts,
  degrees,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_PAGES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export type TextPosition =
  | "center"
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type TextPositionOption = {
  value: TextPosition;
  label: string;
  hint: string;
};

export const TEXT_POSITIONS: TextPositionOption[] = [
  { value: "center", label: "Center", hint: "Middle of page" },
  { value: "top-left", label: "Top left", hint: "Header corner" },
  { value: "top-center", label: "Top center", hint: "Header" },
  { value: "top-right", label: "Top right", hint: "Header corner" },
  { value: "bottom-left", label: "Bottom left", hint: "Footer corner" },
  { value: "bottom-center", label: "Bottom center", hint: "Footer" },
  { value: "bottom-right", label: "Bottom right", hint: "Footer corner" },
];

export type TextFontId =
  | "helvetica"
  | "helvetica-bold"
  | "times"
  | "times-bold"
  | "courier";

export type TextFontOption = {
  value: TextFontId;
  label: string;
  hint: string;
  standard: StandardFonts;
};

export const TEXT_FONTS: TextFontOption[] = [
  {
    value: "helvetica",
    label: "Helvetica",
    hint: "Clean sans",
    standard: StandardFonts.Helvetica,
  },
  {
    value: "helvetica-bold",
    label: "Helvetica Bold",
    hint: "Strong sans",
    standard: StandardFonts.HelveticaBold,
  },
  {
    value: "times",
    label: "Times",
    hint: "Classic serif",
    standard: StandardFonts.TimesRoman,
  },
  {
    value: "times-bold",
    label: "Times Bold",
    hint: "Strong serif",
    standard: StandardFonts.TimesRomanBold,
  },
  {
    value: "courier",
    label: "Courier",
    hint: "Monospace",
    standard: StandardFonts.Courier,
  },
];

export type TextColorId = "black" | "gray" | "red" | "blue" | "green";

export type TextColorOption = {
  value: TextColorId;
  label: string;
  hint: string;
  color: RGB;
};

export const TEXT_COLORS: TextColorOption[] = [
  {
    value: "black",
    label: "Black",
    hint: "Default",
    color: rgb(0.12, 0.12, 0.12),
  },
  {
    value: "gray",
    label: "Gray",
    hint: "Subtle",
    color: rgb(0.45, 0.45, 0.45),
  },
  {
    value: "red",
    label: "Red",
    hint: "Highlight",
    color: rgb(0.75, 0.12, 0.12),
  },
  {
    value: "blue",
    label: "Blue",
    hint: "Accent",
    color: rgb(0.12, 0.28, 0.7),
  },
  {
    value: "green",
    label: "Green",
    hint: "Accent",
    color: rgb(0.08, 0.45, 0.32),
  },
];

export type TextPageTarget = "all" | "first" | "last";

export type TextPageTargetOption = {
  value: TextPageTarget;
  label: string;
  hint: string;
};

export const TEXT_PAGE_TARGETS: TextPageTargetOption[] = [
  { value: "all", label: "All pages", hint: "Every page" },
  { value: "first", label: "First page", hint: "Cover only" },
  { value: "last", label: "Last page", hint: "Final page" },
];

export type TextRotation = 0 | 45 | -45;

export type TextRotationOption = {
  value: TextRotation;
  label: string;
  hint: string;
};

export const TEXT_ROTATIONS: TextRotationOption[] = [
  { value: 0, label: "None", hint: "Upright" },
  { value: 45, label: "45°", hint: "Diagonal" },
  { value: -45, label: "-45°", hint: "Diagonal" },
];

export type AddTextToPdfResult = {
  blob: Blob;
  pageCount: number;
  stampedPages: number;
  outputSize: number;
};

export type AddTextToPdfOptions = {
  text: string;
  position?: TextPosition;
  fontId?: TextFontId;
  colorId?: TextColorId;
  pageTarget?: TextPageTarget;
  rotation?: TextRotation;
  /** Font size in points (8–72). */
  fontSize?: number;
  /** 0–1 */
  opacity?: number;
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

const MARGIN = 28;
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 72;
const DEFAULT_FONT_SIZE = 18;
const DEFAULT_OPACITY = 1;
const MAX_TEXT_LENGTH = 2000;
const LINE_HEIGHT_RATIO = 1.25;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Add text cancelled.", "AbortError");
  }
}

function resolveFont(fontId: TextFontId): StandardFonts {
  return (
    TEXT_FONTS.find((option) => option.value === fontId)?.standard ??
    StandardFonts.Helvetica
  );
}

function resolveColor(colorId: TextColorId): RGB {
  return (
    TEXT_COLORS.find((option) => option.value === colorId)?.color ??
    rgb(0.12, 0.12, 0.12)
  );
}

function resolvePageIndexes(
  pageCount: number,
  target: TextPageTarget,
): number[] {
  if (pageCount < 1) return [];
  if (target === "first") return [0];
  if (target === "last") return [pageCount - 1];
  return Array.from({ length: pageCount }, (_, index) => index);
}

/** Normalize newlines and strip characters StandardFonts cannot encode. */
export function sanitizePdfText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/[^\x09\x0A\x20-\x7E\xA0-\xFF]/g, "");
}

function wrapLine(
  font: PDFFont,
  text: string,
  fontSize: number,
  maxWidth: number,
): string[] {
  if (!text) return [""];

  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];

  const lines: string[] = [];
  let current = words[0]!;

  for (let i = 1; i < words.length; i += 1) {
    const word = words[i]!;
    const next = `${current} ${word}`;
    if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }

  lines.push(current);
  return lines;
}

function layoutLines(
  font: PDFFont,
  text: string,
  fontSize: number,
  maxWidth: number,
): string[] {
  const softLines = text.split("\n");
  const lines: string[] = [];

  for (const softLine of softLines) {
    if (!softLine.trim()) {
      lines.push("");
      continue;
    }
    lines.push(...wrapLine(font, softLine, fontSize, maxWidth));
  }

  return lines.length ? lines : [""];
}

function blockSize(
  font: PDFFont,
  lines: string[],
  fontSize: number,
): { width: number; height: number } {
  const lineHeight = fontSize * LINE_HEIGHT_RATIO;
  const width = Math.max(
    0,
    ...lines.map((line) =>
      line ? font.widthOfTextAtSize(line, fontSize) : 0,
    ),
  );
  const height = Math.max(fontSize, lines.length * lineHeight);
  return { width, height };
}

function positionBlock(
  position: TextPosition,
  pageWidth: number,
  pageHeight: number,
  blockWidth: number,
  blockHeight: number,
): { x: number; y: number } {
  switch (position) {
    case "top-left":
      return { x: MARGIN, y: pageHeight - blockHeight - MARGIN };
    case "top-center":
      return {
        x: (pageWidth - blockWidth) / 2,
        y: pageHeight - blockHeight - MARGIN,
      };
    case "top-right":
      return {
        x: pageWidth - blockWidth - MARGIN,
        y: pageHeight - blockHeight - MARGIN,
      };
    case "bottom-left":
      return { x: MARGIN, y: MARGIN };
    case "bottom-center":
      return { x: (pageWidth - blockWidth) / 2, y: MARGIN };
    case "bottom-right":
      return { x: pageWidth - blockWidth - MARGIN, y: MARGIN };
    case "center":
    default:
      return {
        x: (pageWidth - blockWidth) / 2,
        y: (pageHeight - blockHeight) / 2,
      };
  }
}

function drawTextBlock(
  page: PDFPage,
  font: PDFFont,
  lines: string[],
  originX: number,
  originY: number,
  fontSize: number,
  color: RGB,
  opacity: number,
  rotation: TextRotation,
  align: "left" | "center" | "right",
  blockWidth: number,
) {
  const lineHeight = fontSize * LINE_HEIGHT_RATIO;
  // originY is the bottom of the text block; draw from top line downward.
  const topBaseline = originY + blockSize(font, lines, fontSize).height - fontSize;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!;
    if (!line) continue;

    const lineWidth = font.widthOfTextAtSize(line, fontSize);
    let x = originX;
    if (align === "center") x = originX + (blockWidth - lineWidth) / 2;
    if (align === "right") x = originX + (blockWidth - lineWidth);

    const y = topBaseline - index * lineHeight;

    page.drawText(line, {
      x,
      y,
      size: fontSize,
      font,
      color,
      opacity,
      rotate: degrees(rotation),
    });
  }
}

function alignForPosition(position: TextPosition): "left" | "center" | "right" {
  if (position.endsWith("left")) return "left";
  if (position.endsWith("right")) return "right";
  return "center";
}

export async function addTextToPdf(
  pdfFile: File,
  options: AddTextToPdfOptions,
): Promise<AddTextToPdfResult> {
  const pdfError = validatePdfFile(pdfFile);
  if (pdfError) throw new Error(pdfError);

  const rawText = options.text ?? "";
  const text = sanitizePdfText(rawText).trimEnd();

  if (!text.trim()) {
    throw new Error("Enter some text to add to the PDF.");
  }

  if (text.length > MAX_TEXT_LENGTH) {
    throw new Error(
      `Text is too long. Please keep it to ${MAX_TEXT_LENGTH} characters or fewer.`,
    );
  }

  assertNotAborted(options.signal);

  const position = options.position ?? "center";
  const fontId = options.fontId ?? "helvetica";
  const colorId = options.colorId ?? "black";
  const pageTarget = options.pageTarget ?? "all";
  const rotation = options.rotation ?? 0;
  const fontSize = clamp(
    options.fontSize ?? DEFAULT_FONT_SIZE,
    MIN_FONT_SIZE,
    MAX_FONT_SIZE,
  );
  const opacity = clamp(options.opacity ?? DEFAULT_OPACITY, 0.05, 1);
  const color = resolveColor(colorId);

  options.onProgress?.(0, 1);

  const pdf = await PDFDocument.load(await pdfFile.arrayBuffer());
  const pages = pdf.getPages();

  if (pages.length > MAX_PDF_PAGES) {
    throw new Error(
      `This PDF has ${pages.length} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
    );
  }

  assertNotAborted(options.signal);

  const font = await pdf.embedFont(resolveFont(fontId));
  const indexes = resolvePageIndexes(pages.length, pageTarget);
  const total = Math.max(1, indexes.length);
  const align = alignForPosition(position);

  for (let step = 0; step < indexes.length; step += 1) {
    assertNotAborted(options.signal);
    options.onProgress?.(step + 1, total);

    const page = pages[indexes[step]!]!;
    const { width: pageWidth, height: pageHeight } = page.getSize();
    const maxWidth = Math.max(40, pageWidth - MARGIN * 2);
    const lines = layoutLines(font, text, fontSize, maxWidth);
    const { width: blockWidth, height: blockHeight } = blockSize(
      font,
      lines,
      fontSize,
    );
    const { x, y } = positionBlock(
      position,
      pageWidth,
      pageHeight,
      Math.min(blockWidth, maxWidth),
      blockHeight,
    );

    try {
      drawTextBlock(
        page,
        font,
        lines,
        x,
        y,
        fontSize,
        color,
        opacity,
        rotation,
        align,
        Math.min(blockWidth, maxWidth),
      );
    } catch {
      throw new Error(
        "Could not draw this text with the selected font. Try simpler characters or another font.",
      );
    }
  }

  assertNotAborted(options.signal);

  const pdfBytes = await pdf.save({ useObjectStreams: true });
  const output = new Uint8Array(pdfBytes);
  const blob = new Blob([output], { type: "application/pdf" });

  return {
    blob,
    pageCount: pages.length,
    stampedPages: indexes.length,
    outputSize: blob.size,
  };
}

export function downloadTextPdf(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "document";
  downloadBlob(blob, `${base}-with-text.pdf`);
}

export function describeTextResult(
  stampedPages: number,
  pageCount: number,
  outputSize: number,
): string {
  const stamped =
    stampedPages === 1 ? "1 page stamped" : `${stampedPages} pages stamped`;
  const total = pageCount === 1 ? "1 page" : `${pageCount} pages`;
  return `${stamped} · ${total} · ${formatFileSize(outputSize)}`;
}

export {
  DEFAULT_FONT_SIZE,
  DEFAULT_OPACITY,
  MAX_FONT_SIZE,
  MAX_TEXT_LENGTH,
  MIN_FONT_SIZE,
};
