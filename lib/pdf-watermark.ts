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

export type WatermarkPosition =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "tiled";

export type WatermarkPositionOption = {
  value: WatermarkPosition;
  label: string;
  hint: string;
};

export const WATERMARK_POSITIONS: WatermarkPositionOption[] = [
  { value: "center", label: "Center", hint: "Middle of page" },
  { value: "top-left", label: "Top left", hint: "Corner stamp" },
  { value: "top-right", label: "Top right", hint: "Corner stamp" },
  { value: "bottom-left", label: "Bottom left", hint: "Corner stamp" },
  { value: "bottom-right", label: "Bottom right", hint: "Corner stamp" },
  { value: "tiled", label: "Tiled", hint: "Repeat across page" },
];

export type WatermarkRotation = 0 | 45 | -45;

export type WatermarkRotationOption = {
  value: WatermarkRotation;
  label: string;
  hint: string;
};

export const WATERMARK_ROTATIONS: WatermarkRotationOption[] = [
  { value: 0, label: "None", hint: "Upright" },
  { value: 45, label: "45°", hint: "Diagonal" },
  { value: -45, label: "-45°", hint: "Diagonal" },
];

export type PdfWatermarkResult = {
  blob: Blob;
  pageCount: number;
  outputSize: number;
};

export type PdfWatermarkOptions = {
  position?: WatermarkPosition;
  /** Stamp width as a fraction of page width (0.05–1). */
  scale?: number;
  /** 0–1 */
  opacity?: number;
  rotation?: WatermarkRotation;
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

const MARGIN = 24;
const MIN_SCALE = 0.05;
const MAX_SCALE = 1;
const DEFAULT_SCALE = 0.35;
const DEFAULT_OPACITY = 0.35;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

async function fileToPngOrJpg(file: File): Promise<{
  bytes: Uint8Array;
  kind: "png" | "jpg";
}> {
  if (file.type === "image/png") {
    return {
      bytes: new Uint8Array(await file.arrayBuffer()),
      kind: "png",
    };
  }

  if (file.type === "image/jpeg") {
    return {
      bytes: new Uint8Array(await file.arrayBuffer()),
      kind: "jpg",
    };
  }

  // WebP (and any other accepted type) → PNG via canvas for pdf-lib.
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
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("Could not convert image for the PDF stamp."));
            return;
          }
          resolve(result);
        },
        "image/png",
      );
    });

    return {
      bytes: new Uint8Array(await blob.arrayBuffer()),
      kind: "png",
    };
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
  position: WatermarkPosition,
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
    case "bottom-right":
      return { x: pageWidth - stampWidth - MARGIN, y: MARGIN };
    case "center":
    case "tiled":
    default:
      return {
        x: (pageWidth - stampWidth) / 2,
        y: (pageHeight - stampHeight) / 2,
      };
  }
}

function drawStamp(
  page: PDFPage,
  image: PDFImage,
  x: number,
  y: number,
  width: number,
  height: number,
  opacity: number,
  rotation: WatermarkRotation,
) {
  page.drawImage(image, {
    x,
    y,
    width,
    height,
    opacity,
    rotate: degrees(rotation),
  });
}

function drawTiledStamp(
  page: PDFPage,
  image: PDFImage,
  pageWidth: number,
  pageHeight: number,
  stampWidth: number,
  stampHeight: number,
  opacity: number,
  rotation: WatermarkRotation,
) {
  const gapX = stampWidth * 1.35;
  const gapY = stampHeight * 1.55;
  const startX = -stampWidth * 0.25;
  const startY = -stampHeight * 0.25;

  for (let y = startY; y < pageHeight + stampHeight; y += gapY) {
    for (let x = startX; x < pageWidth + stampWidth; x += gapX) {
      drawStamp(page, image, x, y, stampWidth, stampHeight, opacity, rotation);
    }
  }
}

export async function addWatermarkToPdf(
  pdfFile: File,
  imageFile: File,
  options: PdfWatermarkOptions = {},
): Promise<PdfWatermarkResult> {
  const pdfError = validatePdfFile(pdfFile);
  if (pdfError) throw new Error(pdfError);

  const imageError = validateImageFile(imageFile);
  if (imageError) throw new Error(imageError);

  if (options.signal?.aborted) {
    throw new DOMException("Watermark cancelled.", "AbortError");
  }

  const position = options.position ?? "center";
  const scale = clamp(options.scale ?? DEFAULT_SCALE, MIN_SCALE, MAX_SCALE);
  const opacity = clamp(options.opacity ?? DEFAULT_OPACITY, 0.05, 1);
  const rotation = options.rotation ?? 0;

  options.onProgress?.(0, 1);

  const pdf = await PDFDocument.load(await pdfFile.arrayBuffer());
  const pages = pdf.getPages();

  if (pages.length > MAX_PDF_PAGES) {
    throw new Error(
      `This PDF has ${pages.length} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
    );
  }

  if (options.signal?.aborted) {
    throw new DOMException("Watermark cancelled.", "AbortError");
  }

  const { bytes, kind } = await fileToPngOrJpg(imageFile);
  const image =
    kind === "png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);

  const pageCount = pages.length;

  for (let index = 0; index < pageCount; index += 1) {
    if (options.signal?.aborted) {
      throw new DOMException("Watermark cancelled.", "AbortError");
    }

    options.onProgress?.(index + 1, pageCount);

    const page = pages[index];
    const { width: pageWidth, height: pageHeight } = page.getSize();
    const { width: stampWidth, height: stampHeight } = stampSize(
      pageWidth,
      image.width,
      image.height,
      scale,
    );

    if (position === "tiled") {
      drawTiledStamp(
        page,
        image,
        pageWidth,
        pageHeight,
        stampWidth,
        stampHeight,
        opacity,
        rotation,
      );
      continue;
    }

    const { x, y } = positionStamp(
      position,
      pageWidth,
      pageHeight,
      stampWidth,
      stampHeight,
    );
    drawStamp(page, image, x, y, stampWidth, stampHeight, opacity, rotation);
  }

  if (options.signal?.aborted) {
    throw new DOMException("Watermark cancelled.", "AbortError");
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

export function downloadWatermarkedPdf(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "document";
  downloadBlob(blob, `${base}-watermarked.pdf`);
}

export function describeWatermarkResult(
  pageCount: number,
  outputSize: number,
): string {
  const pages = pageCount === 1 ? "1 page" : `${pageCount} pages`;
  return `${pages} · ${formatFileSize(outputSize)}`;
}

export { DEFAULT_OPACITY, DEFAULT_SCALE, MAX_SCALE, MIN_SCALE };
