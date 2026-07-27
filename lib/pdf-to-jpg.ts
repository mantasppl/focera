import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import JSZip from "jszip";
import { downloadBlob, formatFileSize } from "@/lib/image";

export const ACCEPTED_PDF_TYPES = ["application/pdf"] as const;
export const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_PDF_PAGES = 50;

export type PdfQuality = 0.7 | 0.85 | 0.95;
export type PdfScale = 1 | 1.5 | 2;

export type ConvertedPage = {
  pageNumber: number;
  blob: Blob;
  url: string;
  width: number;
  height: number;
};

export type ConvertPdfOptions = {
  quality?: PdfQuality;
  scale?: PdfScale;
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

let workerConfigured = false;

function ensurePdfWorker() {
  if (workerConfigured || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerConfigured = true;
}

export function validatePdfFile(file: File): string | null {
  const isPdf =
    ACCEPTED_PDF_TYPES.includes(file.type as (typeof ACCEPTED_PDF_TYPES)[number]) ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return "Please upload a PDF file.";
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return `PDF must be ${formatFileSize(MAX_PDF_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Could not encode JPEG."));
      },
      "image/jpeg",
      quality,
    );
  });
}

export async function convertPdfToJpgPages(
  file: File,
  options: ConvertPdfOptions = {},
): Promise<ConvertedPage[]> {
  ensurePdfWorker();

  const quality = options.quality ?? 0.85;
  const scale = options.scale ?? 1.5;
  const data = new Uint8Array(await file.arrayBuffer());

  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;

  if (options.signal?.aborted) {
    await loadingTask.destroy();
    throw new DOMException("Conversion cancelled.", "AbortError");
  }

  if (pdf.numPages > MAX_PDF_PAGES) {
    await loadingTask.destroy();
    throw new Error(
      `This PDF has ${pdf.numPages} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
    );
  }

  const pages: ConvertedPage[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      if (options.signal?.aborted) {
        throw new DOMException("Conversion cancelled.", "AbortError");
      }

      options.onProgress?.(pageNumber, pdf.numPages);

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas is not supported in this browser.");
      }

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      // White background so transparent PDF areas don't become black in JPG
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise;

      const blob = await canvasToJpegBlob(canvas, quality);
      pages.push({
        pageNumber,
        blob,
        url: URL.createObjectURL(blob),
        width: canvas.width,
        height: canvas.height,
      });

      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  return pages;
}

export function revokeConvertedPages(pages: ConvertedPage[]) {
  for (const page of pages) {
    URL.revokeObjectURL(page.url);
  }
}

export function downloadPageJpeg(page: ConvertedPage, baseName: string) {
  const safeBase = baseName || "page";
  downloadBlob(page.blob, `${safeBase}-page-${page.pageNumber}.jpg`);
}

export async function downloadAllPagesZip(
  pages: ConvertedPage[],
  baseName: string,
) {
  const zip = new JSZip();
  const safeBase = baseName || "pdf";

  for (const page of pages) {
    zip.file(`${safeBase}-page-${page.pageNumber}.jpg`, page.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, `${safeBase}-jpg.zip`);
}
