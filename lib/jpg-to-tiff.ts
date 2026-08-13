import JSZip from "jszip";
import * as UTIF from "utif";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/image";

export const ACCEPTED_JPG_TYPES = ["image/jpeg", "image/jpg"] as const;

export const MAX_JPG_FILES = 20;
export const MAX_JPG_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;
export const MAX_JPG_TOTAL_BYTES = 80 * 1024 * 1024;

export type ConvertedJpgTiffImage = {
  id: string;
  sourceName: string;
  blob: Blob;
  url: string;
  outputSize: number;
  originalSize: number;
  width: number;
  height: number;
};

export type JpgToTiffResult = {
  images: ConvertedJpgTiffImage[];
  originalSize: number;
  outputSize: number;
};

export type ConvertJpgToTiffOptions = {
  onProgress?: (current: number, total: number, fileName: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function isAcceptedJpg(file: File): boolean {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return true;
  }
  return ACCEPTED_JPG_TYPES.includes(
    file.type as (typeof ACCEPTED_JPG_TYPES)[number],
  );
}

export function validateJpgFile(file: File): string | null {
  if (!isAcceptedJpg(file)) {
    return "Please upload a JPG image (.jpg or .jpeg).";
  }

  if (file.size > MAX_JPG_SIZE_BYTES) {
    return `Each JPG must be ${formatFileSize(MAX_JPG_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export function validateJpgAddition(
  incoming: File[],
  existing: File[],
): string | null {
  if (incoming.length === 0) {
    return "Please upload at least one JPG image.";
  }

  for (const file of incoming) {
    const singleError = validateJpgFile(file);
    if (singleError) {
      return singleError;
    }
  }

  const nextCount = existing.length + incoming.length;
  if (nextCount > MAX_JPG_FILES) {
    return `You can convert up to ${MAX_JPG_FILES} JPG files at a time.`;
  }

  const existingTotal = existing.reduce((sum, file) => sum + file.size, 0);
  const incomingTotal = incoming.reduce((sum, file) => sum + file.size, 0);
  if (existingTotal + incomingTotal > MAX_JPG_TOTAL_BYTES) {
    return `Combined JPG size must be ${formatFileSize(MAX_JPG_TOTAL_BYTES)} or smaller.`;
  }

  return null;
}

function tiffFileName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.tiff`;
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

function encodeTiffBlob(rgba: Uint8Array, width: number, height: number): Blob {
  const buffer = UTIF.encodeImage(rgba, width, height);
  return new Blob([new Uint8Array(buffer)], { type: "image/tiff" });
}

async function convertSingleJpg(
  file: File,
  signal?: AbortSignal,
): Promise<ConvertedJpgTiffImage> {
  throwIfAborted(signal);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      `"${file.name}" could not be read. Try another JPG image.`,
    );
  }

  try {
    throwIfAborted(signal);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not supported in this browser.");
    }

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    context.drawImage(bitmap, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const rgba = new Uint8Array(imageData.data);
    const blob = encodeTiffBlob(rgba, canvas.width, canvas.height);
    throwIfAborted(signal);

    if (blob.size < 1) {
      throw new Error(
        `"${file.name}" produced an empty TIFF. Try another image.`,
      );
    }

    const previewBlob = await canvasToPngBlob(canvas);
    throwIfAborted(signal);

    return {
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
      sourceName: file.name,
      blob,
      url: URL.createObjectURL(previewBlob),
      outputSize: blob.size,
      originalSize: file.size,
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    bitmap.close();
  }
}

export async function convertJpgToTiff(
  files: File[],
  options: ConvertJpgToTiffOptions = {},
): Promise<JpgToTiffResult> {
  if (files.length === 0) {
    throw new Error("Add at least one JPG image to convert.");
  }

  const additionError = validateJpgAddition(files, []);
  if (additionError) {
    throw new Error(additionError);
  }

  const images: ConvertedJpgTiffImage[] = [];

  for (let index = 0; index < files.length; index += 1) {
    throwIfAborted(options.signal);
    const file = files[index];
    options.onProgress?.(index + 1, files.length, file.name);

    try {
      const converted = await convertSingleJpg(file, options.signal);
      images.push(converted);
    } catch (err) {
      revokeJpgToTiffResult({ images, originalSize: 0, outputSize: 0 });
      throw err;
    }
  }

  throwIfAborted(options.signal);

  const originalSize = files.reduce((sum, file) => sum + file.size, 0);
  const outputSize = images.reduce((sum, image) => sum + image.outputSize, 0);

  return {
    images,
    originalSize,
    outputSize,
  };
}

export function revokeJpgToTiffResult(result: JpgToTiffResult | null) {
  if (!result) return;
  for (const image of result.images) {
    URL.revokeObjectURL(image.url);
  }
}

export function downloadConvertedTiff(image: ConvertedJpgTiffImage) {
  downloadBlob(image.blob, tiffFileName(image.sourceName));
}

export async function downloadJpgTiffResult(
  result: JpgToTiffResult,
  sourceFiles: File[],
) {
  if (result.images.length === 1) {
    downloadConvertedTiff(result.images[0]);
    return;
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const image of result.images) {
    let name = tiffFileName(image.sourceName);
    if (usedNames.has(name)) {
      const base = name.replace(/\.tiff$/i, "");
      let suffix = 2;
      while (usedNames.has(`${base}-${suffix}.tiff`)) {
        suffix += 1;
      }
      name = `${base}-${suffix}.tiff`;
    }
    usedNames.add(name);
    zip.file(name, image.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const base =
    sourceFiles.length > 0 ? fileBaseName(sourceFiles[0]) || "jpg" : "jpg";
  downloadBlob(zipBlob, `${base}-tiff.zip`);
}

export function describeJpgTiffOutput(result: JpgToTiffResult): string {
  const count =
    result.images.length === 1
      ? "1 TIFF"
      : `${result.images.length} TIFFs`;
  return `${count} · ${formatFileSize(result.outputSize)}`;
}
