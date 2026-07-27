import { PDFDocument } from "pdf-lib";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_PAGES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export type CompressLevel = "extreme" | "strong" | "balanced" | "light";

export type CompressPreset = {
  level: CompressLevel;
  label: string;
  hint: string;
  scale: number;
  quality: number;
};

export const COMPRESS_PRESETS: CompressPreset[] = [
  {
    level: "extreme",
    label: "Extreme",
    hint: "Smallest file",
    scale: 1,
    quality: 0.45,
  },
  {
    level: "strong",
    label: "Strong",
    hint: "High savings",
    scale: 1.25,
    quality: 0.6,
  },
  {
    level: "balanced",
    label: "Balanced",
    hint: "Good default",
    scale: 1.5,
    quality: 0.72,
  },
  {
    level: "light",
    label: "Light",
    hint: "Best quality",
    scale: 2,
    quality: 0.85,
  },
];

export type CompressPdfResult = {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  pageCount: number;
  savingsPercent: number;
};

export type CompressPdfOptions = {
  level?: CompressLevel;
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

let workerConfigured = false;

function ensurePdfWorker() {
  if (workerConfigured || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerConfigured = true;
}

function getPreset(level: CompressLevel): CompressPreset {
  return (
    COMPRESS_PRESETS.find((preset) => preset.level === level) ??
    COMPRESS_PRESETS[2]
  );
}

function canvasToJpegBytes(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Could not encode JPEG."));
          return;
        }
        const buffer = await blob.arrayBuffer();
        resolve(new Uint8Array(buffer));
      },
      "image/jpeg",
      quality,
    );
  });
}

export async function compressPdfFile(
  file: File,
  options: CompressPdfOptions = {},
): Promise<CompressPdfResult> {
  ensurePdfWorker();

  const validationError = validatePdfFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const preset = getPreset(options.level ?? "balanced");
  const data = new Uint8Array(await file.arrayBuffer());

  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;

  if (options.signal?.aborted) {
    await loadingTask.destroy();
    throw new DOMException("Compression cancelled.", "AbortError");
  }

  if (pdf.numPages > MAX_PDF_PAGES) {
    await loadingTask.destroy();
    throw new Error(
      `This PDF has ${pdf.numPages} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
    );
  }

  const pageCount = pdf.numPages;
  const output = await PDFDocument.create();

  try {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      if (options.signal?.aborted) {
        throw new DOMException("Compression cancelled.", "AbortError");
      }

      options.onProgress?.(pageNumber, pageCount);

      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: preset.scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas is not supported in this browser.");
      }

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise;

      const jpegBytes = await canvasToJpegBytes(canvas, preset.quality);
      const jpgImage = await output.embedJpg(jpegBytes);
      const pdfPage = output.addPage([baseViewport.width, baseViewport.height]);
      pdfPage.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: baseViewport.width,
        height: baseViewport.height,
      });

      page.cleanup();
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    await loadingTask.destroy();
  }

  if (options.signal?.aborted) {
    throw new DOMException("Compression cancelled.", "AbortError");
  }

  const pdfBytes = await output.save({ useObjectStreams: true });
  const bytes = new Uint8Array(pdfBytes);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const originalSize = file.size;
  const compressedSize = blob.size;
  const savingsPercent =
    originalSize > 0
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : 0;

  return {
    blob,
    originalSize,
    compressedSize,
    pageCount,
    savingsPercent,
  };
}

export function downloadCompressedPdf(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "document";
  downloadBlob(blob, `${base}-compressed.pdf`);
}

export function describeSavings(
  originalSize: number,
  compressedSize: number,
  savingsPercent: number,
): string {
  if (compressedSize < originalSize) {
    return `Reduced ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${savingsPercent}% smaller)`;
  }
  if (compressedSize === originalSize) {
    return `Size unchanged at ${formatFileSize(compressedSize)}`;
  }
  return `Result is ${formatFileSize(compressedSize)} (original ${formatFileSize(originalSize)}). Try a stronger level for scanned or image-heavy PDFs.`;
}
