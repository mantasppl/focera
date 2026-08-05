export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Please upload a JPG, PNG, or WebP image.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Image must be ${formatFileSize(MAX_IMAGE_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export const DOWNLOAD_FILENAME_PREFIX = "focera.co-";

/** Prefix download names with focera.co- (idempotent). */
export function brandedDownloadFilename(filename: string): string {
  const name = filename.trim() || "download";
  if (name.startsWith(DOWNLOAD_FILENAME_PREFIX)) return name;
  return `${DOWNLOAD_FILENAME_PREFIX}${name}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = brandedDownloadFilename(filename);
  link.click();
  URL.revokeObjectURL(url);
}

export function fileBaseName(file: File): string {
  const name = file.name.replace(/\.[^.]+$/, "");
  return name || "image";
}
