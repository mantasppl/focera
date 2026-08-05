import DOMPurify from "dompurify";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { downloadBlob, formatFileSize } from "@/lib/image";

export const ACCEPTED_POWERPOINT_TYPES = [
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
] as const;

export const MAX_POWERPOINT_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_POWERPOINT_SLIDES = 50;

/** EMUs (English Metric Units) per inch in OOXML. */
const EMU_PER_INCH = 914400;
/** Render slides at ~96 CSS px per inch. */
const PX_PER_INCH = 96;

export type PowerpointPdfPageSize = "widescreen" | "a4" | "letter";

export type PowerpointToPdfResult = {
  blob: Blob;
  url: string;
  pageCount: number;
  slideCount: number;
  wordCount: number;
  charCount: number;
  previewText: string;
  pageSize: PowerpointPdfPageSize;
  originalSize: number;
  outputSize: number;
  warnings: string[];
};

export type ConvertPowerpointToPdfOptions = {
  pageSize?: PowerpointPdfPageSize;
  onProgress?: (label: string) => void;
  signal?: AbortSignal;
};

type SlideSizeEmu = { width: number; height: number };

type PageFormat = {
  format: "a4" | "letter" | [number, number];
  orientation: "landscape" | "portrait";
  widthIn: number;
  heightIn: number;
};

const PAGE_FORMATS: Record<PowerpointPdfPageSize, PageFormat> = {
  widescreen: {
    format: [13.333, 7.5],
    orientation: "landscape",
    widthIn: 13.333,
    heightIn: 7.5,
  },
  a4: {
    format: "a4",
    orientation: "landscape",
    widthIn: 11.69,
    heightIn: 8.27,
  },
  letter: {
    format: "letter",
    orientation: "landscape",
    widthIn: 11,
    heightIn: 8.5,
  },
};

const IMAGE_MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".emf": "image/x-emf",
  ".wmf": "image/x-wmf",
};

const DEFAULT_SLIDE_SIZE: SlideSizeEmu = {
  width: 12192000,
  height: 6858000,
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

function isPptxFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pptx")) return true;
  return (
    file.type ===
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  );
}

function isLegacyPptFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".ppt") && !name.endsWith(".pptx")) return true;
  return file.type === "application/vnd.ms-powerpoint" && !name.endsWith(".pptx");
}

export function validatePowerpointFile(file: File): string | null {
  if (isLegacyPptFile(file)) {
    return "Legacy .ppt files are not supported. Please save or export as .pptx and try again.";
  }

  if (!isPptxFile(file)) {
    return "Please upload a PowerPoint presentation (.pptx).";
  }

  if (file.size > MAX_POWERPOINT_SIZE_BYTES) {
    return `PowerPoint file must be ${formatFileSize(MAX_POWERPOINT_SIZE_BYTES)} or smaller.`;
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

function parseXml(xml: string, label = "PowerPoint file"): Document {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error(`This ${label} looks corrupted or incomplete.`);
  }
  return doc;
}

function localName(el: Element): string {
  return el.localName || el.nodeName.replace(/^.*:/, "");
}

function childElements(parent: Element | Document, name: string): Element[] {
  return Array.from(parent.getElementsByTagName("*")).filter(
    (el) => localName(el) === name,
  );
}

function directChildren(parent: Element, name: string): Element[] {
  return Array.from(parent.children).filter((el) => localName(el) === name);
}

function findChild(parent: Element, name: string): Element | null {
  return directChildren(parent, name)[0] ?? null;
}

function findDeep(parent: Element, name: string): Element | null {
  return childElements(parent, name)[0] ?? null;
}

function emuToPx(emu: number): number {
  return (emu / EMU_PER_INCH) * PX_PER_INCH;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mimeForPath(path: string): string {
  const lower = path.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot === -1) return "application/octet-stream";
  return IMAGE_MIME_BY_EXT[lower.slice(dot)] ?? "application/octet-stream";
}

async function loadImageDataUri(
  zip: JSZip,
  path: string,
): Promise<string | null> {
  const entry = getZipFile(zip, path);
  if (!entry) return null;

  const mime = mimeForPath(path);
  if (mime === "image/x-emf" || mime === "image/x-wmf") {
    return null;
  }

  try {
    const base64 = await entry.async("base64");
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

async function loadRelationships(
  zip: JSZip,
  relsPath: string,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const entry = getZipFile(zip, relsPath);
  if (!entry) return map;

  const xml = await entry.async("text");
  const doc = parseXml(xml, "relationships file");
  for (const rel of childElements(doc, "Relationship")) {
    const id = rel.getAttribute("Id")?.trim();
    const target = rel.getAttribute("Target")?.trim();
    const type = rel.getAttribute("Type")?.trim() ?? "";
    if (!id || !target) continue;

    const basePath = relsPath.replace(/_rels\/[^/]+$/, "");
    const resolved = resolveZipPath(basePath, target);
    if (
      type.includes("/slide") ||
      type.includes("/image") ||
      type.includes("/chart") ||
      resolved
    ) {
      map.set(id, resolved);
    }
  }
  return map;
}

function readSlideSize(presentationDoc: Document): SlideSizeEmu {
  const sldSz = childElements(presentationDoc, "sldSz")[0];
  if (!sldSz) return DEFAULT_SLIDE_SIZE;

  const width = Number(sldSz.getAttribute("cx"));
  const height = Number(sldSz.getAttribute("cy"));
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return DEFAULT_SLIDE_SIZE;
  }

  return { width, height };
}

async function listSlidePaths(zip: JSZip): Promise<string[]> {
  const presentationEntry = getZipFile(zip, "ppt/presentation.xml");
  if (!presentationEntry) {
    throw new Error(
      "This file is not a valid PowerPoint presentation (missing ppt/presentation.xml).",
    );
  }

  const presentationXml = await presentationEntry.async("text");
  const presentationDoc = parseXml(presentationXml);
  const rels = await loadRelationships(zip, "ppt/_rels/presentation.xml.rels");

  const sldIdLst = childElements(presentationDoc, "sldIdLst")[0];
  if (!sldIdLst) {
    throw new Error("This presentation has no slides.");
  }

  const paths: string[] = [];
  for (const sldId of directChildren(sldIdLst, "sldId")) {
    const rId =
      sldId.getAttribute("r:id") ||
      sldId.getAttributeNS(
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
        "id",
      ) ||
      Array.from(sldId.attributes).find((attr) =>
        attr.name.toLowerCase().endsWith(":id"),
      )?.value;

    if (!rId) continue;
    const path = rels.get(rId);
    if (path) paths.push(path);
  }

  if (paths.length === 0) {
    const fallback = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const na = Number(a.match(/(\d+)/)?.[1] ?? 0);
        const nb = Number(b.match(/(\d+)/)?.[1] ?? 0);
        return na - nb;
      });
    return fallback;
  }

  return paths;
}

type ShapeBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function readTransform(el: Element): ShapeBox | null {
  const xfrm = findDeep(el, "xfrm");
  if (!xfrm) return null;

  const off = findChild(xfrm, "off");
  const ext = findChild(xfrm, "ext");
  if (!off || !ext) return null;

  const x = Number(off.getAttribute("x") ?? 0);
  const y = Number(off.getAttribute("y") ?? 0);
  const width = Number(ext.getAttribute("cx") ?? 0);
  const height = Number(ext.getAttribute("cy") ?? 0);

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  return { x, y, width, height };
}

function readSolidFill(el: Element | null): string | null {
  if (!el) return null;
  const srgb = findDeep(el, "srgbClr");
  if (srgb) {
    const val = srgb.getAttribute("val")?.trim();
    if (val && /^[0-9a-fA-F]{6}$/.test(val)) return `#${val}`;
  }
  const scheme = findDeep(el, "schemeClr");
  if (scheme) {
    const val = scheme.getAttribute("val")?.trim()?.toLowerCase();
    if (val === "bg1" || val === "lt1") return "#ffffff";
    if (val === "dk1" || val === "tx1") return "#000000";
    if (val === "accent1") return "#4472c4";
  }
  return null;
}

function readFontSizePt(rPr: Element | null): number | null {
  if (!rPr) return null;
  const sz = Number(rPr.getAttribute("sz"));
  if (!Number.isFinite(sz) || sz <= 0) return null;
  return sz / 100;
}

function paragraphHtml(p: Element): string {
  const bits: string[] = [];
  let align = "left";
  const pPr = findChild(p, "pPr");
  const algn = pPr?.getAttribute("algn");
  if (algn === "ctr") align = "center";
  else if (algn === "r") align = "right";
  else if (algn === "just") align = "justify";

  for (const child of Array.from(p.children)) {
    const name = localName(child);
    if (name === "br") {
      bits.push("<br/>");
      continue;
    }
    if (name !== "r" && name !== "fld") continue;

    const rPr = findChild(child, "rPr");
    const textNodes = childElements(child, "t");
    const text = textNodes.map((t) => t.textContent ?? "").join("");
    if (!text) continue;

    let content = escapeHtml(text);
    const bold = rPr?.getAttribute("b");
    const italic = rPr?.getAttribute("i");
    if (bold === "1" || bold === "true") content = `<strong>${content}</strong>`;
    if (italic === "1" || italic === "true") content = `<em>${content}</em>`;

    const color = readSolidFill(rPr);
    const fontSize = readFontSizePt(rPr);
    const styles: string[] = [];
    if (color) styles.push(`color:${color}`);
    if (fontSize) styles.push(`font-size:${fontSize}pt`);

    if (styles.length) {
      bits.push(`<span style="${styles.join(";")}">${content}</span>`);
    } else {
      bits.push(content);
    }
  }

  if (!bits.length) return `<div style="text-align:${align};min-height:0.6em"></div>`;
  return `<div style="text-align:${align}">${bits.join("")}</div>`;
}

function textBodyHtml(txBody: Element): string {
  const paragraphs = directChildren(txBody, "p");
  if (!paragraphs.length) return "";
  return paragraphs.map(paragraphHtml).join("");
}

function extractPlainText(root: Element): string {
  return childElements(root, "t")
    .map((t) => t.textContent ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

type SlidePart =
  | { kind: "text"; box: ShapeBox; html: string; fill: string | null }
  | { kind: "image"; box: ShapeBox; src: string };

async function collectParts(
  root: Element,
  zip: JSZip,
  rels: Map<string, string>,
  slidePath: string,
  parts: SlidePart[],
  warnings: string[],
): Promise<void> {
  for (const child of Array.from(root.children)) {
    const name = localName(child);

    if (name === "grpSp") {
      await collectParts(child, zip, rels, slidePath, parts, warnings);
      continue;
    }

    if (name === "sp") {
      const box = readTransform(child);
      const txBody = findChild(child, "txBody") ?? findDeep(child, "txBody");
      if (!box || !txBody) continue;
      const html = textBodyHtml(txBody);
      if (!html.trim()) continue;

      const spPr = findChild(child, "spPr");
      const fill = readSolidFill(spPr);
      parts.push({ kind: "text", box, html, fill });
      continue;
    }

    if (name === "pic") {
      const box = readTransform(child);
      if (!box) continue;

      const blip = findDeep(child, "blip");
      const embed =
        blip?.getAttribute("r:embed") ||
        blip?.getAttributeNS(
          "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
          "embed",
        ) ||
        Array.from(blip?.attributes ?? []).find((attr) =>
          attr.name.toLowerCase().endsWith(":embed"),
        )?.value;

      if (!embed) continue;
      const mediaPath = rels.get(embed);
      if (!mediaPath) {
        warnings.push(`Missing image relationship on ${slidePath}`);
        continue;
      }

      const src = await loadImageDataUri(zip, mediaPath);
      if (!src) {
        warnings.push(`Skipped unsupported image: ${mediaPath}`);
        continue;
      }

      parts.push({ kind: "image", box, src });
    }
  }
}

function readSlideBackground(slideDoc: Document): string {
  const bg = childElements(slideDoc, "bg")[0];
  if (!bg) return "#ffffff";
  const color = readSolidFill(bg);
  return color ?? "#ffffff";
}

function buildSlideHtml(
  parts: SlidePart[],
  slideSize: SlideSizeEmu,
  background: string,
): string {
  const widthPx = Math.max(320, Math.round(emuToPx(slideSize.width)));
  const heightPx = Math.max(180, Math.round(emuToPx(slideSize.height)));

  const layers = parts
    .map((part) => {
      const left = emuToPx(part.box.x);
      const top = emuToPx(part.box.y);
      const width = emuToPx(part.box.width);
      const height = emuToPx(part.box.height);
      const boxStyle = [
        "position:absolute",
        `left:${left}px`,
        `top:${top}px`,
        `width:${width}px`,
        `height:${height}px`,
        "box-sizing:border-box",
        "overflow:hidden",
      ];

      if (part.kind === "image") {
        return `<div style="${boxStyle.join(";")}">
          <img src="${part.src}" alt="" style="width:100%;height:100%;object-fit:contain;display:block" />
        </div>`;
      }

      if (part.fill) boxStyle.push(`background:${part.fill}`);
      boxStyle.push(
        "padding:4px 8px",
        "font-family:Calibri,Segoe UI,Arial,sans-serif",
        "font-size:18pt",
        "line-height:1.25",
        "color:#222222",
        "display:flex",
        "flex-direction:column",
        "justify-content:flex-start",
      );

      return `<div style="${boxStyle.join(";")}">${part.html}</div>`;
    })
    .join("");

  return `<div class="focera-ppt-slide" style="position:relative;width:${widthPx}px;height:${heightPx}px;background:${background};overflow:hidden">${layers}</div>`;
}

function sanitizeSlideHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["style"],
    ADD_DATA_URI_TAGS: ["img"],
  });
}

async function renderSlidesToPdf(
  slideHtmlList: string[],
  pageSize: PowerpointPdfPageSize,
  signal?: AbortSignal,
  onProgress?: (label: string) => void,
): Promise<Blob> {
  const page = PAGE_FORMATS[pageSize];
  const pdf = new jsPDF({
    unit: "in",
    format: page.format,
    orientation: page.orientation,
  });

  for (let i = 0; i < slideHtmlList.length; i += 1) {
    throwIfAborted(signal);
    onProgress?.(`Rendering slide ${i + 1} of ${slideHtmlList.length}…`);

    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = [
      "position:fixed",
      "left:-10000px",
      "top:0",
      "background:#ffffff",
    ].join(";");
    host.innerHTML = slideHtmlList[i]!;
    document.body.appendChild(host);

    try {
      const slideEl = host.querySelector(".focera-ppt-slide") as HTMLElement | null;
      const target = slideEl ?? host;
      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        width: target.offsetWidth || undefined,
        height: target.offsetHeight || undefined,
      });

      throwIfAborted(signal);

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      if (i > 0) pdf.addPage(page.format, page.orientation);

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 0.15;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;
      const imgRatio = canvas.width / canvas.height;
      const boxRatio = usableWidth / usableHeight;

      let drawWidth = usableWidth;
      let drawHeight = usableHeight;
      if (imgRatio > boxRatio) {
        drawHeight = usableWidth / imgRatio;
      } else {
        drawWidth = usableHeight * imgRatio;
      }

      const x = margin + (usableWidth - drawWidth) / 2;
      const y = margin + (usableHeight - drawHeight) / 2;
      pdf.addImage(imgData, "JPEG", x, y, drawWidth, drawHeight);
    } finally {
      host.remove();
    }
  }

  return pdf.output("blob");
}

export async function convertPowerpointToPdf(
  file: File,
  options: ConvertPowerpointToPdfOptions = {},
): Promise<PowerpointToPdfResult> {
  const validationError = validatePowerpointFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const pageSize = options.pageSize ?? "widescreen";
  throwIfAborted(options.signal);
  options.onProgress?.("Reading PowerPoint…");

  const arrayBuffer = await file.arrayBuffer();
  throwIfAborted(options.signal);

  const zip = await JSZip.loadAsync(arrayBuffer);
  throwIfAborted(options.signal);

  const presentationEntry = getZipFile(zip, "ppt/presentation.xml");
  if (!presentationEntry) {
    throw new Error(
      "This file is not a valid PowerPoint presentation (missing ppt/presentation.xml).",
    );
  }

  const presentationXml = await presentationEntry.async("text");
  const presentationDoc = parseXml(presentationXml);
  const slideSize = readSlideSize(presentationDoc);

  options.onProgress?.("Listing slides…");
  const slidePaths = await listSlidePaths(zip);

  if (slidePaths.length === 0) {
    throw new Error(
      "This presentation appears empty. Try another .pptx or export again from PowerPoint.",
    );
  }

  if (slidePaths.length > MAX_POWERPOINT_SLIDES) {
    throw new Error(
      `This presentation has too many slides (max ${MAX_POWERPOINT_SLIDES}). Try a shorter deck or split it first.`,
    );
  }

  const warnings: string[] = [];
  const slideHtmlList: string[] = [];
  const textParts: string[] = [];

  for (let i = 0; i < slidePaths.length; i += 1) {
    throwIfAborted(options.signal);
    const slidePath = slidePaths[i]!;
    options.onProgress?.(
      `Reading slide ${i + 1} of ${slidePaths.length}…`,
    );

    const slideEntry = getZipFile(zip, slidePath);
    if (!slideEntry) {
      warnings.push(`Missing slide file: ${slidePath}`);
      continue;
    }

    const slideXml = await slideEntry.async("text");
    const slideDoc = parseXml(slideXml, "slide");
    const relsPath = slidePath.replace(
      /([^/]+)$/,
      "_rels/$1.rels",
    );
    const rels = await loadRelationships(zip, relsPath);

    const cSld = childElements(slideDoc, "cSld")[0];
    const spTree = cSld ? findChild(cSld, "spTree") : null;
    if (!spTree) {
      warnings.push(`Could not read shapes on ${slidePath}`);
      continue;
    }

    const parts: SlidePart[] = [];
    await collectParts(spTree, zip, rels, slidePath, parts, warnings);

    const plain = extractPlainText(spTree);
    if (plain) textParts.push(plain);

    if (parts.length === 0) {
      const fallback = plain
        ? `<div class="focera-ppt-slide" style="position:relative;width:${Math.round(emuToPx(slideSize.width))}px;height:${Math.round(emuToPx(slideSize.height))}px;background:#ffffff;display:flex;align-items:center;justify-content:center;padding:48px;box-sizing:border-box;font-family:Calibri,Segoe UI,Arial,sans-serif;font-size:22pt;text-align:center">${escapeHtml(plain)}</div>`
        : `<div class="focera-ppt-slide" style="position:relative;width:${Math.round(emuToPx(slideSize.width))}px;height:${Math.round(emuToPx(slideSize.height))}px;background:#ffffff"></div>`;
      slideHtmlList.push(sanitizeSlideHtml(fallback));
      continue;
    }

    const background = readSlideBackground(slideDoc);
    const html = buildSlideHtml(parts, slideSize, background);
    slideHtmlList.push(sanitizeSlideHtml(html));
  }

  if (slideHtmlList.length === 0) {
    throw new Error(
      "Could not extract any slides from this PowerPoint file. Try exporting again as .pptx.",
    );
  }

  options.onProgress?.("Building PDF…");
  const blob = await renderSlidesToPdf(
    slideHtmlList,
    pageSize,
    options.signal,
    options.onProgress,
  );

  throwIfAborted(options.signal);

  const rawText = textParts.join("\n\n").trim();
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    pageCount: slideHtmlList.length,
    slideCount: slideHtmlList.length,
    wordCount: countWords(rawText),
    charCount: rawText.length,
    previewText: buildPreview(rawText),
    pageSize,
    originalSize: file.size,
    outputSize: blob.size,
    warnings: warnings.slice(0, 5),
  };
}

export function revokePowerpointToPdfResult(
  result: PowerpointToPdfResult | null,
) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadPdfFile(blob: Blob, sourceFile: File) {
  const base =
    sourceFile.name.replace(/\.pptx$/i, "") || "presentation";
  downloadBlob(blob, `${base}.pdf`);
}

export function describeOutput(result: PowerpointToPdfResult): string {
  return `${result.slideCount} slide${result.slideCount === 1 ? "" : "s"} · ${result.pageCount} page${result.pageCount === 1 ? "" : "s"} · ${formatFileSize(result.outputSize)}`;
}
