import {
  getDocument,
  GlobalWorkerOptions,
  ImageKind,
  OPS,
} from "pdfjs-dist";
import JSZip from "jszip";
import { downloadBlob, formatFileSize } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_PAGES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export const MAX_EXTRACT_IMAGES_PAGES = MAX_PDF_PAGES;
export const MAX_EXTRACTED_IMAGES = 200;

export type ExtractedImage = {
  id: string;
  /** 1-based index in the extraction result. */
  index: number;
  pageNumber: number;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  format: "png";
};

export type ExtractImagesOptions = {
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

type PdfImageRef = {
  width: number;
  height: number;
  kind?: number;
  data?: Uint8ClampedArray | Uint8Array;
  bitmap?: ImageBitmap;
};

let workerConfigured = false;

function ensurePdfWorker() {
  if (workerConfigured || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerConfigured = true;
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Extraction cancelled.", "AbortError");
  }
}

export function extractImagesFromPdfLimitsHint() {
  return `PDF · up to ${formatFileSize(MAX_PDF_SIZE_BYTES)} · max ${MAX_EXTRACT_IMAGES_PAGES} pages`;
}

function getPdfObject(
  store: { get: (id: string, callback?: (data: unknown) => void) => unknown; has: (id: string) => boolean },
  objId: string,
): Promise<PdfImageRef | null> {
  return new Promise((resolve, reject) => {
    try {
      if (!store.has(objId)) {
        resolve(null);
        return;
      }

      store.get(objId, (data) => {
        resolve((data as PdfImageRef) ?? null);
      });
    } catch (err) {
      reject(err);
    }
  });
}

function toRgba(
  width: number,
  height: number,
  kind: number | undefined,
  data: Uint8ClampedArray | Uint8Array,
): Uint8ClampedArray {
  const pixelCount = width * height;
  const rgba = new Uint8ClampedArray(pixelCount * 4);

  if (kind === ImageKind.RGBA_32BPP || data.length === pixelCount * 4) {
    rgba.set(data);
    return rgba;
  }

  if (kind === ImageKind.RGB_24BPP || data.length === pixelCount * 3) {
    let src = 0;
    let dst = 0;
    while (src < data.length) {
      rgba[dst++] = data[src++];
      rgba[dst++] = data[src++];
      rgba[dst++] = data[src++];
      rgba[dst++] = 255;
    }
    return rgba;
  }

  if (kind === ImageKind.GRAYSCALE_1BPP) {
    const rowBytes = Math.ceil(width / 8);
    let dst = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const byte = data[y * rowBytes + (x >> 3)] ?? 0;
        const bit = (byte >> (7 - (x & 7))) & 1;
        const value = bit ? 255 : 0;
        rgba[dst++] = value;
        rgba[dst++] = value;
        rgba[dst++] = value;
        rgba[dst++] = 255;
      }
    }
    return rgba;
  }

  throw new Error("Unsupported embedded image format.");
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("Could not encode PNG."));
    }, "image/png");
  });
}

async function imageRefToPngBlob(img: PdfImageRef): Promise<{
  blob: Blob;
  width: number;
  height: number;
}> {
  const width = Math.floor(img.width);
  const height = Math.floor(img.height);

  if (!width || !height) {
    throw new Error("Invalid image dimensions.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  if (img.bitmap) {
    context.drawImage(img.bitmap, 0, 0);
  } else if (img.data) {
    const rgba = toRgba(width, height, img.kind, img.data);
    const imageData = context.createImageData(width, height);
    imageData.data.set(rgba);
    context.putImageData(imageData, 0, 0);
  } else {
    throw new Error("Image data is unavailable.");
  }

  const blob = await canvasToPngBlob(canvas);
  return { blob, width, height };
}

function collectImageRefs(
  fnArray: number[],
  argsArray: unknown[],
): Array<{ kind: "named"; objId: string } | { kind: "inline"; img: PdfImageRef }> {
  const refs: Array<
    { kind: "named"; objId: string } | { kind: "inline"; img: PdfImageRef }
  > = [];
  const seenNames = new Set<string>();

  for (let i = 0; i < fnArray.length; i += 1) {
    const fn = fnArray[i];
    const args = argsArray[i] as unknown[] | undefined;

    if (
      fn === OPS.paintImageXObject ||
      fn === OPS.paintImageXObjectRepeat
    ) {
      const objId = args?.[0];
      if (typeof objId === "string" && !seenNames.has(objId)) {
        seenNames.add(objId);
        refs.push({ kind: "named", objId });
      }
      continue;
    }

    if (fn === OPS.paintInlineImageXObject) {
      const img = args?.[0] as PdfImageRef | undefined;
      if (img && typeof img.width === "number" && typeof img.height === "number") {
        refs.push({ kind: "inline", img });
      }
    }
  }

  return refs;
}

export async function extractImagesFromPdf(
  file: File,
  options: ExtractImagesOptions = {},
): Promise<ExtractedImage[]> {
  ensurePdfWorker();

  const validationError = validatePdfFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const data = new Uint8Array(await file.arrayBuffer());
  assertNotAborted(options.signal);

  // Disable OffscreenCanvas so image pixel buffers stay available for extraction.
  const loadingTask = getDocument({
    data,
    isOffscreenCanvasSupported: false,
  });
  const pdf = await loadingTask.promise;

  if (options.signal?.aborted) {
    await loadingTask.destroy();
    throw new DOMException("Extraction cancelled.", "AbortError");
  }

  if (pdf.numPages > MAX_EXTRACT_IMAGES_PAGES) {
    await loadingTask.destroy();
    throw new Error(
      `This PDF has ${pdf.numPages} pages. Please use a file with ${MAX_EXTRACT_IMAGES_PAGES} pages or fewer.`,
    );
  }

  const images: ExtractedImage[] = [];
  const seenObjectIds = new Set<string>();

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      assertNotAborted(options.signal);
      options.onProgress?.(pageNumber, pdf.numPages);

      const page = await pdf.getPage(pageNumber);
      const operatorList = await page.getOperatorList();
      const refs = collectImageRefs(operatorList.fnArray, operatorList.argsArray);

      for (const ref of refs) {
        assertNotAborted(options.signal);

        if (images.length >= MAX_EXTRACTED_IMAGES) {
          break;
        }

        let img: PdfImageRef | null = null;

        if (ref.kind === "named") {
          if (seenObjectIds.has(ref.objId)) continue;
          seenObjectIds.add(ref.objId);

          const store = ref.objId.startsWith("g_")
            ? page.commonObjs
            : page.objs;
          img = await getPdfObject(store, ref.objId);
        } else {
          img = ref.img;
        }

        if (!img) continue;

        try {
          const { blob, width, height } = await imageRefToPngBlob(img);
          const index = images.length + 1;
          images.push({
            id: `img-${index}-${pageNumber}`,
            index,
            pageNumber,
            blob,
            url: URL.createObjectURL(blob),
            width,
            height,
            format: "png",
          });
        } catch {
          // Skip images that cannot be decoded in this browser.
        }
      }

      page.cleanup();

      if (images.length >= MAX_EXTRACTED_IMAGES) {
        break;
      }
    }
  } finally {
    await loadingTask.destroy();
  }

  if (images.length === 0) {
    throw new Error(
      "No embedded images were found in this PDF. Try PDF to PNG if you need full-page screenshots instead.",
    );
  }

  return images;
}

export function revokeExtractedImages(images: ExtractedImage[]) {
  for (const image of images) {
    URL.revokeObjectURL(image.url);
  }
}

export function downloadExtractedImage(image: ExtractedImage, baseName: string) {
  const safeBase = baseName || "pdf";
  downloadBlob(image.blob, `${safeBase}-image-${image.index}.png`);
}

export async function downloadAllExtractedImagesZip(
  images: ExtractedImage[],
  baseName: string,
) {
  const zip = new JSZip();
  const safeBase = baseName || "pdf";

  for (const image of images) {
    zip.file(`${safeBase}-image-${image.index}.png`, image.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, `${safeBase}-images.zip`);
}
