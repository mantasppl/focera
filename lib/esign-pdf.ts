import { PDFDocument, degrees, type PDFImage, type PDFPage } from "pdf-lib";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  validateImageFile,
} from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_PAGES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export type SignaturePosition =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type SignaturePositionOption = {
  value: SignaturePosition;
  label: string;
  hint: string;
};

export const SIGNATURE_POSITIONS: SignaturePositionOption[] = [
  { value: "bottom-right", label: "Bottom right", hint: "Common for contracts" },
  { value: "bottom-left", label: "Bottom left", hint: "Corner stamp" },
  { value: "center", label: "Center", hint: "Middle of page" },
  { value: "top-right", label: "Top right", hint: "Corner stamp" },
  { value: "top-left", label: "Top left", hint: "Corner stamp" },
];

export type SignaturePageTarget = "all" | "first" | "last";

export type SignaturePageTargetOption = {
  value: SignaturePageTarget;
  label: string;
  hint: string;
};

export const SIGNATURE_PAGE_TARGETS: SignaturePageTargetOption[] = [
  { value: "last", label: "Last page", hint: "Signature page" },
  { value: "first", label: "First page", hint: "Cover only" },
  { value: "all", label: "All pages", hint: "Every page" },
];

export type SignatureFontId =
  | "great-vibes"
  | "dancing-script"
  | "pacifico"
  | "allura"
  | "sacramento";

export type SignatureFontOption = {
  id: SignatureFontId;
  label: string;
  family: string;
};

export const SIGNATURE_FONTS: SignatureFontOption[] = [
  { id: "great-vibes", label: "Great Vibes", family: "Great Vibes" },
  { id: "dancing-script", label: "Dancing Script", family: "Dancing Script" },
  { id: "pacifico", label: "Pacifico", family: "Pacifico" },
  { id: "allura", label: "Allura", family: "Allura" },
  { id: "sacramento", label: "Sacramento", family: "Sacramento" },
];

/** Google Fonts stylesheet for typed signature styles. */
export const SIGNATURE_FONTS_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Allura&family=Dancing+Script:wght@600&family=Great+Vibes&family=Pacifico&family=Sacramento&display=swap";

export type EsignPdfResult = {
  blob: Blob;
  pageCount: number;
  signedPageCount: number;
  outputSize: number;
};

export type EsignPdfOptions = {
  position?: SignaturePosition;
  pageTarget?: SignaturePageTarget;
  /** Stamp width as a fraction of page width (0.05–0.8). */
  scale?: number;
  /** 0–1 */
  opacity?: number;
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

const MARGIN = 36;
const MIN_SCALE = 0.08;
const MAX_SCALE = 0.7;
const DEFAULT_SCALE = 0.28;
const DEFAULT_OPACITY = 1;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Signing cancelled.", "AbortError");
  }
}

async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Could not render the signature image."));
          return;
        }
        resolve(result);
      },
      "image/png",
    );
  });
  return new Uint8Array(await blob.arrayBuffer());
}

export function getSignatureFont(id: SignatureFontId): SignatureFontOption {
  return (
    SIGNATURE_FONTS.find((font) => font.id === id) ?? SIGNATURE_FONTS[0]
  );
}

/** Ensure signature script fonts are loaded before measuring/drawing text. */
export async function ensureSignatureFontsLoaded(
  family?: string,
): Promise<void> {
  if (typeof document === "undefined") return;

  const families = family
    ? [family]
    : SIGNATURE_FONTS.map((font) => font.family);

  await Promise.all(
    families.map((name) => document.fonts.load(`72px "${name}"`)),
  );
  await document.fonts.ready;
}

export async function renderTypedSignaturePng(
  text: string,
  fontFamily: string,
  color = "#1a1a2e",
): Promise<Uint8Array> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Enter a name to create a typed signature.");
  }
  if (trimmed.length > 80) {
    throw new Error("Typed signatures can be up to 80 characters.");
  }

  await ensureSignatureFontsLoaded(fontFamily);

  const fontSize = 96;
  const paddingX = 40;
  const paddingY = 28;

  const measure = document.createElement("canvas");
  const measureCtx = measure.getContext("2d");
  if (!measureCtx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  measureCtx.font = `${fontSize}px "${fontFamily}", cursive`;
  const metrics = measureCtx.measureText(trimmed);
  const textWidth = Math.max(1, Math.ceil(metrics.width));
  const ascent =
    metrics.actualBoundingBoxAscent || fontSize * 0.8;
  const descent =
    metrics.actualBoundingBoxDescent || fontSize * 0.35;
  const textHeight = Math.ceil(ascent + descent);

  const canvas = document.createElement("canvas");
  canvas.width = textWidth + paddingX * 2;
  canvas.height = textHeight + paddingY * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px "${fontFamily}", cursive`;
  ctx.fillStyle = color;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(trimmed, paddingX, paddingY + ascent);

  return canvasToPngBytes(canvas);
}

export async function renderDrawnSignaturePng(
  canvas: HTMLCanvasElement,
): Promise<Uint8Array> {
  // Trim transparent margins so the stamp sits tightly on the page.
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  const { width, height } = canvas;
  if (width < 2 || height < 2) {
    throw new Error("Draw your signature before applying it.");
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 16) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0 || maxY < 0) {
    throw new Error("Draw your signature before applying it.");
  }

  const pad = 8;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width, maxX + pad + 1) - cropX;
  const cropH = Math.min(height, maxY + pad + 1) - cropY;

  const trimmed = document.createElement("canvas");
  trimmed.width = Math.max(1, cropW);
  trimmed.height = Math.max(1, cropH);
  const trimmedCtx = trimmed.getContext("2d");
  if (!trimmedCtx) {
    throw new Error("Canvas is not supported in this browser.");
  }
  trimmedCtx.drawImage(
    canvas,
    cropX,
    cropY,
    cropW,
    cropH,
    0,
    0,
    cropW,
    cropH,
  );

  return canvasToPngBytes(trimmed);
}

export async function imageFileToPngBytes(file: File): Promise<Uint8Array> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  if (file.type === "image/png") {
    return new Uint8Array(await file.arrayBuffer());
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
    return canvasToPngBytes(canvas);
  } finally {
    bitmap.close();
  }
}

function stampSize(
  pageWidth: number,
  imageWidth: number,
  imageHeight: number,
  scale: number,
): { width: number; height: number } {
  const width = pageWidth * scale;
  const height = width * (imageHeight / imageWidth);
  return { width, height };
}

function positionStamp(
  position: SignaturePosition,
  pageWidth: number,
  pageHeight: number,
  stampWidth: number,
  stampHeight: number,
): { x: number; y: number } {
  switch (position) {
    case "top-left":
      return { x: MARGIN, y: pageHeight - stampHeight - MARGIN };
    case "top-right":
      return {
        x: pageWidth - stampWidth - MARGIN,
        y: pageHeight - stampHeight - MARGIN,
      };
    case "bottom-left":
      return { x: MARGIN, y: MARGIN };
    case "center":
      return {
        x: (pageWidth - stampWidth) / 2,
        y: (pageHeight - stampHeight) / 2,
      };
    case "bottom-right":
    default:
      return { x: pageWidth - stampWidth - MARGIN, y: MARGIN };
  }
}

function resolvePageIndexes(
  pageCount: number,
  target: SignaturePageTarget,
): number[] {
  if (pageCount < 1) return [];
  if (target === "first") return [0];
  if (target === "last") return [pageCount - 1];
  return Array.from({ length: pageCount }, (_, index) => index);
}

function drawStamp(
  page: PDFPage,
  image: PDFImage,
  x: number,
  y: number,
  width: number,
  height: number,
  opacity: number,
) {
  page.drawImage(image, {
    x,
    y,
    width,
    height,
    opacity,
    rotate: degrees(0),
  });
}

export async function signPdf(
  pdfFile: File,
  signaturePng: Uint8Array,
  options: EsignPdfOptions = {},
): Promise<EsignPdfResult> {
  const pdfError = validatePdfFile(pdfFile);
  if (pdfError) throw new Error(pdfError);

  if (!signaturePng.byteLength) {
    throw new Error("Create or upload a signature before signing.");
  }

  assertNotAborted(options.signal);

  const position = options.position ?? "bottom-right";
  const pageTarget = options.pageTarget ?? "last";
  const scale = clamp(options.scale ?? DEFAULT_SCALE, MIN_SCALE, MAX_SCALE);
  const opacity = clamp(options.opacity ?? DEFAULT_OPACITY, 0.15, 1);

  options.onProgress?.(0, 1);

  const pdf = await PDFDocument.load(await pdfFile.arrayBuffer());
  const pages = pdf.getPages();

  if (pages.length > MAX_PDF_PAGES) {
    throw new Error(
      `This PDF has ${pages.length} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
    );
  }

  assertNotAborted(options.signal);

  const image = await pdf.embedPng(signaturePng);
  const indexes = resolvePageIndexes(pages.length, pageTarget);
  const total = Math.max(1, indexes.length);

  for (let step = 0; step < indexes.length; step += 1) {
    assertNotAborted(options.signal);
    options.onProgress?.(step + 1, total);

    const page = pages[indexes[step]];
    const { width: pageWidth, height: pageHeight } = page.getSize();
    const { width: stampWidth, height: stampHeight } = stampSize(
      pageWidth,
      image.width,
      image.height,
      scale,
    );
    const { x, y } = positionStamp(
      position,
      pageWidth,
      pageHeight,
      stampWidth,
      stampHeight,
    );
    drawStamp(page, image, x, y, stampWidth, stampHeight, opacity);
  }

  assertNotAborted(options.signal);

  const pdfBytes = await pdf.save({ useObjectStreams: true });
  const output = new Uint8Array(pdfBytes);
  const blob = new Blob([output], { type: "application/pdf" });

  return {
    blob,
    pageCount: pages.length,
    signedPageCount: indexes.length,
    outputSize: blob.size,
  };
}

export function downloadSignedPdf(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "document";
  downloadBlob(blob, `${base}-signed.pdf`);
}

export function describeSignedResult(
  signedPageCount: number,
  pageCount: number,
  outputSize: number,
): string {
  const signed =
    signedPageCount === 1 ? "1 signed page" : `${signedPageCount} signed pages`;
  const total = pageCount === 1 ? "1 page" : `${pageCount} pages`;
  return `${signed} · ${total} · ${formatFileSize(outputSize)}`;
}

export function esignPdfLimitsHint() {
  return `PDF · up to ${formatFileSize(MAX_PDF_SIZE_BYTES)} · max ${MAX_PDF_PAGES} pages`;
}

export {
  DEFAULT_OPACITY,
  DEFAULT_SCALE,
  MAX_SCALE,
  MIN_SCALE,
};
