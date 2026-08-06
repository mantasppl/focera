import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import JSZip from "jszip";
import { downloadBlob, formatFileSize } from "@/lib/image";
import { MAX_PDF_PAGES } from "@/lib/pdf-to-jpg";
import { safeSpreadsheetCell } from "@/lib/security/export-safe";

export type PdfToCsvLayout = "tables" | "lines";
export type PdfToCsvOutput = "combined" | "per-page";

export type PdfToCsvResult = {
  blob: Blob;
  url: string;
  pageCount: number;
  rowCount: number;
  columnCount: number;
  fileCount: number;
  layout: PdfToCsvLayout;
  output: PdfToCsvOutput;
  extension: "csv" | "zip";
  previewRows: string[][];
  originalSize: number;
  outputSize: number;
};

export type ConvertPdfToCsvOptions = {
  layout?: PdfToCsvLayout;
  output?: PdfToCsvOutput;
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

type PageRows = {
  pageNumber: number;
  rows: string[][];
};

const PREVIEW_ROW_LIMIT = 12;
const PREVIEW_COL_LIMIT = 8;

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

function splitLineIntoCells(line: TextPiece[]): string[] {
  if (!line.length) return [];

  const cells: string[] = [];
  let buffer = line[0]!.text;

  for (let i = 1; i < line.length; i += 1) {
    const prev = line[i - 1]!;
    const curr = line[i]!;
    const gap = curr.x - (prev.x + prev.width);
    const spaceWidth = Math.max(prev.height, curr.height) * 0.25;
    const columnGap = Math.max(prev.height, curr.height, 10) * 1.35;

    if (gap > columnGap) {
      const cell = buffer.replace(/\s+/g, " ").trim();
      if (cell) cells.push(cell);
      buffer = curr.text;
    } else {
      buffer += gap > spaceWidth ? ` ${curr.text}` : curr.text;
    }
  }

  const last = buffer.replace(/\s+/g, " ").trim();
  if (last) cells.push(last);
  return cells;
}

function lineToSingleCell(line: TextPiece[]): string {
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

function detectColumnBoundaries(lines: TextPiece[][]): number[] {
  const starts: number[] = [];

  for (const line of lines) {
    if (line.length < 2) continue;
    for (const piece of line) {
      starts.push(piece.x);
    }
  }

  if (!starts.length) return [0];

  starts.sort((a, b) => a - b);
  const clusters: number[] = [starts[0]!];

  for (let i = 1; i < starts.length; i += 1) {
    const x = starts[i]!;
    const prev = clusters[clusters.length - 1]!;
    if (x - prev > 18) {
      clusters.push(x);
    }
  }

  return clusters;
}

function assignCellsToColumns(
  cells: { text: string; x: number }[],
  columns: number[],
): string[] {
  const row = Array.from({ length: columns.length }, () => "");

  for (const cell of cells) {
    let bestIndex = 0;
    let bestDistance = Math.abs(cell.x - columns[0]!);

    for (let i = 1; i < columns.length; i += 1) {
      const distance = Math.abs(cell.x - columns[i]!);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }

    row[bestIndex] = row[bestIndex]
      ? `${row[bestIndex]} ${cell.text}`.replace(/\s+/g, " ").trim()
      : cell.text;
  }

  return row;
}

function extractTableRows(lines: TextPiece[][]): string[][] {
  if (!lines.length) return [];

  const multiColumn = lines.filter((line) => splitLineIntoCells(line).length > 1);
  if (multiColumn.length < Math.max(2, Math.ceil(lines.length * 0.2))) {
    return lines
      .map((line) => lineToSingleCell(line))
      .filter(Boolean)
      .map((text) => [text]);
  }

  const columns = detectColumnBoundaries(multiColumn);
  const rows: string[][] = [];

  for (const line of lines) {
    const pieces = line.map((piece) => ({
      text: piece.text.replace(/\s+/g, " ").trim(),
      x: piece.x,
    }));
    const cells = splitLineIntoCells(line);

    if (!cells.length) continue;

    if (cells.length === 1 && columns.length > 1) {
      rows.push(assignCellsToColumns(pieces, columns));
    } else if (cells.length === columns.length) {
      rows.push(cells);
    } else {
      const cellStarts: { text: string; x: number }[] = [];
      let buffer = line[0]!.text;
      let startX = line[0]!.x;

      for (let i = 1; i < line.length; i += 1) {
        const prev = line[i - 1]!;
        const curr = line[i]!;
        const gap = curr.x - (prev.x + prev.width);
        const spaceWidth = Math.max(prev.height, curr.height) * 0.25;
        const columnGap = Math.max(prev.height, curr.height, 10) * 1.35;

        if (gap > columnGap) {
          const text = buffer.replace(/\s+/g, " ").trim();
          if (text) cellStarts.push({ text, x: startX });
          buffer = curr.text;
          startX = curr.x;
        } else {
          buffer += gap > spaceWidth ? ` ${curr.text}` : curr.text;
        }
      }

      const last = buffer.replace(/\s+/g, " ").trim();
      if (last) cellStarts.push({ text: last, x: startX });
      rows.push(assignCellsToColumns(cellStarts, columns));
    }
  }

  return rows;
}

function extractLineRows(lines: TextPiece[][]): string[][] {
  return lines
    .map((line) => lineToSingleCell(line))
    .filter(Boolean)
    .map((text) => [text]);
}

async function extractPageRows(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: any,
  layout: PdfToCsvLayout,
): Promise<string[][]> {
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

  const lines = groupPiecesIntoLines(pieces);
  return layout === "tables" ? extractTableRows(lines) : extractLineRows(lines);
}

function escapeCsvCell(value: string): string {
  const safe = safeSpreadsheetCell(value);
  if (/[",\n\r]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

function rowsToCsv(rows: string[][]): string {
  const normalized =
    rows.length > 0
      ? rows
      : [["This PDF did not contain extractable text."]];

  return normalized
    .map((row) => row.map((cell) => escapeCsvCell(cell ?? "")).join(","))
    .join("\n");
}

function buildCombinedRows(pages: PageRows[]): string[][] {
  const combined: string[][] = [];

  for (const page of pages) {
    if (pages.length > 1) {
      if (combined.length) combined.push([]);
      combined.push([`Page ${page.pageNumber}`]);
    }
    if (page.rows.length) {
      combined.push(...page.rows);
    } else {
      combined.push(["[No extractable text on this page]"]);
    }
  }

  return combined.length
    ? combined
    : [["This PDF did not contain extractable text."]];
}

function sourceBaseName(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "") || "tables";
}

function countColumns(pages: PageRows[]): number {
  let max = 0;
  for (const page of pages) {
    for (const row of page.rows) {
      max = Math.max(max, row.length);
    }
  }
  return max;
}

function countRows(pages: PageRows[]): number {
  return pages.reduce((sum, page) => sum + page.rows.length, 0);
}

function buildPreview(pages: PageRows[]): string[][] {
  const rows: string[][] = [];

  for (const page of pages) {
    for (const row of page.rows) {
      rows.push(row.slice(0, PREVIEW_COL_LIMIT));
      if (rows.length >= PREVIEW_ROW_LIMIT) return rows;
    }
  }

  return rows;
}

async function buildOutputBlob(
  pages: PageRows[],
  output: PdfToCsvOutput,
  sourceName: string,
): Promise<{ blob: Blob; fileCount: number; extension: "csv" | "zip" }> {
  const base = sourceBaseName(sourceName);

  if (output === "per-page") {
    const zip = new JSZip();
    for (const page of pages) {
      const rows =
        page.rows.length > 0
          ? page.rows
          : [["[No extractable text on this page]"]];
      const csv = rowsToCsv(rows);
      zip.file(`${base}-page-${page.pageNumber}.csv`, csv);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    return { blob, fileCount: pages.length, extension: "zip" };
  }

  const csv = rowsToCsv(buildCombinedRows(pages));
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  return { blob, fileCount: 1, extension: "csv" };
}

export async function convertPdfToCsv(
  file: File,
  options: ConvertPdfToCsvOptions = {},
): Promise<PdfToCsvResult> {
  ensurePdfWorker();

  const layout = options.layout ?? "tables";
  const output = options.output ?? "combined";
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

    const pages: PageRows[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      throwIfAborted(options.signal);
      options.onProgress?.(pageNumber, pdf.numPages, "Extracting tables");

      const page = await pdf.getPage(pageNumber);
      const rows = await extractPageRows(page, layout);
      pages.push({ pageNumber, rows });
      page.cleanup();
    }

    throwIfAborted(options.signal);
    options.onProgress?.(pdf.numPages, pdf.numPages, "Building CSV");

    const built = await buildOutputBlob(pages, output, file.name);
    const url = URL.createObjectURL(built.blob);

    return {
      blob: built.blob,
      url,
      pageCount: pdf.numPages,
      rowCount: countRows(pages),
      columnCount: countColumns(pages),
      fileCount: built.fileCount,
      layout,
      output,
      extension: built.extension,
      previewRows: buildPreview(pages),
      originalSize: file.size,
      outputSize: built.blob.size,
    };
  } finally {
    await loadingTask.destroy();
  }
}

export function revokePdfToCsvResult(result: PdfToCsvResult | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadCsvFile(blob: Blob, sourceFile: File, extension: "csv" | "zip") {
  const base = sourceBaseName(sourceFile.name);
  const filename =
    extension === "zip" ? `${base}-csv.zip` : `${base}.csv`;
  downloadBlob(blob, filename);
}

export function describeOutput(result: PdfToCsvResult): string {
  const files =
    result.fileCount === 1
      ? "1 file"
      : `${result.fileCount} files`;
  return `${result.rowCount.toLocaleString()} row${result.rowCount === 1 ? "" : "s"} · ${result.columnCount} column${result.columnCount === 1 ? "" : "s"} · ${files} · ${formatFileSize(result.outputSize)}`;
}
