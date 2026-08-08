import { downloadBlob, fileBaseName } from "@/lib/image";
import {
  BRUSH_SIZE,
  MAX_PROCESS_DIMENSION,
  removeWatermarkFromImage,
  type RemoveWatermarkOptions,
  type RemoveWatermarkResult,
} from "@/lib/remove-watermark";

export { BRUSH_SIZE, MAX_PROCESS_DIMENSION };

export type RemovePersonResult = RemoveWatermarkResult;

export type RemovePersonOptions = RemoveWatermarkOptions;

function mapProgress(message: string): string {
  return message
    .replace(/Removing watermark…/g, "Removing person…")
    .replace(/Watermark removal cancelled\./g, "Person removal cancelled.");
}

function mapError(error: unknown): never {
  if (error instanceof DOMException && error.name === "AbortError") {
    throw new DOMException("Person removal cancelled.", "AbortError");
  }
  if (error instanceof Error) {
    const message = error.message.replace(
      /Paint over the watermark before removing it\./g,
      "Paint over the person before removing them.",
    );
    if (message !== error.message) {
      throw new Error(message);
    }
  }
  throw error;
}

export async function removePersonFromImage(
  file: File,
  options: RemovePersonOptions,
): Promise<RemovePersonResult> {
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
  downloadBlob(blob, `${fileBaseName(file)}-person-removed.png`);
}
