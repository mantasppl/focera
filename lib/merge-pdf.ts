import { PDFDocument } from "pdf-lib";
import { downloadBlob, formatFileSize } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export const MAX_MERGE_FILES = 20;
export const MAX_MERGE_TOTAL_BYTES = 100 * 1024 * 1024;

export type MergePdfOptions = {
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

export function validateMergeAddition(
  incoming: File[],
  existing: File[],
): string | null {
  if (incoming.length === 0) {
    return "Please upload at least one PDF file.";
  }

  for (const file of incoming) {
    const singleError = validatePdfFile(file);
    if (singleError) {
      return singleError;
    }
  }

  const nextCount = existing.length + incoming.length;
  if (nextCount > MAX_MERGE_FILES) {
    return `You can merge up to ${MAX_MERGE_FILES} PDFs at a time.`;
  }

  const existingTotal = existing.reduce((sum, file) => sum + file.size, 0);
  const incomingTotal = incoming.reduce((sum, file) => sum + file.size, 0);
  if (existingTotal + incomingTotal > MAX_MERGE_TOTAL_BYTES) {
    return `Combined PDF size must be ${formatFileSize(MAX_MERGE_TOTAL_BYTES)} or smaller.`;
  }

  return null;
}

export async function mergePdfFiles(
  files: File[],
  options: MergePdfOptions = {},
): Promise<Blob> {
  if (files.length < 2) {
    throw new Error("Add at least two PDFs to merge.");
  }

  const merged = await PDFDocument.create();
  const total = files.length;

  for (let index = 0; index < files.length; index += 1) {
    if (options.signal?.aborted) {
      throw new DOMException("Merge cancelled.", "AbortError");
    }

    options.onProgress?.(index + 1, total);

    const file = files[index];
    const bytes = await file.arrayBuffer();
    let source: PDFDocument;

    try {
      source = await PDFDocument.load(bytes);
    } catch {
      throw new Error(
        `"${file.name}" could not be read. It may be damaged or password-protected.`,
      );
    }

    const pageIndices = source.getPageIndices();
    const copiedPages = await merged.copyPages(source, pageIndices);
    for (const page of copiedPages) {
      merged.addPage(page);
    }
  }

  if (options.signal?.aborted) {
    throw new DOMException("Merge cancelled.", "AbortError");
  }

  const pdfBytes = await merged.save();
  const bytes = new Uint8Array(pdfBytes);
  return new Blob([bytes], { type: "application/pdf" });
}

export function downloadMergedPdf(blob: Blob, filename = "merged.pdf") {
  downloadBlob(blob, filename);
}
