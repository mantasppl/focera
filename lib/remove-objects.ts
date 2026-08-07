import { downloadBlob, fileBaseName } from "@/lib/image";
import {
  BRUSH_SIZE,
  MAX_PROCESS_DIMENSION,
  removeWatermarkFromImage,
  type RemoveWatermarkOptions,
  type RemoveWatermarkResult,
} from "@/lib/remove-watermark";

export { BRUSH_SIZE, MAX_PROCESS_DIMENSION };

export type RemoveObjectsResult = RemoveWatermarkResult;

export type RemoveObjectsOptions = RemoveWatermarkOptions;

function mapProgress(message: string): string {
  return message
    .replace(/Removing watermark…/g, "Removing objects…")
    .replace(/Watermark removal cancelled\./g, "Object removal cancelled.");
}

function mapError(error: unknown): never {
  if (error instanceof DOMException && error.name === "AbortError") {
    throw new DOMException("Object removal cancelled.", "AbortError");
  }
  if (error instanceof Error) {
    const message = error.message.replace(
      /Paint over the watermark before removing it\./g,
      "Paint over the object before removing it.",
    );
    if (message !== error.message) {
      throw new Error(message);
    }
  }
  throw error;
}

export async function removeObjectsFromImage(
  file: File,
  options: RemoveObjectsOptions,
): Promise<RemoveObjectsResult> {
  const { onProgress, ...rest } = options;
  try {
    return await removeWatermarkFromImage(file, {
      ...rest,
      onProgress: onProgress
        ? (message) => onProgress(mapProgress(message))
        : undefined,
    });
  } catch (error) {
    mapError(error);
  }
}

export function downloadCleanedImage(blob: Blob, file: File): void {
  downloadBlob(blob, `${fileBaseName(file)}-objects-removed.png`);
}
