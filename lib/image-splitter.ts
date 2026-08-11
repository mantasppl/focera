import JSZip from "jszip";
import { downloadBlob, fileBaseName } from "@/lib/image";

export const MIN_GRID = 1;
export const MAX_GRID = 10;

export type SplitGridPreset = {
  id: string;
  label: string;
  hint: string;
  rows: number;
  cols: number;
};

export const SPLIT_GRID_PRESETS: SplitGridPreset[] = [
  { id: "2x2", label: "2×2", hint: "4 pieces", rows: 2, cols: 2 },
  { id: "3x3", label: "3×3", hint: "9 pieces", rows: 3, cols: 3 },
  { id: "4x4", label: "4×4", hint: "16 pieces", rows: 4, cols: 4 },
  { id: "1x2", label: "1×2", hint: "Side by side", rows: 1, cols: 2 },
  { id: "2x1", label: "2×1", hint: "Top & bottom", rows: 2, cols: 1 },
  { id: "1x3", label: "1×3", hint: "3 columns", rows: 1, cols: 3 },
];

export type ImagePiece = {
  index: number;
  row: number;
  col: number;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  x: number;
  y: number;
};

export type SplitImageResult = {
  pieces: ImagePiece[];
  rows: number;
  cols: number;
  originalWidth: number;
  originalHeight: number;
};

export type SplitImageOptions = {
  rows: number;
  cols: number;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Split cancelled.", "AbortError");
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image. Try another file."));
    };
    image.src = url;
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export an image piece."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export function clampGridValue(value: number): number {
  if (!Number.isFinite(value)) return MIN_GRID;
  return Math.min(MAX_GRID, Math.max(MIN_GRID, Math.round(value)));
}

export function pieceCount(rows: number, cols: number): number {
  return clampGridValue(rows) * clampGridValue(cols);
}

export function describeSplit(
  originalWidth: number,
  originalHeight: number,
  rows: number,
  cols: number,
): string {
  return `${originalWidth}×${originalHeight} · ${rows}×${cols} · ${rows * cols} pieces`;
}

export async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const image = await loadImage(file);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) {
    throw new Error("Could not determine image dimensions.");
  }
  return { width, height };
}

/** Slice bounds for a cell; last row/col absorb remainder pixels. */
export function cellBounds(
  imageWidth: number,
  imageHeight: number,
  rows: number,
  cols: number,
  row: number,
  col: number,
): { x: number; y: number; width: number; height: number } {
  const safeRows = clampGridValue(rows);
  const safeCols = clampGridValue(cols);
  const baseW = Math.floor(imageWidth / safeCols);
  const baseH = Math.floor(imageHeight / safeRows);
  const x = col * baseW;
  const y = row * baseH;
  const width = col === safeCols - 1 ? imageWidth - x : baseW;
  const height = row === safeRows - 1 ? imageHeight - y : baseH;
  return { x, y, width, height };
}

export function revokePieces(pieces: ImagePiece[]) {
  for (const piece of pieces) {
    URL.revokeObjectURL(piece.url);
  }
}

export function downloadPiece(
  piece: ImagePiece,
  sourceFile: File,
  rows: number,
  cols: number,
) {
  const padded = String(piece.index + 1).padStart(2, "0");
  downloadBlob(
    piece.blob,
    `${fileBaseName(sourceFile)}-piece-${padded}-r${piece.row + 1}c${piece.col + 1}-${rows}x${cols}.png`,
  );
}

export async function downloadAllPiecesZip(
  pieces: ImagePiece[],
  sourceFile: File,
  rows: number,
  cols: number,
) {
  const zip = new JSZip();
  const safeBase = fileBaseName(sourceFile) || "image";

  for (const piece of pieces) {
    const padded = String(piece.index + 1).padStart(2, "0");
    zip.file(
      `${safeBase}-piece-${padded}-r${piece.row + 1}c${piece.col + 1}.png`,
      piece.blob,
    );
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, `${safeBase}-split-${rows}x${cols}.zip`);
}

export async function splitImageFile(
  file: File,
  options: SplitImageOptions,
): Promise<SplitImageResult> {
  const { onProgress, signal } = options;
  const rows = clampGridValue(options.rows);
  const cols = clampGridValue(options.cols);

  if (rows < MIN_GRID || cols < MIN_GRID) {
    throw new Error(`Choose at least ${MIN_GRID} row and column.`);
  }
  if (rows === 1 && cols === 1) {
    throw new Error("Choose more than one piece — pick a 2×2 grid or similar.");
  }

  throwIfAborted(signal);
  onProgress?.("Loading image…");
  const image = await loadImage(file);
  throwIfAborted(signal);

  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;
  if (!originalWidth || !originalHeight) {
    throw new Error("Could not determine image dimensions.");
  }

  if (originalWidth < cols || originalHeight < rows) {
    throw new Error(
      "Image is too small for this grid. Use fewer rows or columns.",
    );
  }

  const total = rows * cols;
  const pieces: ImagePiece[] = [];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  let index = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      throwIfAborted(signal);
      onProgress?.(`Cutting piece ${index + 1} of ${total}…`);

      const bounds = cellBounds(
        originalWidth,
        originalHeight,
        rows,
        cols,
        row,
        col,
      );
      if (bounds.width < 1 || bounds.height < 1) {
        throw new Error("Could not cut a valid piece from this image.");
      }

      canvas.width = bounds.width;
      canvas.height = bounds.height;
      ctx.clearRect(0, 0, bounds.width, bounds.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        image,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        0,
        0,
        bounds.width,
        bounds.height,
      );

      const blob = await canvasToPngBlob(canvas);
      pieces.push({
        index,
        row,
        col,
        blob,
        url: URL.createObjectURL(blob),
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
      });
      index += 1;
    }
  }

  canvas.width = 0;
  canvas.height = 0;
  onProgress?.("Done.");

  return {
    pieces,
    rows,
    cols,
    originalWidth,
    originalHeight,
  };
}
