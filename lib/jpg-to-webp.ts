import JSZip from "jszip";
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

export type JpgWebpQuality = 0.7 | 0.85 | 0.92;

export type ConvertedJpgWebpImage = {
  id: string;
  sourceName: string;
  blob: Blob;
  url: string;
  outputSize: number;
  originalSize: number;
  width: number;
  height: number;
};

export type JpgToWebpResult = {
  images: ConvertedJpgWebpImage[];
  quality: JpgWebpQuality;
  originalSize: number;
  outputSize: number;
};

export type ConvertJpgToWebpOptions = {
  quality?: JpgWebpQuality;
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

function webpFileName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.webp`;
}

function canvasToWebpBlob(
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
        reject(
          new Error(
            "WebP encoding is not supported in this browser. Try updating your browser.",
          ),
        );
      },
      "image/webp",
      quality,
    );
  });
}

async function convertSingleJpg(
  file: File,
  quality: JpgWebpQuality,
  signal?: AbortSignal,
): Promise<ConvertedJpgWebpImage> {
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

    const blob = await canvasToWebpBlob(canvas, quality);
    throwIfAborted(signal);

    if (blob.size < 1) {
      throw new Error(
        `"${file.name}" produced an empty WebP. Try another image.`,
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

export async function convertJpgToWebp(
  files: File[],
  options: ConvertJpgToWebpOptions = {},
): Promise<JpgToWebpResult> {
  if (files.length === 0) {
    throw new Error("Add at least one JPG image to convert.");
  }

  const additionError = validateJpgAddition(files, []);
  if (additionError) {
    throw new Error(additionError);
  }

  const quality = options.quality ?? 0.85;
  const images: ConvertedJpgWebpImage[] = [];

  for (let index = 0; index < files.length; index += 1) {
    throwIfAborted(options.signal);
    const file = files[index];
    options.onProgress?.(index + 1, files.length, file.name);

    try {
      const converted = await convertSingleJpg(file, quality, options.signal);
      images.push(converted);
    } catch (err) {
      revokeJpgToWebpResult({
        images,
        quality,
        originalSize: 0,
        outputSize: 0,
      });
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

export function revokeJpgToWebpResult(result: JpgToWebpResult | null) {
  if (!result) return;
  for (const image of result.images) {
    URL.revokeObjectURL(image.url);
  }
}

export function downloadConvertedWebp(image: ConvertedJpgWebpImage) {
  downloadBlob(image.blob, webpFileName(image.sourceName));
}

export async function downloadJpgWebpResult(
  result: JpgToWebpResult,
  sourceFiles: File[],
) {
  if (result.images.length === 1) {
    downloadConvertedWebp(result.images[0]);
    return;
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const image of result.images) {
    let name = webpFileName(image.sourceName);
    if (usedNames.has(name)) {
      const base = name.replace(/\.webp$/i, "");
      let suffix = 2;
      while (usedNames.has(`${base}-${suffix}.webp`)) {
        suffix += 1;
      }
      name = `${base}-${suffix}.webp`;
    }
    usedNames.add(name);
    zip.file(name, image.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const base =
    sourceFiles.length > 0
      ? fileBaseName(sourceFiles[0]) || "jpg"
      : "jpg";
  downloadBlob(zipBlob, `${base}-webp.zip`);
}

export function describeJpgWebpOutput(result: JpgToWebpResult): string {
  const count =
    result.images.length === 1
      ? "1 WebP"
      : `${result.images.length} WebPs`;
  return `${count} · ${formatFileSize(result.outputSize)}`;
}

export function qualityLabel(quality: JpgWebpQuality): string {
  switch (quality) {
    case 0.7:
      return "Smaller file";
    case 0.92:
      return "High quality";
    default:
      return "Balanced";
  }
}
