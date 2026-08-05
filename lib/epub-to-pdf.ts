import DOMPurify from "dompurify";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { downloadBlob, formatFileSize } from "@/lib/image";

export const ACCEPTED_EPUB_TYPES = [
  "application/epub+zip",
  "application/zip",
  "application/x-zip-compressed",
] as const;

export const MAX_EPUB_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_CHAPTERS = 200;

export type EpubPdfPageSize = "a4" | "letter";

export type EpubToPdfResult = {
  blob: Blob;
  url: string;
  pageCount: number;
  chapterCount: number;
  wordCount: number;
  charCount: number;
  previewText: string;
  title: string;
  pageSize: EpubPdfPageSize;
  originalSize: number;
  outputSize: number;
  warnings: string[];
};

export type ConvertEpubToPdfOptions = {
  pageSize?: EpubPdfPageSize;
  onProgress?: (label: string) => void;
  signal?: AbortSignal;
};

const PAGE_FORMATS: Record<
  EpubPdfPageSize,
  { format: "a4" | "letter"; widthPx: number }
> = {
  a4: { format: "a4", widthPx: 794 },
  letter: { format: "letter", widthPx: 816 },
};

const IMAGE_MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
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

function isEpubFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".epub")) return true;
  return ACCEPTED_EPUB_TYPES.includes(
    file.type as (typeof ACCEPTED_EPUB_TYPES)[number],
  );
}

export function validateEpubFile(file: File): string | null {
  if (!isEpubFile(file)) {
    return "Please upload an EPUB file (.epub).";
  }

  if (file.size > MAX_EPUB_SIZE_BYTES) {
    return `EPUB file must be ${formatFileSize(MAX_EPUB_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

function resolveZipPath(basePath: string, relativeHref: string): string {
  const cleaned = relativeHref.split("#")[0]?.trim() ?? "";
  if (!cleaned) return "";

  const baseDir = basePath.includes("/")
    ? basePath.slice(0, basePath.lastIndexOf("/") + 1)
    : "";
  const joined = cleaned.startsWith("/")
    ? cleaned.slice(1)
    : `${baseDir}${cleaned}`;

  const parts: string[] = [];
  for (const part of joined.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}

function getZipFile(zip: JSZip, path: string) {
  if (!path) return null;
  const direct = zip.file(path);
  if (direct) return direct;

  const lower = path.toLowerCase();
  const match = Object.keys(zip.files).find(
    (name) => !zip.files[name]?.dir && name.toLowerCase() === lower,
  );
  return match ? zip.file(match) : null;
}

function textContent(el: Element | null): string {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}

function parseXml(xml: string): Document {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("This EPUB looks corrupted or incomplete.");
  }
  return doc;
}

function sanitizeEpubHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["style"],
  });
}

function mimeForPath(path: string, fallback?: string): string {
  const lower = path.toLowerCase();
  for (const [ext, mime] of Object.entries(IMAGE_MIME_BY_EXT)) {
    if (lower.endsWith(ext)) return mime;
  }
  return fallback || "application/octet-stream";
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function fileToDataUri(
  zip: JSZip,
  path: string,
  mimeHint?: string,
): Promise<string | null> {
  const entry = getZipFile(zip, path);
  if (!entry) return null;

  const bytes = await entry.async("uint8array");
  const mime = mimeForPath(path, mimeHint);
  return `data:${mime};base64,${uint8ToBase64(bytes)}`;
}

async function loadContainerRootfile(zip: JSZip): Promise<string> {
  const containerEntry = getZipFile(zip, "META-INF/container.xml");
  if (!containerEntry) {
    throw new Error(
      "This file is not a valid EPUB (missing META-INF/container.xml).",
    );
  }

  const containerXml = await containerEntry.async("text");
  const containerDoc = parseXml(containerXml);
  const rootfile =
    containerDoc.querySelector("rootfile")?.getAttribute("full-path")?.trim() ||
    "";

  if (!rootfile) {
    throw new Error("Could not find the EPUB package document.");
  }

  return rootfile.replace(/^\//, "");
}

type ManifestItem = {
  id: string;
  href: string;
  mediaType: string;
};

type ParsedPackage = {
  title: string;
  creator: string;
  spineHrefs: string[];
  cssHrefs: string[];
  warnings: string[];
};

function parsePackageDocument(
  opfXml: string,
  opfPath: string,
): ParsedPackage {
  const doc = parseXml(opfXml);
  const warnings: string[] = [];

  const title =
    textContent(doc.querySelector("title")) ||
    textContent(doc.getElementsByTagName("dc:title")[0] ?? null) ||
    "Untitled";

  const creator =
    textContent(doc.querySelector("creator")) ||
    textContent(doc.getElementsByTagName("dc:creator")[0] ?? null) ||
    "";

  const manifest = new Map<string, ManifestItem>();
  for (const item of Array.from(doc.querySelectorAll("manifest > item"))) {
    const id = item.getAttribute("id")?.trim();
    const href = item.getAttribute("href")?.trim();
    if (!id || !href) continue;
    manifest.set(id, {
      id,
      href: resolveZipPath(opfPath, href),
      mediaType: item.getAttribute("media-type")?.trim() || "",
    });
  }

  const spineHrefs: string[] = [];
  for (const ref of Array.from(doc.querySelectorAll("spine > itemref"))) {
    const idref = ref.getAttribute("idref")?.trim();
    if (!idref) continue;
    const item = manifest.get(idref);
    if (!item) {
      warnings.push(`Missing spine item: ${idref}`);
      continue;
    }
    if (
      item.mediaType.includes("xhtml") ||
      item.mediaType.includes("html") ||
      item.href.toLowerCase().endsWith(".xhtml") ||
      item.href.toLowerCase().endsWith(".html") ||
      item.href.toLowerCase().endsWith(".htm")
    ) {
      spineHrefs.push(item.href);
    }
  }

  const cssHrefs = Array.from(manifest.values())
    .filter(
      (item) =>
        item.mediaType === "text/css" || item.href.toLowerCase().endsWith(".css"),
    )
    .map((item) => item.href);

  return { title, creator, spineHrefs, cssHrefs, warnings };
}

function extractBodyHtml(chapterXml: string): string {
  const doc = new DOMParser().parseFromString(chapterXml, "application/xhtml+xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    const htmlDoc = new DOMParser().parseFromString(chapterXml, "text/html");
    return htmlDoc.body?.innerHTML?.trim() || chapterXml;
  }

  const body = doc.querySelector("body");
  if (body) return body.innerHTML.trim();

  const html = doc.querySelector("html");
  return (html?.innerHTML || chapterXml).trim();
}

function collectLinkedStylesheets(
  chapterXml: string,
  chapterPath: string,
): string[] {
  const doc = new DOMParser().parseFromString(chapterXml, "application/xhtml+xml");
  const links = Array.from(
    doc.querySelectorAll('link[rel="stylesheet"][href], link[href][type="text/css"]'),
  );
  return links
    .map((link) => link.getAttribute("href")?.trim() || "")
    .filter(Boolean)
    .map((href) => resolveZipPath(chapterPath, href));
}

async function rewriteImagesInHtml(
  html: string,
  chapterPath: string,
  zip: JSZip,
): Promise<string> {
  const host = document.createElement("div");
  host.innerHTML = html;

  const images = Array.from(host.querySelectorAll("img[src]"));
  await Promise.all(
    images.map(async (img) => {
      const src = img.getAttribute("src")?.trim();
      if (!src || src.startsWith("data:") || /^https?:\/\//i.test(src)) return;

      const path = resolveZipPath(chapterPath, src);
      const dataUri = await fileToDataUri(zip, path);
      if (dataUri) {
        img.setAttribute("src", dataUri);
      } else {
        img.remove();
      }
    }),
  );

  for (const el of Array.from(host.querySelectorAll("[srcset]"))) {
    el.removeAttribute("srcset");
  }

  return host.innerHTML;
}

async function loadStylesheetText(
  zip: JSZip,
  hrefs: string[],
): Promise<string> {
  const chunks: string[] = [];
  const seen = new Set<string>();

  for (const href of hrefs) {
    if (!href || seen.has(href)) continue;
    seen.add(href);
    const entry = getZipFile(zip, href);
    if (!entry) continue;
    try {
      const css = await entry.async("text");
      // Drop @font-face and external url() references that won't resolve offline.
      const cleaned = css
        .replace(/@font-face\s*\{[\s\S]*?\}/gi, "")
        .replace(/url\(\s*['"]?(?!data:)[^)'"]+['"]?\s*\)/gi, "none");
      if (cleaned.trim()) chunks.push(cleaned);
    } catch {
      // ignore unreadable stylesheets
    }
  }

  return chunks.join("\n");
}

function styleEpubHost(host: HTMLElement, widthPx: number) {
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
    .focera-epub-pdf h1 { font-size: 26px; margin: 0 0 0.85rem; line-height: 1.25; font-weight: 700; }
    .focera-epub-pdf h2 { font-size: 22px; margin: 1.35rem 0 0.7rem; line-height: 1.3; font-weight: 700; }
    .focera-epub-pdf h3 { font-size: 18px; margin: 1.15rem 0 0.55rem; line-height: 1.35; font-weight: 650; }
    .focera-epub-pdf p { margin: 0 0 0.85rem; }
    .focera-epub-pdf ul, .focera-epub-pdf ol { margin: 0 0 0.85rem; padding-left: 1.4rem; }
    .focera-epub-pdf li { margin: 0.2rem 0; }
    .focera-epub-pdf table { border-collapse: collapse; width: 100%; margin: 0 0 1rem; font-size: 14px; }
    .focera-epub-pdf th, .focera-epub-pdf td { border: 1px solid #c9d2ce; padding: 0.4rem 0.55rem; vertical-align: top; }
    .focera-epub-pdf img { max-width: 100%; height: auto; display: block; margin: 0.75rem auto; }
    .focera-epub-pdf a { color: #0f5c4c; }
    .focera-epub-pdf strong { font-weight: 700; }
    .focera-epub-pdf .focera-epub-chapter + .focera-epub-chapter {
      margin-top: 2.5rem;
      padding-top: 2rem;
      border-top: 1px solid #d5ddd9;
    }
    .focera-epub-pdf .focera-epub-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 0.35rem;
      line-height: 1.2;
    }
    .focera-epub-pdf .focera-epub-creator {
      margin: 0 0 1.75rem;
      color: #4a5a55;
      font-size: 15px;
    }
  `;
  host.appendChild(style);
}

async function renderHtmlToPdfBlob(
  html: string,
  pageSize: EpubPdfPageSize,
  signal?: AbortSignal,
): Promise<{ blob: Blob; pageCount: number }> {
  const { format, widthPx } = PAGE_FORMATS[pageSize];
  const host = document.createElement("div");
  styleEpubHost(host, widthPx);

  const body = document.createElement("div");
  body.className = "focera-epub-pdf";
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

export async function convertEpubToPdf(
  file: File,
  options: ConvertEpubToPdfOptions = {},
): Promise<EpubToPdfResult> {
  const validationError = validateEpubFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const pageSize = options.pageSize ?? "a4";
  throwIfAborted(options.signal);
  options.onProgress?.("Reading EPUB…");

  const arrayBuffer = await file.arrayBuffer();
  throwIfAborted(options.signal);

  const zip = await JSZip.loadAsync(arrayBuffer);
  throwIfAborted(options.signal);

  if (getZipFile(zip, "META-INF/encryption.xml")) {
    throw new Error(
      "This EPUB appears DRM-protected and cannot be converted in the browser.",
    );
  }

  const opfPath = await loadContainerRootfile(zip);
  const opfEntry = getZipFile(zip, opfPath);
  if (!opfEntry) {
    throw new Error("Could not open the EPUB package document.");
  }

  options.onProgress?.("Parsing chapters…");
  const opfXml = await opfEntry.async("text");
  const pkg = parsePackageDocument(opfXml, opfPath);

  if (pkg.spineHrefs.length === 0) {
    throw new Error(
      "This EPUB has no readable chapters. Try another file or export again from your ebook app.",
    );
  }

  if (pkg.spineHrefs.length > MAX_CHAPTERS) {
    throw new Error(
      `This EPUB has too many chapters (max ${MAX_CHAPTERS}). Try a shorter book or split it first.`,
    );
  }

  const stylesheetHrefs = new Set(pkg.cssHrefs);
  const chapterHtmlParts: string[] = [];
  const textParts: string[] = [];
  const warnings = [...pkg.warnings];

  for (let i = 0; i < pkg.spineHrefs.length; i += 1) {
    throwIfAborted(options.signal);
    const chapterPath = pkg.spineHrefs[i]!;
    options.onProgress?.(
      `Reading chapter ${i + 1} of ${pkg.spineHrefs.length}…`,
    );

    const chapterEntry = getZipFile(zip, chapterPath);
    if (!chapterEntry) {
      warnings.push(`Missing chapter file: ${chapterPath}`);
      continue;
    }

    const chapterXml = await chapterEntry.async("text");
    for (const href of collectLinkedStylesheets(chapterXml, chapterPath)) {
      stylesheetHrefs.add(href);
    }

    let bodyHtml = extractBodyHtml(chapterXml);
    bodyHtml = await rewriteImagesInHtml(bodyHtml, chapterPath, zip);
    const sanitized = sanitizeEpubHtml(bodyHtml);
    if (!sanitized.trim()) continue;

    chapterHtmlParts.push(
      `<section class="focera-epub-chapter">${sanitized}</section>`,
    );

    const textHost = document.createElement("div");
    textHost.innerHTML = sanitized;
    const chapterText = (textHost.textContent || "").replace(/\s+/g, " ").trim();
    if (chapterText) textParts.push(chapterText);
  }

  if (chapterHtmlParts.length === 0) {
    throw new Error(
      "No readable content was found in this EPUB. DRM-free reflowable books work best.",
    );
  }

  options.onProgress?.("Loading styles…");
  const cssText = await loadStylesheetText(zip, Array.from(stylesheetHrefs));

  const titleBlock = [
    `<h1 class="focera-epub-title">${escapeHtml(pkg.title)}</h1>`,
    pkg.creator
      ? `<p class="focera-epub-creator">${escapeHtml(pkg.creator)}</p>`
      : "",
  ].join("");

  const contentHtml = [
    cssText ? `<style>${cssText}</style>` : "",
    titleBlock,
    ...chapterHtmlParts,
  ].join("\n");

  const rawText = [pkg.title, pkg.creator, ...textParts]
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

  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    pageCount,
    chapterCount: chapterHtmlParts.length,
    wordCount: countWords(rawText),
    charCount: rawText.length,
    previewText: buildPreview(rawText),
    title: pkg.title,
    pageSize,
    originalSize: file.size,
    outputSize: blob.size,
    warnings: warnings.slice(0, 5),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function revokeEpubToPdfResult(result: EpubToPdfResult | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadEpubPdfFile(blob: Blob, sourceFile: File) {
  const base = sourceFile.name.replace(/\.epub$/i, "") || "ebook";
  downloadBlob(blob, `${base}.pdf`);
}

export function describeEpubOutput(result: EpubToPdfResult): string {
  return `${result.chapterCount} chapter${result.chapterCount === 1 ? "" : "s"} · ${result.pageCount} page${result.pageCount === 1 ? "" : "s"} · ${formatFileSize(result.outputSize)}`;
}
