import MsgReader from "@kenjiuno/msgreader";
import DOMPurify from "dompurify";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import PostalMime from "postal-mime";
import { downloadBlob, formatFileSize } from "@/lib/image";

export const ACCEPTED_OUTLOOK_EXTENSIONS = [".msg", ".eml"] as const;

export const ACCEPTED_OUTLOOK_TYPES = [
  "application/vnd.ms-outlook",
  "application/octet-stream",
  "message/rfc822",
  "text/plain",
] as const;

export const MAX_OUTLOOK_SIZE_BYTES = 25 * 1024 * 1024;

export type OutlookPdfPageSize = "a4" | "letter";

export type OutlookToPdfResult = {
  blob: Blob;
  url: string;
  pageCount: number;
  subject: string;
  from: string;
  attachmentCount: number;
  wordCount: number;
  previewText: string;
  pageSize: OutlookPdfPageSize;
  originalSize: number;
  outputSize: number;
  warnings: string[];
};

export type ConvertOutlookToPdfOptions = {
  pageSize?: OutlookPdfPageSize;
  onProgress?: (label: string) => void;
  signal?: AbortSignal;
};

type ParsedEmail = {
  subject: string;
  from: string;
  to: string;
  cc: string;
  date: string;
  bodyHtml: string;
  bodyText: string;
  attachmentNames: string[];
  warnings: string[];
};

const PAGE_FORMATS: Record<
  OutlookPdfPageSize,
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

function fileExtension(file: File): string {
  const name = file.name.toLowerCase();
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot) : "";
}

function isMsgFile(file: File): boolean {
  return fileExtension(file) === ".msg";
}

function isEmlFile(file: File): boolean {
  const ext = fileExtension(file);
  if (ext === ".eml") return true;
  return file.type === "message/rfc822";
}

export function validateOutlookFile(file: File): string | null {
  if (!isMsgFile(file) && !isEmlFile(file)) {
    return "Please upload an Outlook email (.msg or .eml).";
  }

  if (file.size > MAX_OUTLOOK_SIZE_BYTES) {
    return `Email file must be ${formatFileSize(MAX_OUTLOOK_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

function formatRecipient(name?: string, email?: string): string {
  const displayName = name?.trim() || "";
  const displayEmail = email?.trim() || "";
  if (displayName && displayEmail && displayName !== displayEmail) {
    return `${displayName} <${displayEmail}>`;
  }
  return displayName || displayEmail;
}

function formatAddressList(
  addresses:
    | Array<{ name?: string; address?: string }>
    | undefined,
): string {
  if (!addresses?.length) return "";
  return addresses
    .map((entry) => formatRecipient(entry.name, entry.address))
    .filter(Boolean)
    .join(", ");
}

function plainTextToHtml(text: string): string {
  const escaped = escapeHtml(text.replace(/\r\n/g, "\n"));
  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.split("\n").join("<br/>")}</p>`)
    .join("");
}

function decodeHtmlBytes(bytes: Uint8Array): string {
  const encodings = ["utf-8", "utf-16le", "windows-1252"] as const;
  for (const encoding of encodings) {
    try {
      const decoded = new TextDecoder(encoding, { fatal: encoding !== "windows-1252" }).decode(
        bytes,
      );
      if (decoded.includes("<") || decoded.trim()) {
        return decoded;
      }
    } catch {
      // try next encoding
    }
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function guessMimeType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".bmp")) return "image/bmp";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function replaceCidReferences(html: string, cidMap: Map<string, string>): string {
  if (!cidMap.size) return html;
  let result = html;
  for (const [cid, dataUri] of cidMap) {
    const patterns = [
      new RegExp(`cid:${cid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "gi"),
      new RegExp(`cid:<${cid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}>`, "gi"),
    ];
    for (const pattern of patterns) {
      result = result.replace(pattern, dataUri);
    }
  }
  return result;
}

function sanitizeEmailHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["style", "align", "valign", "bgcolor", "width", "height", "border", "cellpadding", "cellspacing"],
    ADD_TAGS: ["style"],
  });
}

function stripHtmlToText(html: string): string {
  const host = document.createElement("div");
  host.innerHTML = html;
  return (host.textContent || "").replace(/\s+\n/g, "\n").trim();
}

async function parseMsgFile(file: File): Promise<ParsedEmail> {
  const arrayBuffer = await file.arrayBuffer();
  const reader = new MsgReader(arrayBuffer);
  const data = reader.getFileData();

  if (data.error) {
    throw new Error(
      "Could not read this Outlook .msg file. It may be damaged or an unsupported item type.",
    );
  }

  const recipients = data.recipients ?? [];
  const to = recipients
    .filter((r) => !r.recipType || r.recipType === "to")
    .map((r) => formatRecipient(r.name, r.email))
    .filter(Boolean)
    .join(", ");
  const cc = recipients
    .filter((r) => r.recipType === "cc")
    .map((r) => formatRecipient(r.name, r.email))
    .filter(Boolean)
    .join(", ");

  const attachments = data.attachments ?? [];
  const cidMap = new Map<string, string>();
  const attachmentNames: string[] = [];
  const warnings: string[] = [];

  for (const meta of attachments) {
    const name = meta.fileName || meta.name || "attachment";
    attachmentNames.push(name);
    try {
      const attachment = reader.getAttachment(meta);
      const content = attachment.content;
      if (!(content instanceof Uint8Array) || content.byteLength === 0) continue;
      const cid = (meta.pidContentId || "").replace(/^<|>$/g, "").trim();
      if (!cid) continue;
      const mime = guessMimeType(attachment.fileName || name);
      if (!mime.startsWith("image/")) continue;
      cidMap.set(cid.toLowerCase(), `data:${mime};base64,${uint8ToBase64(content)}`);
    } catch {
      warnings.push(`Could not read attachment “${name}”.`);
    }
  }

  let bodyHtml = "";
  if (data.bodyHtml?.trim()) {
    bodyHtml = data.bodyHtml;
  } else if (data.html && data.html.byteLength > 0) {
    bodyHtml = decodeHtmlBytes(data.html);
  }

  if (bodyHtml) {
    bodyHtml = replaceCidReferences(bodyHtml, cidMap);
  }

  const bodyText = (data.body || "").replace(/\r\n/g, "\n").trim();
  if (!bodyHtml.trim() && bodyText) {
    bodyHtml = plainTextToHtml(bodyText);
  }

  return {
    subject: data.subject?.trim() || "(No subject)",
    from:
      formatRecipient(data.senderName, data.senderEmail) ||
      data.senderEmail ||
      data.senderName ||
      "(Unknown sender)",
    to: to || "(No recipients)",
    cc,
    date:
      data.clientSubmitTime ||
      data.messageDeliveryTime ||
      data.creationTime ||
      data.lastModificationTime ||
      "",
    bodyHtml,
    bodyText: bodyText || (bodyHtml ? stripHtmlToText(sanitizeEmailHtml(bodyHtml)) : ""),
    attachmentNames,
    warnings,
  };
}

async function parseEmlFile(file: File): Promise<ParsedEmail> {
  const arrayBuffer = await file.arrayBuffer();
  const email = await PostalMime.parse(arrayBuffer, {
    attachmentEncoding: "arraybuffer",
  });

  const cidMap = new Map<string, string>();
  const attachmentNames: string[] = [];
  const warnings: string[] = [];

  for (const attachment of email.attachments ?? []) {
    const name = attachment.filename || "attachment";
    if (attachment.disposition === "attachment" || !attachment.contentId) {
      attachmentNames.push(name);
    } else if (attachment.filename) {
      attachmentNames.push(name);
    }

    const cid = (attachment.contentId || "").replace(/^<|>$/g, "").trim();
    if (!cid) continue;

    const content = attachment.content;
    let bytes: Uint8Array | null = null;
    if (content instanceof ArrayBuffer) {
      bytes = new Uint8Array(content);
    } else if (content instanceof Uint8Array) {
      bytes = content;
    } else if (typeof content === "string" && attachment.encoding === "base64") {
      const binary = atob(content);
      bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    }

    if (!bytes?.byteLength) continue;
    const mime = attachment.mimeType || guessMimeType(name);
    if (!mime.startsWith("image/")) continue;
    cidMap.set(cid.toLowerCase(), `data:${mime};base64,${uint8ToBase64(bytes)}`);
  }

  let bodyHtml = email.html?.trim() || "";
  if (bodyHtml) {
    bodyHtml = replaceCidReferences(bodyHtml, cidMap);
  }

  const bodyText = (email.text || "").replace(/\r\n/g, "\n").trim();
  if (!bodyHtml && bodyText) {
    bodyHtml = plainTextToHtml(bodyText);
  }

  const fromMailbox =
    email.from && "address" in email.from
      ? email.from
      : undefined;

  return {
    subject: email.subject?.trim() || "(No subject)",
    from: fromMailbox
      ? formatRecipient(fromMailbox.name, fromMailbox.address)
      : "(Unknown sender)",
    to: formatAddressList(email.to) || "(No recipients)",
    cc: formatAddressList(email.cc),
    date: email.date || "",
    bodyHtml,
    bodyText: bodyText || (bodyHtml ? stripHtmlToText(sanitizeEmailHtml(bodyHtml)) : ""),
    attachmentNames: [...new Set(attachmentNames)],
    warnings,
  };
}

function buildEmailDocumentHtml(email: ParsedEmail): string {
  const headerRows = [
    ["From", email.from],
    ["To", email.to],
    email.cc ? ["Cc", email.cc] : null,
    email.date ? ["Date", email.date] : null,
    ["Subject", email.subject],
  ].filter(Boolean) as Array<[string, string]>;

  const headersHtml = headerRows
    .map(
      ([label, value]) => `
      <tr>
        <th>${escapeHtml(label)}</th>
        <td>${escapeHtml(value)}</td>
      </tr>`,
    )
    .join("");

  const attachmentsHtml =
    email.attachmentNames.length > 0
      ? `<div class="focera-outlook-attachments">
          <strong>Attachments</strong>
          <ul>${email.attachmentNames
            .map((name) => `<li>${escapeHtml(name)}</li>`)
            .join("")}</ul>
        </div>`
      : "";

  const body = email.bodyHtml.trim()
    ? sanitizeEmailHtml(email.bodyHtml)
    : `<p><em>(This email has no readable body content.)</em></p>`;

  return `
    <header class="focera-outlook-header">
      <table class="focera-outlook-meta">${headersHtml}</table>
      ${attachmentsHtml}
    </header>
    <div class="focera-outlook-body">${body}</div>
  `;
}

function styleOutlookHost(host: HTMLElement, widthPx: number) {
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    `width:${widthPx}px`,
    "padding:40px 48px",
    "box-sizing:border-box",
    "background:#ffffff",
    "color:#14201d",
    "font-family:Segoe UI,Calibri,system-ui,sans-serif",
    "font-size:15px",
    "line-height:1.55",
    "text-align:left",
  ].join(";");

  const style = document.createElement("style");
  style.textContent = `
    .focera-outlook-pdf .focera-outlook-header {
      border-bottom: 1px solid #d5ddd9;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
    }
    .focera-outlook-pdf .focera-outlook-meta {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .focera-outlook-pdf .focera-outlook-meta th {
      width: 88px;
      text-align: left;
      vertical-align: top;
      padding: 0.2rem 0.75rem 0.2rem 0;
      color: #5a6b65;
      font-weight: 650;
      white-space: nowrap;
    }
    .focera-outlook-pdf .focera-outlook-meta td {
      padding: 0.2rem 0;
      word-break: break-word;
    }
    .focera-outlook-pdf .focera-outlook-attachments {
      margin-top: 0.85rem;
      font-size: 13px;
      color: #31443d;
    }
    .focera-outlook-pdf .focera-outlook-attachments ul {
      margin: 0.35rem 0 0;
      padding-left: 1.2rem;
    }
    .focera-outlook-pdf .focera-outlook-body p { margin: 0 0 0.75rem; }
    .focera-outlook-pdf .focera-outlook-body h1,
    .focera-outlook-pdf .focera-outlook-body h2,
    .focera-outlook-pdf .focera-outlook-body h3 {
      margin: 0 0 0.7rem;
      line-height: 1.3;
    }
    .focera-outlook-pdf .focera-outlook-body ul,
    .focera-outlook-pdf .focera-outlook-body ol {
      margin: 0 0 0.85rem;
      padding-left: 1.4rem;
    }
    .focera-outlook-pdf .focera-outlook-body table {
      border-collapse: collapse;
      max-width: 100%;
      margin: 0 0 1rem;
    }
    .focera-outlook-pdf .focera-outlook-body img {
      max-width: 100%;
      height: auto;
    }
    .focera-outlook-pdf .focera-outlook-body a { color: #0f5c4c; }
  `;
  host.appendChild(style);
}

async function renderHtmlToPdfBlob(
  html: string,
  pageSize: OutlookPdfPageSize,
  signal?: AbortSignal,
): Promise<{ blob: Blob; pageCount: number }> {
  const { format, widthPx } = PAGE_FORMATS[pageSize];
  const host = document.createElement("div");
  styleOutlookHost(host, widthPx);

  const body = document.createElement("div");
  body.className = "focera-outlook-pdf";
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

export async function convertOutlookToPdf(
  file: File,
  options: ConvertOutlookToPdfOptions = {},
): Promise<OutlookToPdfResult> {
  const validationError = validateOutlookFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const pageSize = options.pageSize ?? "a4";
  throwIfAborted(options.signal);
  options.onProgress?.("Reading Outlook email…");

  const email = isMsgFile(file)
    ? await parseMsgFile(file)
    : await parseEmlFile(file);

  throwIfAborted(options.signal);

  if (!email.bodyHtml.trim() && !email.bodyText.trim() && !email.subject) {
    throw new Error(
      "This email appears empty. Try another .msg or .eml file exported from Outlook.",
    );
  }

  options.onProgress?.("Building PDF…");
  const documentHtml = buildEmailDocumentHtml(email);
  const { blob, pageCount } = await renderHtmlToPdfBlob(
    documentHtml,
    pageSize,
    options.signal,
  );

  throwIfAborted(options.signal);

  const previewSource =
    email.bodyText ||
    [email.subject, email.from, email.to, email.date].filter(Boolean).join("\n");

  return {
    blob,
    url: URL.createObjectURL(blob),
    pageCount,
    subject: email.subject,
    from: email.from,
    attachmentCount: email.attachmentNames.length,
    wordCount: countWords(email.bodyText),
    previewText: buildPreview(previewSource),
    pageSize,
    originalSize: file.size,
    outputSize: blob.size,
    warnings: email.warnings.slice(0, 5),
  };
}

export function revokeOutlookToPdfResult(result: OutlookToPdfResult | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadPdfFile(blob: Blob, sourceFile: File) {
  const base =
    sourceFile.name.replace(/\.(msg|eml)$/i, "") || "outlook-email";
  downloadBlob(blob, `${base}.pdf`);
}

export function describeOutput(result: OutlookToPdfResult): string {
  const attachments =
    result.attachmentCount > 0
      ? ` · ${result.attachmentCount} attachment${result.attachmentCount === 1 ? "" : "s"}`
      : "";
  return `${result.pageCount} page${result.pageCount === 1 ? "" : "s"}${attachments} · ${formatFileSize(result.outputSize)}`;
}
