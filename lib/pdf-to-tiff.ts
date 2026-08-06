import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import JSZip from "jszip";
import * as UTIF from "utif";
import { downloadBlob, formatFileSize } from "@/lib/image";

export const ACCEPTED_PDF_TYPES = ["application/pdf"] as const;
export const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_PDF_PAGES = 50;

export type PdfScale = 1 | 1.5 | 2;

export type ConvertedTiffPage = {
  pageNumber: number;
  /** TIFF blob for download */
  blob: Blob;
  /** PNG object URL for in-browser preview (TIFF is not widely displayable) */
  url: string;
  width: number;
  height: number;
  rgba: Uint8Array;
};

export type ConvertPdfOptions = {
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

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("Could not encode preview image."));
    }, "image/png");
  });
}

function rgbaFromCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
): Uint8Array {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  return new Uint8Array(imageData.data);
}

function encodeTiffBlob(rgba: Uint8Array, width: number, height: number): Blob {
  const buffer = UTIF.encodeImage(rgba, width, height);
  return new Blob([new Uint8Array(buffer)], { type: "image/tiff" });
}

/**
 * Multipage TIFF: IFDs in a reserved header region, uncompressed RGBA strips after.
 */
export function encodeMultipageTiff(
  pages: { rgba: Uint8Array; width: number; height: number }[],
): ArrayBuffer {
  if (pages.length === 0) {
    throw new Error("No pages to encode.");
  }

  if (pages.length === 1) {
    return UTIF.encodeImage(pages[0].rgba, pages[0].width, pages[0].height);
  }

  const ifdRegionSize = Math.max(2048, pages.length * 320 + 64);
  let stripOffset = ifdRegionSize;

  const ifds = pages.map((page) => {
    const offset = stripOffset;
    stripOffset += page.width * page.height * 4;
    return {
      t256: [page.width],
      t257: [page.height],
      t258: [8, 8, 8, 8],
      t259: [1],
      t262: [2],
      t273: [offset],
      t277: [4],
      t278: [page.height],
      t279: [page.width * page.height * 4],
      t282: [72],
      t283: [72],
      t284: [1],
      t296: [1],
      t305: ["Focera"],
      t338: [1],
    };
  });

  const ifdBytes = new Uint8Array(
    UTIF.encode(ifds as unknown as UTIF.IFD[]),
  );
  if (ifdBytes.length > ifdRegionSize) {
    throw new Error("Could not encode multipage TIFF header.");
  }

  const out = new Uint8Array(stripOffset);
  out.set(ifdBytes, 0);

  let dataOffset = ifdRegionSize;
  for (const page of pages) {
    out.set(page.rgba, dataOffset);
    dataOffset += page.width * page.height * 4;
  }

  return out.buffer;
}

export async function convertPdfToTiffPages(
  file: File,
  options: ConvertPdfOptions = {},
): Promise<ConvertedTiffPage[]> {
  ensurePdfWorker();

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

  const pages: ConvertedTiffPage[] = [];

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

      // White background so transparent PDF areas look correct in TIFF viewers
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise;

      const rgba = rgbaFromCanvas(canvas, context);
      const blob = encodeTiffBlob(rgba, canvas.width, canvas.height);
      const previewBlob = await canvasToPngBlob(canvas);

      pages.push({
        pageNumber,
        blob,
        url: URL.createObjectURL(previewBlob),
        width: canvas.width,
        height: canvas.height,
        rgba,
      });

      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  return pages;
}

export function revokeConvertedPages(pages: ConvertedTiffPage[]) {
  for (const page of pages) {
    URL.revokeObjectURL(page.url);
  }
}

export function downloadPageTiff(page: ConvertedTiffPage, baseName: string) {
  const safeBase = baseName || "page";
  downloadBlob(page.blob, `${safeBase}-page-${page.pageNumber}.tiff`);
}

export function downloadMultipageTiff(
  pages: ConvertedTiffPage[],
  baseName: string,
) {
  const safeBase = baseName || "pdf";
  const buffer = encodeMultipageTiff(pages);
  const blob = new Blob([new Uint8Array(buffer)], { type: "image/tiff" });
  downloadBlob(blob, `${safeBase}.tiff`);
}

export async function downloadAllPagesZip(
  pages: ConvertedTiffPage[],
  baseName: string,
) {
  const zip = new JSZip();
  const safeBase = baseName || "pdf";

  for (const page of pages) {
    zip.file(`${safeBase}-page-${page.pageNumber}.tiff`, page.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, `${safeBase}-tiff.zip`);
}
