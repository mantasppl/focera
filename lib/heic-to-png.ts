import JSZip from "jszip";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/image";

export const ACCEPTED_HEIC_TYPES = [
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
] as const;

export const MAX_HEIC_FILES = 20;
export const MAX_HEIC_SIZE_BYTES = Math.max(MAX_IMAGE_SIZE_BYTES, 20 * 1024 * 1024);
export const MAX_HEIC_TOTAL_BYTES = 100 * 1024 * 1024;

export type ConvertedHeicPngImage = {
  id: string;
  sourceName: string;
  blob: Blob;
  url: string;
  outputSize: number;
  originalSize: number;
};

export type HeicToPngResult = {
  images: ConvertedHeicPngImage[];
  originalSize: number;
  outputSize: number;
};

export type ConvertHeicToPngOptions = {
  onProgress?: (current: number, total: number, fileName: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function isAcceptedHeic(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".heic") || name.endsWith(".heif")) {
    return true;
  }
  return ACCEPTED_HEIC_TYPES.includes(
    file.type as (typeof ACCEPTED_HEIC_TYPES)[number],
  );
}

export function validateHeicFile(file: File): string | null {
  if (!isAcceptedHeic(file)) {
    return "Please upload a HEIC or HEIF image (.heic or .heif).";
  }

  if (file.size > MAX_HEIC_SIZE_BYTES) {
    return `Each HEIC must be ${formatFileSize(MAX_HEIC_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export function validateHeicAddition(
  incoming: File[],
  existing: File[],
): string | null {
  if (incoming.length === 0) {
    return "Please upload at least one HEIC image.";
  }

  for (const file of incoming) {
    const singleError = validateHeicFile(file);
    if (singleError) {
      return singleError;
    }
  }

  const nextCount = existing.length + incoming.length;
  if (nextCount > MAX_HEIC_FILES) {
    return `You can convert up to ${MAX_HEIC_FILES} HEIC files at a time.`;
  }

  const existingTotal = existing.reduce((sum, file) => sum + file.size, 0);
  const incomingTotal = incoming.reduce((sum, file) => sum + file.size, 0);
  if (existingTotal + incomingTotal > MAX_HEIC_TOTAL_BYTES) {
    return `Combined HEIC size must be ${formatFileSize(MAX_HEIC_TOTAL_BYTES)} or smaller.`;
  }

  return null;
}

function pngFileName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.png`;
}

async function loadHeic2Any() {
  const mod = await import("heic2any");
  return mod.default;
}

async function convertSingleHeic(
  file: File,
  signal?: AbortSignal,
): Promise<ConvertedHeicPngImage> {
  throwIfAborted(signal);

  const heic2any = await loadHeic2Any();
  throwIfAborted(signal);

  let result: Blob | Blob[];
  try {
    result = await heic2any({
      blob: file,
      toType: "image/png",
    });
  } catch {
    throw new Error(
      `"${file.name}" could not be converted. Try another HEIC/HEIF photo.`,
    );
  }

  throwIfAborted(signal);

  const blob = Array.isArray(result) ? result[0] : result;
  if (!blob || blob.size < 1) {
    throw new Error(
      `"${file.name}" produced an empty PNG. Try another photo.`,
    );
  }

  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
    sourceName: file.name,
    blob,
    url: URL.createObjectURL(blob),
    outputSize: blob.size,
    originalSize: file.size,
  };
}

export async function convertHeicToPng(
  files: File[],
  options: ConvertHeicToPngOptions = {},
): Promise<HeicToPngResult> {
  if (files.length === 0) {
    throw new Error("Add at least one HEIC image to convert.");
  }

  const additionError = validateHeicAddition(files, []);
  if (additionError) {
    throw new Error(additionError);
  }

  const images: ConvertedHeicPngImage[] = [];

  for (let index = 0; index < files.length; index += 1) {
    throwIfAborted(options.signal);
    const file = files[index];
    options.onProgress?.(index + 1, files.length, file.name);

    try {
      const converted = await convertSingleHeic(file, options.signal);
      images.push(converted);
    } catch (err) {
      revokeHeicToPngResult({ images, originalSize: 0, outputSize: 0 });
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

export function revokeHeicToPngResult(result: HeicToPngResult | null) {
  if (!result) return;
  for (const image of result.images) {
    URL.revokeObjectURL(image.url);
  }
}

export function downloadConvertedPng(image: ConvertedHeicPngImage) {
  downloadBlob(image.blob, pngFileName(image.sourceName));
}

export async function downloadHeicPngResult(
  result: HeicToPngResult,
  sourceFiles: File[],
) {
  if (result.images.length === 1) {
    downloadConvertedPng(result.images[0]);
    return;
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const image of result.images) {
    let name = pngFileName(image.sourceName);
    if (usedNames.has(name)) {
      const base = name.replace(/\.png$/i, "");
      let suffix = 2;
      while (usedNames.has(`${base}-${suffix}.png`)) {
        suffix += 1;
      }
      name = `${base}-${suffix}.png`;
    }
    usedNames.add(name);
    zip.file(name, image.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const base =
    sourceFiles.length > 0
      ? fileBaseName(sourceFiles[0]) || "heic"
      : "heic";
  downloadBlob(zipBlob, `${base}-png.zip`);
}

export function describeHeicPngOutput(result: HeicToPngResult): string {
  const count =
    result.images.length === 1
      ? "1 PNG"
      : `${result.images.length} PNGs`;
  return `${count} · ${formatFileSize(result.outputSize)}`;
}
