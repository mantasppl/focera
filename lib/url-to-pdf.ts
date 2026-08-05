import { brandedDownloadFilename, downloadBlob } from "@/lib/image";

/** Max characters accepted for a page URL. */
export const URL_TO_PDF_MAX_URL_LENGTH = 2048;

/** Soft cap on PDF bytes returned to the client (~25 MB). */
export const URL_TO_PDF_MAX_BYTES = 25 * 1024 * 1024;

export type UrlToPdfPageFormat = "full" | "a4" | "letter";

export const URL_TO_PDF_PAGE_FORMATS: {
  id: UrlToPdfPageFormat;
  label: string;
  hint: string;
}[] = [
  {
    id: "full",
    label: "Full page",
    hint: "One tall PDF matching the full scroll height",
  },
  {
    id: "a4",
    label: "A4",
    hint: "Paginated A4 print of the whole page",
  },
  {
    id: "letter",
    label: "Letter",
    hint: "Paginated US Letter print of the whole page",
  },
];

export function isUrlToPdfPageFormat(value: unknown): value is UrlToPdfPageFormat {
  return value === "full" || value === "a4" || value === "letter";
}

/** Normalize user input into an absolute https URL, or null if invalid. */
export function normalizePageUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > URL_TO_PDF_MAX_URL_LENGTH) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    // Prefer https for public pages; allow http only for clear hostnames.
    if (url.protocol === "http:") {
      url.protocol = "https:";
    }
    if (url.username || url.password) return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Client-facing validation. Returns an error message or null when valid. */
export function validatePageUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return "Paste a webpage URL.";
  if (trimmed.length > URL_TO_PDF_MAX_URL_LENGTH) {
    return "URL is too long.";
  }
  if (!normalizePageUrl(trimmed)) {
    return "Enter a valid webpage URL (https://…).";
  }
  return null;
}

export function filenameFromUrl(pageUrl: string): string {
  try {
    const host = new URL(pageUrl).hostname.replace(/^www\./i, "") || "page";
    const safe = host.replace(/[^a-z0-9.-]+/gi, "-").replace(/^-+|-+$/g, "");
    return `${safe || "page"}.pdf`;
  } catch {
    return "page.pdf";
  }
}

export function downloadUrlPdf(blob: Blob, pageUrl: string): void {
  downloadBlob(blob, filenameFromUrl(pageUrl));
}

export function brandedUrlPdfFilename(pageUrl: string): string {
  return brandedDownloadFilename(filenameFromUrl(pageUrl));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
