import DOMPurify from "dompurify";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  initKf8File,
  initMobiFile,
  type Kf8,
  type Mobi,
  type MobiMetadata,
} from "@lingo-reader/mobi-parser";
import { downloadBlob, formatFileSize } from "@/lib/image";

export const ACCEPTED_MOBI_TYPES = [
  "application/x-mobipocket-ebook",
  "application/vnd.amazon.ebook",
] as const;

export const MAX_MOBI_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_CHAPTERS = 200;

export type MobiPdfPageSize = "a4" | "letter";

export type MobiToPdfResult = {
  blob: Blob;
  url: string;
  pageCount: number;
  chapterCount: number;
  wordCount: number;
  charCount: number;
  previewText: string;
  title: string;
  pageSize: MobiPdfPageSize;
  originalSize: number;
  outputSize: number;
  warnings: string[];
};

export type ConvertMobiToPdfOptions = {
  pageSize?: MobiPdfPageSize;
  onProgress?: (label: string) => void;
  signal?: AbortSignal;
};

type BookReader = Mobi | Kf8;

const PAGE_FORMATS: Record<
  MobiPdfPageSize,
  { format: "a4" | "letter"; widthPx: number }
> = {
  a4: { format: "a4", widthPx: 794 },
  letter: { format: "letter", widthPx: 816 },
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function buildPreview(text: string, maxChars = 1200): string {
  const normalized = text.replace(/\s+\n/g, "\n").trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars).trimEnd()}…`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isMobiFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (
    name.endsWith(".mobi") ||
    name.endsWith(".azw") ||
    name.endsWith(".azw3") ||
    name.endsWith(".prc")
  ) {
    return true;
  }
  return ACCEPTED_MOBI_TYPES.includes(
    file.type as (typeof ACCEPTED_MOBI_TYPES)[number],
  );
}

export function validateMobiFile(file: File): string | null {
  if (!isMobiFile(file)) {
    return "Please upload a MOBI or Kindle ebook (.mobi, .azw, .azw3, or .prc).";
  }

  if (file.size > MAX_MOBI_SIZE_BYTES) {
    return `Ebook file must be ${formatFileSize(MAX_MOBI_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

function sanitizeMobiHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["style"],
  });
}

function extractBodyHtml(chapterHtml: string): string {
  const xhtmlDoc = new DOMParser().parseFromString(
    chapterHtml,
    "application/xhtml+xml",
  );
  if (!xhtmlDoc.querySelector("parsererror")) {
    const body = xhtmlDoc.querySelector("body");
    if (body) return body.innerHTML.trim();
    const html = xhtmlDoc.querySelector("html");
    if (html) return html.innerHTML.trim();
  }

  const htmlDoc = new DOMParser().parseFromString(chapterHtml, "text/html");
  return htmlDoc.body?.innerHTML?.trim() || chapterHtml.trim();
}

function prefersKf8(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".azw3");
}

async function openBook(file: File): Promise<BookReader> {
  const tryMobi = async () => initMobiFile(file);
  const tryKf8 = async () => initKf8File(file);

  if (prefersKf8(file)) {
    try {
      return await tryKf8();
    } catch {
      return tryMobi();
    }
  }

  try {
    const book = await tryMobi();
    if (book.getSpine().length === 0) {
      book.destroy();
      return tryKf8();
    }
    return book;
  } catch (primaryError) {
    try {
      return await tryKf8();
    } catch {
      throw primaryError;
    }
  }
}

async function fetchCssText(href: string): Promise<string> {
  if (!href) return "";
  try {
    const response = await fetch(href);
    if (!response.ok) return "";
    const css = await response.text();
    return css
      .replace(/@font-face\s*\{[\s\S]*?\}/gi, "")
      .replace(/url\(\s*['"]?(?!data:)[^)'"]+['"]?\s*\)/gi, "none");
  } catch {
    return "";
  }
}

function styleMobiHost(host: HTMLElement, widthPx: number) {
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    `width:${widthPx}px`,
    "padding:48px 56px",
    "box-sizing:border-box",
    "background:#ffffff",
    "color:#14201d",
    "font-family:Georgia,'Times New Roman',serif",
    "font-size:16px",
    "line-height:1.6",
    "text-align:left",
  ].join(";");

  const style = document.createElement("style");
  style.textContent = `
    .focera-mobi-pdf h1 { font-size: 26px; margin: 0 0 0.85rem; line-height: 1.25; font-weight: 700; }
    .focera-mobi-pdf h2 { font-size: 22px; margin: 1.35rem 0 0.7rem; line-height: 1.3; font-weight: 700; }
    .focera-mobi-pdf h3 { font-size: 18px; margin: 1.15rem 0 0.55rem; line-height: 1.35; font-weight: 650; }
    .focera-mobi-pdf p { margin: 0 0 0.85rem; }
    .focera-mobi-pdf ul, .focera-mobi-pdf ol { margin: 0 0 0.85rem; padding-left: 1.4rem; }
    .focera-mobi-pdf li { margin: 0.2rem 0; }
    .focera-mobi-pdf table { border-collapse: collapse; width: 100%; margin: 0 0 1rem; font-size: 14px; }
    .focera-mobi-pdf th, .focera-mobi-pdf td { border: 1px solid #c9d2ce; padding: 0.4rem 0.55rem; vertical-align: top; }
    .focera-mobi-pdf img { max-width: 100%; height: auto; display: block; margin: 0.75rem auto; }
    .focera-mobi-pdf a { color: #0f5c4c; }
    .focera-mobi-pdf strong { font-weight: 700; }
    .focera-mobi-pdf .focera-mobi-chapter + .focera-mobi-chapter {
      margin-top: 2.5rem;
      padding-top: 2rem;
      border-top: 1px solid #d5ddd9;
    }
    .focera-mobi-pdf .focera-mobi-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 0.35rem;
      line-height: 1.2;
    }
    .focera-mobi-pdf .focera-mobi-creator {
      margin: 0 0 1.75rem;
      color: #4a5a55;
      font-size: 15px;
    }
    .focera-mobi-pdf .focera-mobi-cover {
      max-width: 280px;
      margin: 0 auto 1.75rem;
    }
  `;
  host.appendChild(style);
}

async function renderHtmlToPdfBlob(
  html: string,
  pageSize: MobiPdfPageSize,
  signal?: AbortSignal,
): Promise<{ blob: Blob; pageCount: number }> {
  const { format, widthPx } = PAGE_FORMATS[pageSize];
  const host = document.createElement("div");
  styleMobiHost(host, widthPx);

  const body = document.createElement("div");
  body.className = "focera-mobi-pdf";
  body.innerHTML = html;
  host.appendChild(body);
  document.body.appendChild(host);

  try {
    throwIfAborted(signal);

    const canvas = await html2canvas(host, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: widthPx,
    });

    throwIfAborted(signal);

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({
      unit: "mm",
      format,
      orientation: "portrait",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;
    let pageCount = 1;

    pdf.addImage(imgData, "JPEG", margin, position, usableWidth, imgHeight);
    heightLeft -= usableHeight;

    while (heightLeft > 0.5) {
      position = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pageCount += 1;
      pdf.addImage(imgData, "JPEG", margin, position, usableWidth, imgHeight);
      heightLeft -= usableHeight;
      throwIfAborted(signal);
    }

    return { blob: pdf.output("blob"), pageCount };
  } finally {
    host.remove();
  }
}

function creatorFromMetadata(metadata: MobiMetadata): string {
  return (metadata.author ?? []).filter(Boolean).join(", ");
}

function mapOpenError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  if (
    lower.includes("drm") ||
    lower.includes("encryption") ||
    lower.includes("encrypted") ||
    lower.includes("voucher")
  ) {
    return new Error(
      "This ebook appears DRM-protected and cannot be converted in the browser.",
    );
  }
  return new Error(
    "Could not open this MOBI/Kindle file. Try a DRM-free .mobi or .azw3 export.",
  );
}

export async function convertMobiToPdf(
  file: File,
  options: ConvertMobiToPdfOptions = {},
): Promise<MobiToPdfResult> {
  const validationError = validateMobiFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const pageSize = options.pageSize ?? "a4";
  throwIfAborted(options.signal);
  options.onProgress?.("Reading ebook…");

  let book: BookReader | null = null;

  try {
    try {
      book = await openBook(file);
    } catch (error) {
      throw mapOpenError(error);
    }

    throwIfAborted(options.signal);
    options.onProgress?.("Parsing chapters…");

    const metadata = book.getMetadata();
    const title =
      metadata.title?.trim() ||
      file.name.replace(/\.(mobi|azw3?|prc)$/i, "") ||
      "Untitled";
    const creator = creatorFromMetadata(metadata);
    const spine = book.getSpine();

    if (spine.length === 0) {
      throw new Error(
        "This ebook has no readable chapters. Try another DRM-free file.",
      );
    }

    if (spine.length > MAX_CHAPTERS) {
      throw new Error(
        `This ebook has too many chapters (max ${MAX_CHAPTERS}). Try a shorter book or split it first.`,
      );
    }

    const chapterHtmlParts: string[] = [];
    const textParts: string[] = [];
    const cssHrefs = new Set<string>();
    const warnings: string[] = [];

    for (let i = 0; i < spine.length; i += 1) {
      throwIfAborted(options.signal);
      const chapterId = spine[i]!.id;
      options.onProgress?.(`Reading chapter ${i + 1} of ${spine.length}…`);

      const chapter = book.loadChapter(chapterId);
      if (!chapter) {
        warnings.push(`Missing chapter: ${chapterId}`);
        continue;
      }

      for (const part of chapter.css) {
        if (part.href) cssHrefs.add(part.href);
      }

      const bodyHtml = extractBodyHtml(chapter.html);
      const sanitized = sanitizeMobiHtml(bodyHtml);
      if (!sanitized.trim()) continue;

      chapterHtmlParts.push(
        `<section class="focera-mobi-chapter">${sanitized}</section>`,
      );

      const textHost = document.createElement("div");
      textHost.innerHTML = sanitized;
      const chapterText = (textHost.textContent || "").replace(/\s+/g, " ").trim();
      if (chapterText) textParts.push(chapterText);
    }

    if (chapterHtmlParts.length === 0) {
      throw new Error(
        "No readable content was found in this ebook. DRM-free MOBI and AZW3 files work best.",
      );
    }

    options.onProgress?.("Loading styles…");
    const cssChunks: string[] = [];
    for (const href of cssHrefs) {
      throwIfAborted(options.signal);
      const css = await fetchCssText(href);
      if (css.trim()) cssChunks.push(css);
    }

    const coverUrl = book.getCoverImage();
    const coverBlock = coverUrl
      ? `<img class="focera-mobi-cover" src="${escapeHtml(coverUrl)}" alt="" />`
      : "";

    const titleBlock = [
      coverBlock,
      `<h1 class="focera-mobi-title">${escapeHtml(title)}</h1>`,
      creator
        ? `<p class="focera-mobi-creator">${escapeHtml(creator)}</p>`
        : "",
    ].join("");

    const contentHtml = [
      cssChunks.length > 0 ? `<style>${cssChunks.join("\n")}</style>` : "",
      titleBlock,
      ...chapterHtmlParts,
    ].join("\n");

    const rawText = [title, creator, ...textParts]
      .filter(Boolean)
      .join("\n\n")
      .trim();

    options.onProgress?.("Building PDF…");
    const { blob, pageCount } = await renderHtmlToPdfBlob(
      contentHtml,
      pageSize,
      options.signal,
    );

    throwIfAborted(options.signal);

    return {
      blob,
      url: URL.createObjectURL(blob),
      pageCount,
      chapterCount: chapterHtmlParts.length,
      wordCount: countWords(rawText),
      charCount: rawText.length,
      previewText: buildPreview(rawText),
      title,
      pageSize,
      originalSize: file.size,
      outputSize: blob.size,
      warnings: warnings.slice(0, 5),
    };
  } finally {
    book?.destroy();
  }
}

export function revokeMobiToPdfResult(result: MobiToPdfResult | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadMobiPdfFile(blob: Blob, sourceFile: File) {
  const base =
    sourceFile.name.replace(/\.(mobi|azw3?|prc)$/i, "") || "ebook";
  downloadBlob(blob, `${base}.pdf`);
}

export function describeMobiOutput(result: MobiToPdfResult): string {
  return `${result.chapterCount} chapter${result.chapterCount === 1 ? "" : "s"} · ${result.pageCount} page${result.pageCount === 1 ? "" : "s"} · ${formatFileSize(result.outputSize)}`;
}
