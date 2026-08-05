import { PDFDocument } from "@cantoo/pdf-lib";
import { downloadBlob, fileBaseName } from "@/lib/image";
import {
  ACCEPTED_PDF_TYPES,
  MAX_PDF_PAGES,
  MAX_PDF_SIZE_BYTES,
  validatePdfFile,
} from "@/lib/pdf-to-jpg";

export { ACCEPTED_PDF_TYPES, MAX_PDF_SIZE_BYTES, validatePdfFile };

export type UnlockPdfResult = {
  blob: Blob;
  originalSize: number;
  unlockedSize: number;
  pageCount: number;
};

export type UnlockPdfOptions = {
  password?: string;
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

function isWrongPasswordError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  return (
    message.includes("password incorrect") ||
    message.includes("needs password") ||
    message.includes("incorrect password")
  );
}

async function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Unlock cancelled.", "AbortError");
  }
}

/**
 * Remove open/owner password protection from a PDF and return an unlocked copy.
 * Runs entirely in the browser via @cantoo/pdf-lib.
 */
export async function unlockPdfFile(
  file: File,
  options: UnlockPdfOptions = {},
): Promise<UnlockPdfResult> {
  const validationError = validatePdfFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  await assertNotAborted(options.signal);

  const data = new Uint8Array(await file.arrayBuffer());
  await assertNotAborted(options.signal);

  try {
    const probe = await PDFDocument.load(data);
    if (!probe.isEncrypted) {
      throw new Error(
        "This PDF is not password-protected. No unlock is needed.",
      );
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("not password-protected")) {
      throw err;
    }
    if (!isEncryptedPdfError(err)) {
      throw new Error(
        "This PDF could not be read. It may be damaged or use an unsupported encryption format.",
      );
    }
  }

  await assertNotAborted(options.signal);

  const password = options.password ?? "";
  let pdfDoc: PDFDocument;

  try {
    pdfDoc = await PDFDocument.load(data, {
      password,
      ignoreEncryption: true,
    });
  } catch (err) {
    if (isWrongPasswordError(err) || isEncryptedPdfError(err)) {
      throw new Error(
        password
          ? "Incorrect password. Check the password and try again."
          : "This PDF requires a password. Enter the password used to open the file.",
      );
    }
    throw new Error(
      "Could not unlock this PDF. It may use an unsupported encryption format.",
    );
  }

  await assertNotAborted(options.signal);

  if (pdfDoc.isEncrypted) {
    throw new Error(
      password
        ? "Incorrect password. Check the password and try again."
        : "This PDF requires a password. Enter the password used to open the file.",
    );
  }

  const pageCount = pdfDoc.getPageCount();
  if (pageCount > MAX_PDF_PAGES) {
    throw new Error(
      `This PDF has ${pageCount} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
    );
  }

  // Rebuild into a fresh document so residual encryption dictionaries cannot linger.
  const output = await PDFDocument.create();
  const pages = await output.copyPages(
    pdfDoc,
    pdfDoc.getPageIndices(),
  );
  for (const page of pages) {
    output.addPage(page);
  }

  await assertNotAborted(options.signal);

  const pdfBytes = await output.save({ useObjectStreams: true });
  const bytes = new Uint8Array(pdfBytes);
  const blob = new Blob([bytes], { type: "application/pdf" });

  return {
    blob,
    originalSize: file.size,
    unlockedSize: blob.size,
    pageCount,
  };
}

export function downloadUnlockedPdf(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "document";
  downloadBlob(blob, `${base}-unlocked.pdf`);
}
