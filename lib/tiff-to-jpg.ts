import JSZip from "jszip";
import * as UTIF from "utif";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/image";

export const ACCEPTED_TIFF_TYPES = ["image/tiff", "image/tif"] as const;

export const MAX_TIFF_FILES = 20;
export const MAX_TIFF_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;
export const MAX_TIFF_TOTAL_BYTES = 80 * 1024 * 1024;
export const MAX_TIFF_PAGES = 100;

export type TiffJpgQuality = 0.7 | 0.85 | 0.92;

export type ConvertedTiffImage = {
  id: string;
  sourceName: string;
  pageNumber: number;
  pageCount: number;
  blob: Blob;
  url: string;
  outputSize: number;
  originalSize: number;
  width: number;
  height: number;
};

export type TiffToJpgResult = {
  images: ConvertedTiffImage[];
  quality: TiffJpgQuality;
  fileCount: number;
  originalSize: number;
  outputSize: number;
};

export type ConvertTiffToJpgOptions = {
  quality?: TiffJpgQuality;
  onProgress?: (current: number, total: number, fileName: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function isAcceptedTiff(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".tif") || name.endsWith(".tiff")) {
    return true;
  }
  return ACCEPTED_TIFF_TYPES.includes(
    file.type as (typeof ACCEPTED_TIFF_TYPES)[number],
  );
}

export function validateTiffFile(file: File): string | null {
  if (!isAcceptedTiff(file)) {
    return "Please upload a TIFF image (.tif or .tiff).";
  }

  if (file.size > MAX_TIFF_SIZE_BYTES) {
    return `Each TIFF must be ${formatFileSize(MAX_TIFF_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export function validateTiffAddition(
  incoming: File[],
  existing: File[],
): string | null {
  if (incoming.length === 0) {
    return "Please upload at least one TIFF image.";
  }

  for (const file of incoming) {
    const singleError = validateTiffFile(file);
    if (singleError) {
      return singleError;
    }
  }

  const nextCount = existing.length + incoming.length;
  if (nextCount > MAX_TIFF_FILES) {
    return `You can convert up to ${MAX_TIFF_FILES} TIFF files at a time.`;
  }

  const existingTotal = existing.reduce((sum, file) => sum + file.size, 0);
  const incomingTotal = incoming.reduce((sum, file) => sum + file.size, 0);
  if (existingTotal + incomingTotal > MAX_TIFF_TOTAL_BYTES) {
    return `Combined TIFF size must be ${formatFileSize(MAX_TIFF_TOTAL_BYTES)} or smaller.`;
  }

  return null;
}

function isRenderableIfd(ifd: UTIF.IFD): boolean {
  const newSubfile = ifd.t254;
  if (Array.isArray(newSubfile) && typeof newSubfile[0] === "number") {
    // Bit 0 = reduced-resolution (thumbnail)
    if ((newSubfile[0] & 1) === 1) {
      return false;
    }
  }

  const oldSubfile = ifd.t255;
  if (Array.isArray(oldSubfile) && oldSubfile[0] === 2) {
    return false;
  }

  return true;
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

async function rgbaToJpegBlob(
  rgba: Uint8Array,
  width: number,
  height: number,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  const source = document.createElement("canvas");
  source.width = width;
  source.height = height;
  const sourceContext = source.getContext("2d");
  if (!sourceContext) {
    throw new Error("Canvas is not supported in this browser.");
  }

  const clamped = new Uint8ClampedArray(rgba.length);
  clamped.set(rgba);
  sourceContext.putImageData(new ImageData(clamped, width, height), 0, 0);

  // White background so transparent TIFF areas don't become black in JPG
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(source, 0, 0);

  return canvasToJpegBlob(canvas, quality);
}

function collectRenderableIfds(buffer: ArrayBuffer, fileName: string): UTIF.IFD[] {
  let ifds: UTIF.IFD[];
  try {
    ifds = UTIF.decode(buffer);
  } catch {
    throw new Error(
      `"${fileName}" could not be read. Try another TIFF (.tif or .tiff).`,
    );
  }

  return ifds.filter(isRenderableIfd);
}

type PreparedTiff = {
  file: File;
  buffer: ArrayBuffer;
  ifds: UTIF.IFD[];
};

function decodeIfdRgba(
  buffer: ArrayBuffer,
  ifd: UTIF.IFD,
): { width: number; height: number; rgba: Uint8Array } | null {
  try {
    UTIF.decodeImage(buffer, ifd);
  } catch {
    return null;
  }

  const width = ifd.width;
  const height = ifd.height;
  if (!width || !height || width < 1 || height < 1) {
    return null;
  }

  let rgba: Uint8Array;
  try {
    rgba = UTIF.toRGBA8(ifd);
  } catch {
    return null;
  }

  if (rgba.length < width * height * 4) {
    return null;
  }

  return { width, height, rgba };
}

async function encodePageJpg(
  file: File,
  decoded: { width: number; height: number; rgba: Uint8Array },
  pageNumber: number,
  pageCount: number,
  quality: TiffJpgQuality,
  signal?: AbortSignal,
): Promise<ConvertedTiffImage> {
  throwIfAborted(signal);

  const blob = await rgbaToJpegBlob(
    decoded.rgba,
    decoded.width,
    decoded.height,
    quality,
  );
  throwIfAborted(signal);

  if (blob.size < 1) {
    throw new Error(
      `"${file.name}" page ${pageNumber} produced an empty JPG. Try another image.`,
    );
  }

  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${pageNumber}-${Math.random().toString(36).slice(2, 9)}`,
    sourceName: file.name,
    pageNumber,
    pageCount,
    blob,
    url: URL.createObjectURL(blob),
    outputSize: blob.size,
    originalSize: file.size,
    width: decoded.width,
    height: decoded.height,
  };
}

export async function convertTiffToJpg(
  files: File[],
  options: ConvertTiffToJpgOptions = {},
): Promise<TiffToJpgResult> {
  if (files.length === 0) {
    throw new Error("Add at least one TIFF image to convert.");
  }

  const additionError = validateTiffAddition(files, []);
  if (additionError) {
    throw new Error(additionError);
  }

  const quality = options.quality ?? 0.85;
  const prepared: PreparedTiff[] = [];
  let totalPages = 0;

  for (const file of files) {
    throwIfAborted(options.signal);
    const buffer = await file.arrayBuffer();
    throwIfAborted(options.signal);
    const ifds = collectRenderableIfds(buffer, file.name);
    if (ifds.length === 0) {
      throw new Error(
        `"${file.name}" has no readable image pages. Try another TIFF.`,
      );
    }
    totalPages += ifds.length;
    if (totalPages > MAX_TIFF_PAGES) {
      throw new Error(
        `You can convert up to ${MAX_TIFF_PAGES} TIFF pages at a time.`,
      );
    }
    prepared.push({ file, buffer, ifds });
  }

  const images: ConvertedTiffImage[] = [];
  let current = 0;

  try {
    for (const { file, buffer, ifds } of prepared) {
      const startIndex = images.length;

      for (let index = 0; index < ifds.length; index += 1) {
        throwIfAborted(options.signal);
        current += 1;
        const label =
          ifds.length > 1
            ? `${file.name} (page ${index + 1})`
            : file.name;
        options.onProgress?.(current, totalPages, label);

        const decoded = decodeIfdRgba(buffer, ifds[index]);
        if (!decoded) {
          continue;
        }

        images.push(
          await encodePageJpg(
            file,
            decoded,
            images.length - startIndex + 1,
            ifds.length,
            quality,
            options.signal,
          ),
        );
      }

      if (images.length === startIndex) {
        throw new Error(
          `"${file.name}" has no readable image pages. Try another TIFF.`,
        );
      }

      const pageCount = images.length - startIndex;
      for (let i = startIndex; i < images.length; i += 1) {
        images[i].pageCount = pageCount;
      }
    }
  } catch (err) {
    revokeTiffToJpgResult({
      images,
      quality,
      fileCount: files.length,
      originalSize: 0,
      outputSize: 0,
    });
    throw err;
  }

  throwIfAborted(options.signal);

  const originalSize = files.reduce((sum, file) => sum + file.size, 0);
  const outputSize = images.reduce((sum, image) => sum + image.outputSize, 0);

  return {
    images,
    quality,
    fileCount: files.length,
    originalSize,
    outputSize,
  };
}

export function revokeTiffToJpgResult(result: TiffToJpgResult | null) {
  if (!result) return;
  for (const image of result.images) {
    URL.revokeObjectURL(image.url);
  }
}

export function jpgFileName(image: ConvertedTiffImage): string {
  const base = image.sourceName.replace(/\.[^.]+$/, "") || "image";
  if (image.pageCount <= 1) {
    return `${base}.jpg`;
  }
  return `${base}-page-${image.pageNumber}.jpg`;
}

export function downloadConvertedJpg(image: ConvertedTiffImage) {
  downloadBlob(image.blob, jpgFileName(image));
}

export async function downloadTiffJpgResult(
  result: TiffToJpgResult,
  sourceFiles: File[],
) {
  if (result.images.length === 1) {
    downloadConvertedJpg(result.images[0]);
    return;
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const image of result.images) {
    let name = jpgFileName(image);
    if (usedNames.has(name)) {
      const base = name.replace(/\.jpg$/i, "");
      let suffix = 2;
      while (usedNames.has(`${base}-${suffix}.jpg`)) {
        suffix += 1;
      }
      name = `${base}-${suffix}.jpg`;
    }
    usedNames.add(name);
    zip.file(name, image.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const base =
    sourceFiles.length > 0 ? fileBaseName(sourceFiles[0]) || "tiff" : "tiff";
  downloadBlob(zipBlob, `${base}-jpg.zip`);
}

export function describeTiffJpgOutput(result: TiffToJpgResult): string {
  const count =
    result.images.length === 1 ? "1 JPG" : `${result.images.length} JPGs`;
  return `${count} · ${formatFileSize(result.outputSize)}`;
}

export function qualityLabel(quality: TiffJpgQuality): string {
  switch (quality) {
    case 0.7:
      return "Smaller file";
    case 0.92:
      return "High quality";
    default:
      return "Balanced";
  }
}
