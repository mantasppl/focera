import { PDFDocument } from "@cantoo/pdf-lib";
import { downloadBlob, fileBaseName } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_PAGES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export type ProtectPdfResult = {
  blob: Blob;
  originalSize: number;
  protectedSize: number;
  pageCount: number;
};

export type ProtectPdfOptions = {
  password: string;
  signal?: AbortSignal;
};

function isEncryptedPdfError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  return (
    message.includes("is encrypted") ||
    message.includes("encryptedpdferror") ||
    err.name === "EncryptedPDFError"
  );
}

async function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Protect cancelled.", "AbortError");
  }
}

/**
 * Add open-password protection to a PDF and return an encrypted copy.
 * Runs entirely in the browser via @cantoo/pdf-lib.
 */
export async function protectPdfFile(
  file: File,
  options: ProtectPdfOptions,
): Promise<ProtectPdfResult> {
  const validationError = validatePdfFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const password = options.password.trim();
  if (!password) {
    throw new Error("Enter a password to protect this PDF.");
  }
  if (password.length < 4) {
    throw new Error("Use a password with at least 4 characters.");
  }

  await assertNotAborted(options.signal);

  const data = new Uint8Array(await file.arrayBuffer());
  await assertNotAborted(options.signal);

  let pdfDoc: PDFDocument;

  try {
    pdfDoc = await PDFDocument.load(data);
  } catch (err) {
    if (isEncryptedPdfError(err)) {
      throw new Error(
        "This PDF is already password-protected. Unlock it first, then protect it again with a new password.",
      );
    }
    throw new Error(
      "This PDF could not be read. It may be damaged or use an unsupported format.",
    );
  }

  if (pdfDoc.isEncrypted) {
    throw new Error(
      "This PDF is already password-protected. Unlock it first, then protect it again with a new password.",
    );
  }

  await assertNotAborted(options.signal);

  const pageCount = pdfDoc.getPageCount();
  if (pageCount > MAX_PDF_PAGES) {
    throw new Error(
      `This PDF has ${pageCount} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
    );
  }

  try {
    pdfDoc.encrypt({
      userPassword: password,
      ownerPassword: password,
    });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.toLowerCase().includes("pdf/a")
    ) {
      throw new Error(
        "This PDF claims PDF/A conformance, which forbids encryption. Export a standard PDF and try again.",
      );
    }
    throw new Error(
      "Could not encrypt this PDF. Try another file or browser.",
    );
  }

  await assertNotAborted(options.signal);

  // Object streams can break encryption compatibility in some readers.
  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  const bytes = new Uint8Array(pdfBytes);
  const blob = new Blob([bytes], { type: "application/pdf" });

  return {
    blob,
    originalSize: file.size,
    protectedSize: blob.size,
    pageCount,
  };
}

export function downloadProtectedPdf(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "document";
  downloadBlob(blob, `${base}-protected.pdf`);
}
