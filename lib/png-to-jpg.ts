import JSZip from "jszip";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/image";

export const ACCEPTED_PNG_TYPES = ["image/png"] as const;

export const MAX_PNG_FILES = 20;
export const MAX_PNG_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;
export const MAX_PNG_TOTAL_BYTES = 80 * 1024 * 1024;

export type PngJpgQuality = 0.7 | 0.85 | 0.92;

export type ConvertedPngImage = {
  id: string;
  sourceName: string;
  blob: Blob;
  url: string;
  outputSize: number;
  originalSize: number;
  width: number;
  height: number;
};

export type PngToJpgResult = {
  images: ConvertedPngImage[];
  quality: PngJpgQuality;
  originalSize: number;
  outputSize: number;
};

export type ConvertPngToJpgOptions = {
  quality?: PngJpgQuality;
  onProgress?: (current: number, total: number, fileName: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function isAcceptedPng(file: File): boolean {
  if (file.name.toLowerCase().endsWith(".png")) {
    return true;
  }
  return ACCEPTED_PNG_TYPES.includes(
    file.type as (typeof ACCEPTED_PNG_TYPES)[number],
  );
}

export function validatePngFile(file: File): string | null {
  if (!isAcceptedPng(file)) {
    return "Please upload a PNG image (.png).";
  }

  if (file.size > MAX_PNG_SIZE_BYTES) {
    return `Each PNG must be ${formatFileSize(MAX_PNG_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export function validatePngAddition(
  incoming: File[],
  existing: File[],
): string | null {
  if (incoming.length === 0) {
    return "Please upload at least one PNG image.";
  }

  for (const file of incoming) {
    const singleError = validatePngFile(file);
    if (singleError) {
      return singleError;
    }
  }

  const nextCount = existing.length + incoming.length;
  if (nextCount > MAX_PNG_FILES) {
    return `You can convert up to ${MAX_PNG_FILES} PNG files at a time.`;
  }

  const existingTotal = existing.reduce((sum, file) => sum + file.size, 0);
  const incomingTotal = incoming.reduce((sum, file) => sum + file.size, 0);
  if (existingTotal + incomingTotal > MAX_PNG_TOTAL_BYTES) {
    return `Combined PNG size must be ${formatFileSize(MAX_PNG_TOTAL_BYTES)} or smaller.`;
  }

  return null;
}

function jpgFileName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.jpg`;
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

async function convertSinglePng(
  file: File,
  quality: PngJpgQuality,
  signal?: AbortSignal,
): Promise<ConvertedPngImage> {
  throwIfAborted(signal);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      `"${file.name}" could not be read. Try another PNG image.`,
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
    // White background so transparent PNG areas don't become black in JPG
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0);

    const blob = await canvasToJpegBlob(canvas, quality);
    throwIfAborted(signal);

    if (blob.size < 1) {
      throw new Error(
        `"${file.name}" produced an empty JPG. Try another image.`,
      );
    }

    return {
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
      sourceName: file.name,
      blob,
      url: URL.createObjectURL(blob),
      outputSize: blob.size,
      originalSize: file.size,
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    bitmap.close();
  }
}

export async function convertPngToJpg(
  files: File[],
  options: ConvertPngToJpgOptions = {},
): Promise<PngToJpgResult> {
  if (files.length === 0) {
    throw new Error("Add at least one PNG image to convert.");
  }

  const additionError = validatePngAddition(files, []);
  if (additionError) {
    throw new Error(additionError);
  }

  const quality = options.quality ?? 0.85;
  const images: ConvertedPngImage[] = [];

  for (let index = 0; index < files.length; index += 1) {
    throwIfAborted(options.signal);
    const file = files[index];
    options.onProgress?.(index + 1, files.length, file.name);

    try {
      const converted = await convertSinglePng(file, quality, options.signal);
      images.push(converted);
    } catch (err) {
      revokePngToJpgResult({ images, quality, originalSize: 0, outputSize: 0 });
      throw err;
    }
  }

  throwIfAborted(options.signal);

  const originalSize = files.reduce((sum, file) => sum + file.size, 0);
  const outputSize = images.reduce((sum, image) => sum + image.outputSize, 0);

  return {
    images,
    quality,
    originalSize,
    outputSize,
  };
}

export function revokePngToJpgResult(result: PngToJpgResult | null) {
  if (!result) return;
  for (const image of result.images) {
    URL.revokeObjectURL(image.url);
  }
}

export function downloadConvertedJpg(image: ConvertedPngImage) {
  downloadBlob(image.blob, jpgFileName(image.sourceName));
}

export async function downloadPngJpgResult(
  result: PngToJpgResult,
  sourceFiles: File[],
) {
  if (result.images.length === 1) {
    downloadConvertedJpg(result.images[0]);
    return;
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const image of result.images) {
    let name = jpgFileName(image.sourceName);
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
    sourceFiles.length > 0
      ? fileBaseName(sourceFiles[0]) || "png"
      : "png";
  downloadBlob(zipBlob, `${base}-jpg.zip`);
}

export function describePngJpgOutput(result: PngToJpgResult): string {
  const count =
    result.images.length === 1
      ? "1 JPG"
      : `${result.images.length} JPGs`;
  return `${count} · ${formatFileSize(result.outputSize)}`;
}

export function qualityLabel(quality: PngJpgQuality): string {
  switch (quality) {
    case 0.7:
      return "Smaller file";
    case 0.92:
      return "High quality";
    default:
      return "Balanced";
  }
}
