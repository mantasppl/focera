import { downloadBlob, formatFileSize } from "@/lib/image";
import {
  ACCEPTED_MOBI_TYPES,
  convertMobiToPdf,
  describeMobiOutput,
  revokeMobiToPdfResult,
  type ConvertMobiToPdfOptions,
  type MobiPdfPageSize,
  type MobiToPdfResult,
} from "@/lib/mobi-to-pdf";

export const ACCEPTED_AZW3_TYPES = ACCEPTED_MOBI_TYPES;

export const MAX_AZW3_SIZE_BYTES = 25 * 1024 * 1024;

export type Azw3PdfPageSize = MobiPdfPageSize;
export type Azw3ToPdfResult = MobiToPdfResult;
export type ConvertAzw3ToPdfOptions = ConvertMobiToPdfOptions;

export function validateAzw3File(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".azw3")) {
    return "Please upload a Kindle AZW3 ebook (.azw3).";
  }

  if (file.size > MAX_AZW3_SIZE_BYTES) {
    return `AZW3 file must be ${formatFileSize(MAX_AZW3_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export async function convertAzw3ToPdf(
  file: File,
  options: ConvertAzw3ToPdfOptions = {},
): Promise<Azw3ToPdfResult> {
  const validationError = validateAzw3File(file);
  if (validationError) {
    throw new Error(validationError);
  }

  return convertMobiToPdf(file, options);
}

export const revokeAzw3ToPdfResult = revokeMobiToPdfResult;
export const describeAzw3Output = describeMobiOutput;

export function downloadAzw3PdfFile(blob: Blob, sourceFile: File) {
  const base = sourceFile.name.replace(/\.azw3$/i, "") || "ebook";
  downloadBlob(blob, `${base}.pdf`);
}
