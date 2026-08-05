import JSZip from "jszip";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";
import { MAX_PDF_PAGES } from "@/lib/pdf-to-jpg";

export type PdfToEpubMode = "text" | "visual";

export type PdfToEpubResult = {
  blob: Blob;
  url: string;
  pageCount: number;
  chapterCount: number;
  mode: PdfToEpubMode;
  wordCount: number;
  charCount: number;
  previewText: string;
  originalSize: number;
  outputSize: number;
};

export type ConvertPdfToEpubOptions = {
  mode?: PdfToEpubMode;
  onProgress?: (current: number, total: number, label: string) => void;
  signal?: AbortSignal;
};

type TextPiece = {
  text: string;
  x: number;
  y: number;
  height: number;
  width: number;
};

type Chapter = {
  id: string;
  href: string;
  title: string;
  xhtml: string;
  image?: { href: string; data: Uint8Array; mediaType: string };
};

const VISUAL_SCALE = 1.4;
const EPUB_CSS = `body {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.05em;
  line-height: 1.55;
  margin: 1.2em 1.4em;
  color: #1a1a1a;
}
h1 {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 1.35em;
  font-weight: 650;
  margin: 0 0 0.9em;
  line-height: 1.25;
}
p {
  margin: 0 0 0.85em;
  text-align: justify;
  hyphens: auto;
}
.page-image {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}
.muted {
  color: #666;
  font-style: italic;
}
`;

let workerConfigured = false;

function ensurePdfWorker() {
  if (workerConfigured || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerConfigured = true;
}

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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function groupPiecesIntoLines(pieces: TextPiece[]): TextPiece[][] {
  if (!pieces.length) return [];

  const sorted = [...pieces].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 2) return b.y - a.y;
    return a.x - b.x;
  });

  const lines: TextPiece[][] = [];
  let current: TextPiece[] = [sorted[0]!];

  for (let i = 1; i < sorted.length; i += 1) {
    const piece = sorted[i]!;
    const prev = current[current.length - 1]!;
    const threshold = Math.max(prev.height, piece.height, 8) * 0.55;

    if (Math.abs(prev.y - piece.y) <= threshold) {
      current.push(piece);
    } else {
      lines.push(current.sort((a, b) => a.x - b.x));
      current = [piece];
    }
  }

  lines.push(current.sort((a, b) => a.x - b.x));
  return lines;
}

function lineToText(line: TextPiece[]): string {
  if (!line.length) return "";

  let result = line[0]!.text;
  for (let i = 1; i < line.length; i += 1) {
    const prev = line[i - 1]!;
    const curr = line[i]!;
    const gap = curr.x - (prev.x + prev.width);
    const spaceWidth = Math.max(prev.height, curr.height) * 0.25;
    result += gap > spaceWidth ? ` ${curr.text}` : curr.text;
  }

  return result.replace(/\s+/g, " ").trim();
}

function linesToParagraphs(lines: TextPiece[][]): string[] {
  if (!lines.length) return [];

  const paragraphs: string[] = [];
  let buffer = lineToText(lines[0]!);

  for (let i = 1; i < lines.length; i += 1) {
    const prevLine = lines[i - 1]!;
    const currLine = lines[i]!;
    const prevY = prevLine[0]?.y ?? 0;
    const currY = currLine[0]?.y ?? 0;
    const avgHeight =
      (prevLine.reduce((sum, p) => sum + p.height, 0) / prevLine.length +
        currLine.reduce((sum, p) => sum + p.height, 0) / currLine.length) /
      2;
    const gap = prevY - currY;
    const text = lineToText(currLine);

    if (!text) continue;

    if (gap > avgHeight * 1.45) {
      if (buffer.trim()) paragraphs.push(buffer.trim());
      buffer = text;
    } else {
      buffer = `${buffer} ${text}`.replace(/\s+/g, " ").trim();
    }
  }

  if (buffer.trim()) paragraphs.push(buffer.trim());
  return paragraphs;
}

async function extractPageParagraphs(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: any,
): Promise<string[]> {
  const content = await page.getTextContent();
  const pieces: TextPiece[] = [];

  for (const item of content.items) {
    if (!("str" in item) || typeof item.str !== "string") continue;
    const text = item.str;
    if (!text.trim()) continue;

    const transform = item.transform as number[];
    pieces.push({
      text,
      x: transform[4] ?? 0,
      y: transform[5] ?? 0,
      height: Math.abs(transform[3] ?? item.height ?? 10) || 10,
      width: item.width ?? 0,
    });
  }

  return linesToParagraphs(groupPiecesIntoLines(pieces));
}

function canvasToJpegBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Could not encode page image."));
          return;
        }
        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      "image/jpeg",
      0.88,
    );
  });
}

function chapterFileName(pageNumber: number): string {
  return `chapter-${String(pageNumber).padStart(3, "0")}.xhtml`;
}

function imageFileName(pageNumber: number): string {
  return `images/page-${String(pageNumber).padStart(3, "0")}.jpg`;
}

function buildChapterXhtml(
  title: string,
  bodyHtml: string,
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <h1>${escapeXml(title)}</h1>
  ${bodyHtml}
</body>
</html>
`;
}

function paragraphsToHtml(paragraphs: string[]): string {
  if (!paragraphs.length) {
    return `<p class="muted">[No extractable text on this page]</p>`;
  }
  return paragraphs
    .map((paragraph) => `<p>${escapeXml(paragraph)}</p>`)
    .join("\n  ");
}

function buildNavXhtml(
  bookTitle: string,
  chapters: Chapter[],
): string {
  const items = chapters
    .map(
      (chapter) =>
        `      <li><a href="${chapter.href}">${escapeXml(chapter.title)}</a></li>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>${escapeXml(bookTitle)}</h1>
    <ol>
${items}
    </ol>
  </nav>
</body>
</html>
`;
}

function buildContentOpf(
  bookTitle: string,
  bookId: string,
  chapters: Chapter[],
  modified: string,
): string {
  const manifestItems = [
    `    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `    <item id="css" href="styles.css" media-type="text/css"/>`,
    ...chapters.flatMap((chapter) => {
      const items = [
        `    <item id="${chapter.id}" href="${chapter.href}" media-type="application/xhtml+xml"/>`,
      ];
      if (chapter.image) {
        items.push(
          `    <item id="${chapter.id}-img" href="${chapter.image.href}" media-type="${chapter.image.mediaType}"/>`,
        );
      }
      return items;
    }),
  ].join("\n");

  const spineItems = chapters
    .map((chapter) => `    <itemref idref="${chapter.id}"/>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="en">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${escapeXml(bookId)}</dc:identifier>
    <dc:title>${escapeXml(bookTitle)}</dc:title>
    <dc:language>en</dc:language>
    <dc:creator>Focera PDF to EPUB</dc:creator>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
${manifestItems}
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>
`;
}

async function buildEpubBlob(
  bookTitle: string,
  chapters: Chapter[],
): Promise<Blob> {
  const zip = new JSZip();
  const bookId = `focera-${Date.now().toString(36)}`;
  const modified = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="EPUB/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`,
  );

  const epub = zip.folder("EPUB");
  if (!epub) {
    throw new Error("Could not create EPUB package.");
  }

  epub.file("styles.css", EPUB_CSS);
  epub.file("nav.xhtml", buildNavXhtml(bookTitle, chapters));
  epub.file("content.opf", buildContentOpf(bookTitle, bookId, chapters, modified));

  for (const chapter of chapters) {
    epub.file(chapter.href, chapter.xhtml);
    if (chapter.image) {
      epub.file(chapter.image.href, chapter.image.data);
    }
  }

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/epub+zip",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

async function convertTextMode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  options: ConvertPdfToEpubOptions,
): Promise<{ chapters: Chapter[]; fullText: string }> {
  const chapters: Chapter[] = [];
  const textParts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    throwIfAborted(options.signal);
    options.onProgress?.(pageNumber, pdf.numPages, "Extracting text");

    const page = await pdf.getPage(pageNumber);
    const paragraphs = await extractPageParagraphs(page);
    const title = `Page ${pageNumber}`;
    const href = chapterFileName(pageNumber);
    const id = `ch-${pageNumber}`;

    chapters.push({
      id,
      href,
      title,
      xhtml: buildChapterXhtml(title, paragraphsToHtml(paragraphs)),
    });

    if (paragraphs.length) {
      textParts.push(paragraphs.join("\n\n"));
    }

    page.cleanup();
  }

  return { chapters, fullText: textParts.join("\n\n") };
}

async function convertVisualMode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  options: ConvertPdfToEpubOptions,
): Promise<{ chapters: Chapter[]; fullText: string }> {
  const chapters: Chapter[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    throwIfAborted(options.signal);
    options.onProgress?.(pageNumber, pdf.numPages, "Rendering page");

    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: VISUAL_SCALE });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not supported in this browser.");
    }

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvas,
      canvasContext: context,
      viewport,
    }).promise;

    const data = await canvasToJpegBytes(canvas);
    const title = `Page ${pageNumber}`;
    const href = chapterFileName(pageNumber);
    const imageHref = imageFileName(pageNumber);
    const id = `ch-${pageNumber}`;

    chapters.push({
      id,
      href,
      title,
      xhtml: buildChapterXhtml(
        title,
        `<img class="page-image" src="${imageHref}" alt="${escapeXml(title)}"/>`,
      ),
      image: {
        href: imageHref,
        data,
        mediaType: "image/jpeg",
      },
    });

    page.cleanup();
  }

  return {
    chapters,
    fullText: `Visual conversion · ${pdf.numPages} page image${pdf.numPages === 1 ? "" : "s"} embedded in EPUB`,
  };
}

export async function convertPdfToEpub(
  file: File,
  options: ConvertPdfToEpubOptions = {},
): Promise<PdfToEpubResult> {
  ensurePdfWorker();

  const mode = options.mode ?? "text";
  const data = new Uint8Array(await file.arrayBuffer());
  throwIfAborted(options.signal);

  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;

  try {
    throwIfAborted(options.signal);

    if (pdf.numPages > MAX_PDF_PAGES) {
      throw new Error(
        `This PDF has ${pdf.numPages} pages. Please use a file with ${MAX_PDF_PAGES} pages or fewer.`,
      );
    }

    const { chapters, fullText } =
      mode === "visual"
        ? await convertVisualMode(pdf, options)
        : await convertTextMode(pdf, options);

    throwIfAborted(options.signal);
    options.onProgress?.(pdf.numPages, pdf.numPages, "Building EPUB");

    const bookTitle = fileBaseName(file) || "Converted PDF";
    const blob = await buildEpubBlob(bookTitle, chapters);
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      pageCount: pdf.numPages,
      chapterCount: chapters.length,
      mode,
      wordCount: countWords(fullText),
      charCount: fullText.length,
      previewText: buildPreview(fullText),
      originalSize: file.size,
      outputSize: blob.size,
    };
  } finally {
    await loadingTask.destroy();
  }
}

export function revokePdfToEpubResult(result: PdfToEpubResult | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadEpubFile(blob: Blob, sourceFile: File) {
  downloadBlob(blob, `${fileBaseName(sourceFile)}.epub`);
}

export function describeOutput(result: PdfToEpubResult): string {
  if (result.mode === "visual") {
    return `${result.chapterCount} page image${result.chapterCount === 1 ? "" : "s"} · ${formatFileSize(result.outputSize)}`;
  }
  return `${result.wordCount.toLocaleString()} words · ${result.chapterCount} chapter${result.chapterCount === 1 ? "" : "s"} · ${formatFileSize(result.outputSize)}`;
}
