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

export type HeicJpgQuality = 0.7 | 0.85 | 0.92;

export type ConvertedHeicImage = {
  id: string;
  sourceName: string;
  blob: Blob;
  url: string;
  outputSize: number;
  originalSize: number;
};

export type HeicToJpgResult = {
  images: ConvertedHeicImage[];
  quality: HeicJpgQuality;
  originalSize: number;
  outputSize: number;
};

export type ConvertHeicToJpgOptions = {
  quality?: HeicJpgQuality;
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

function jpgFileName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.jpg`;
}

async function loadHeic2Any() {
  const mod = await import("heic2any");
  return mod.default;
}

async function convertSingleHeic(
  file: File,
  quality: HeicJpgQuality,
  signal?: AbortSignal,
): Promise<ConvertedHeicImage> {
  throwIfAborted(signal);

  const heic2any = await loadHeic2Any();
  throwIfAborted(signal);

  let result: Blob | Blob[];
  try {
    result = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality,
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
      `"${file.name}" produced an empty JPG. Try another photo.`,
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

export async function convertHeicToJpg(
  files: File[],
  options: ConvertHeicToJpgOptions = {},
): Promise<HeicToJpgResult> {
  if (files.length === 0) {
    throw new Error("Add at least one HEIC image to convert.");
  }

  const additionError = validateHeicAddition(files, []);
  if (additionError) {
    throw new Error(additionError);
  }

  const quality = options.quality ?? 0.85;
  const images: ConvertedHeicImage[] = [];

  for (let index = 0; index < files.length; index += 1) {
    throwIfAborted(options.signal);
    const file = files[index];
    options.onProgress?.(index + 1, files.length, file.name);

    try {
      const converted = await convertSingleHeic(file, quality, options.signal);
      images.push(converted);
    } catch (err) {
      revokeHeicToJpgResult({ images, quality, originalSize: 0, outputSize: 0 });
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

export function revokeHeicToJpgResult(result: HeicToJpgResult | null) {
  if (!result) return;
  for (const image of result.images) {
    URL.revokeObjectURL(image.url);
  }
}

export function downloadConvertedJpg(image: ConvertedHeicImage) {
  downloadBlob(image.blob, jpgFileName(image.sourceName));
}

export async function downloadHeicJpgResult(
  result: HeicToJpgResult,
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
      ? fileBaseName(sourceFiles[0]) || "heic"
      : "heic";
  downloadBlob(zipBlob, `${base}-jpg.zip`);
}

export function describeHeicJpgOutput(result: HeicToJpgResult): string {
  const count =
    result.images.length === 1
      ? "1 JPG"
      : `${result.images.length} JPGs`;
  return `${count} · ${formatFileSize(result.outputSize)}`;
}

export function qualityLabel(quality: HeicJpgQuality): string {
  switch (quality) {
    case 0.7:
      return "Smaller file";
    case 0.92:
      return "High quality";
    default:
      return "Balanced";
  }
}
