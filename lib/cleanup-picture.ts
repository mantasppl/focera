import { downloadBlob, fileBaseName } from "@/lib/image";
import {
  BRUSH_SIZE,
  MAX_PROCESS_DIMENSION,
  removeWatermarkFromImage,
  type RemoveWatermarkOptions,
  type RemoveWatermarkResult,
} from "@/lib/remove-watermark";

export { BRUSH_SIZE, MAX_PROCESS_DIMENSION };

export type CleanupPictureResult = RemoveWatermarkResult;

export type CleanupPictureOptions = RemoveWatermarkOptions;

function mapProgress(message: string): string {
  return message
    .replace(/Removing watermark…/g, "Cleaning picture…")
    .replace(/Watermark removal cancelled\./g, "Picture cleanup cancelled.");
}

function mapError(error: unknown): never {
  if (error instanceof DOMException && error.name === "AbortError") {
    throw new DOMException("Picture cleanup cancelled.", "AbortError");
  }
  if (error instanceof Error) {
    const message = error.message.replace(
      /Paint over the watermark before removing it\./g,
      "Paint over the area before cleaning it.",
    );
    if (message !== error.message) {
      throw new Error(message);
    }
  }
  throw error;
}

export async function cleanupPicture(
  file: File,
  options: CleanupPictureOptions,
): Promise<CleanupPictureResult> {
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
  downloadBlob(blob, `${fileBaseName(file)}-cleaned.png`);
}
