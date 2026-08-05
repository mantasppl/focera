import DOMPurify from "dompurify";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import mammoth from "mammoth";
import { downloadBlob, formatFileSize } from "@/lib/image";

export const ACCEPTED_WORD_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
] as const;

export const MAX_WORD_SIZE_BYTES = 25 * 1024 * 1024;

export type WordPdfPageSize = "a4" | "letter";

export type WordToPdfResult = {
  blob: Blob;
  url: string;
  pageCount: number;
  wordCount: number;
  charCount: number;
  previewText: string;
  pageSize: WordPdfPageSize;
  originalSize: number;
  outputSize: number;
  warnings: string[];
};

export type ConvertWordToPdfOptions = {
  pageSize?: WordPdfPageSize;
  onProgress?: (label: string) => void;
  signal?: AbortSignal;
};

const PAGE_FORMATS: Record<
  WordPdfPageSize,
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

function isDocxFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) return true;
  return file.type === ACCEPTED_WORD_TYPES[0];
}

function isLegacyDocFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".doc") && !name.endsWith(".docx")) return true;
  return file.type === "application/msword" && !name.endsWith(".docx");
}

export function validateWordFile(file: File): string | null {
  if (isLegacyDocFile(file)) {
    return "Legacy .doc files are not supported. Please save or export as .docx and try again.";
  }

  if (!isDocxFile(file)) {
    return "Please upload a Word document (.docx).";
  }

  if (file.size > MAX_WORD_SIZE_BYTES) {
    return `Word file must be ${formatFileSize(MAX_WORD_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

function sanitizeWordHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["style"],
  });
}

function styleWordHost(host: HTMLElement, widthPx: number) {
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
    "font-family:Calibri,Segoe UI,system-ui,sans-serif",
    "font-size:16px",
    "line-height:1.55",
    "text-align:left",
  ].join(";");

  const style = document.createElement("style");
  style.textContent = `
    .focera-word-pdf h1 { font-size: 26px; margin: 0 0 0.85rem; line-height: 1.25; font-weight: 700; }
    .focera-word-pdf h2 { font-size: 22px; margin: 1.35rem 0 0.7rem; line-height: 1.3; font-weight: 700; }
    .focera-word-pdf h3 { font-size: 18px; margin: 1.15rem 0 0.55rem; line-height: 1.35; font-weight: 650; }
    .focera-word-pdf p { margin: 0 0 0.75rem; }
    .focera-word-pdf ul, .focera-word-pdf ol { margin: 0 0 0.85rem; padding-left: 1.4rem; }
    .focera-word-pdf li { margin: 0.2rem 0; }
    .focera-word-pdf table { border-collapse: collapse; width: 100%; margin: 0 0 1rem; font-size: 14px; }
    .focera-word-pdf th, .focera-word-pdf td { border: 1px solid #c9d2ce; padding: 0.4rem 0.55rem; vertical-align: top; }
    .focera-word-pdf img { max-width: 100%; height: auto; display: block; margin: 0.75rem 0; }
    .focera-word-pdf a { color: #0f5c4c; }
    .focera-word-pdf strong { font-weight: 700; }
  `;
  host.appendChild(style);
}

async function renderHtmlToPdfBlob(
  html: string,
  pageSize: WordPdfPageSize,
  signal?: AbortSignal,
): Promise<{ blob: Blob; pageCount: number }> {
  const { format, widthPx } = PAGE_FORMATS[pageSize];
  const host = document.createElement("div");
  styleWordHost(host, widthPx);

  const body = document.createElement("div");
  body.className = "focera-word-pdf";
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

    const blob = pdf.output("blob");
    return { blob, pageCount };
  } finally {
    host.remove();
  }
}

export async function convertWordToPdf(
  file: File,
  options: ConvertWordToPdfOptions = {},
): Promise<WordToPdfResult> {
  const validationError = validateWordFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const pageSize = options.pageSize ?? "a4";
  throwIfAborted(options.signal);
  options.onProgress?.("Reading Word document…");

  const arrayBuffer = await file.arrayBuffer();
  throwIfAborted(options.signal);

  options.onProgress?.("Extracting content…");
  const [htmlResult, textResult] = await Promise.all([
    mammoth.convertToHtml(
      { arrayBuffer },
      { convertImage: mammoth.images.dataUri },
    ),
    mammoth.extractRawText({ arrayBuffer }),
  ]);

  throwIfAborted(options.signal);

  const rawText = textResult.value.replace(/\r\n/g, "\n").trim();
  const sanitized = sanitizeWordHtml(htmlResult.value);

  if (!sanitized.trim() && !rawText) {
    throw new Error(
      "This Word file appears empty. Try another .docx or export again from Word.",
    );
  }

  const warnings = [
    ...htmlResult.messages,
    ...textResult.messages,
  ]
    .filter((message) => message.type === "warning" || message.type === "error")
    .map((message) => message.message)
    .slice(0, 5);

  options.onProgress?.("Building PDF…");
  const contentHtml =
    sanitized.trim() ||
    `<p>${rawText
      .split(/\n{2,}/)
      .map((paragraph) =>
        paragraph
          .split("\n")
          .map((line) =>
            line
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;"),
          )
          .join("<br/>"),
      )
      .join("</p><p>")}</p>`;

  const { blob, pageCount } = await renderHtmlToPdfBlob(
    contentHtml,
    pageSize,
    options.signal,
  );

  throwIfAborted(options.signal);

  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    pageCount,
    wordCount: countWords(rawText),
    charCount: rawText.length,
    previewText: buildPreview(rawText),
    pageSize,
    originalSize: file.size,
    outputSize: blob.size,
    warnings,
  };
}

export function revokeWordToPdfResult(result: WordToPdfResult | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadPdfFile(blob: Blob, sourceFile: File) {
  const base = sourceFile.name.replace(/\.docx$/i, "") || "document";
  downloadBlob(blob, `${base}.pdf`);
}

export function describeOutput(result: WordToPdfResult): string {
  return `${result.wordCount.toLocaleString()} words · ${result.pageCount} page${result.pageCount === 1 ? "" : "s"} · ${formatFileSize(result.outputSize)}`;
}
