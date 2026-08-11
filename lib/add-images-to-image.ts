import {
  ACCEPTED_IMAGE_TYPES,
  downloadBlob,
  fileBaseName,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
  validateImageFile,
} from "@/lib/image";

export const ACCEPTED_OVERLAY_TYPES = ACCEPTED_IMAGE_TYPES;
export const MAX_OVERLAY_FILES = 5;
export const MAX_OVERLAY_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;
export const MAX_OVERLAY_TOTAL_BYTES = 50 * 1024 * 1024;

export const MIN_SCALE = 0.05;
export const MAX_SCALE = 1;
export const DEFAULT_SCALE = 0.35;
export const MIN_OPACITY = 0.05;
export const MAX_OPACITY = 1;
export const DEFAULT_OPACITY = 1;

export type OverlayPosition =
  | "center"
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type OverlayPositionOption = {
  value: OverlayPosition;
  label: string;
  hint: string;
};

export const OVERLAY_POSITIONS: OverlayPositionOption[] = [
  { value: "center", label: "Center", hint: "Middle" },
  { value: "top-left", label: "Top left", hint: "Corner" },
  { value: "top-center", label: "Top center", hint: "Header" },
  { value: "top-right", label: "Top right", hint: "Corner" },
  { value: "bottom-left", label: "Bottom left", hint: "Footer" },
  { value: "bottom-center", label: "Bottom center", hint: "Footer" },
  { value: "bottom-right", label: "Bottom right", hint: "Footer" },
];

export type OverlayRotation = 0 | 45 | -45;

export type OverlayRotationOption = {
  value: OverlayRotation;
  label: string;
  hint: string;
};

export const OVERLAY_ROTATIONS: OverlayRotationOption[] = [
  { value: 0, label: "None", hint: "Upright" },
  { value: 45, label: "45°", hint: "Diagonal" },
  { value: -45, label: "-45°", hint: "Diagonal" },
];

export type OverlayPlacement = {
  position: OverlayPosition;
  /** Overlay width as a fraction of base image width (0.05–1). */
  scale: number;
  /** 0–1 */
  opacity: number;
  rotation: OverlayRotation;
};

export type OverlayLayerInput = {
  file: File;
  placement: OverlayPlacement;
};

export type AddImagesToImageResult = {
  blob: Blob;
  width: number;
  height: number;
  overlayCount: number;
};

export type AddImagesToImageOptions = {
  overlays: OverlayLayerInput[];
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

export type DrawOverlayLayer = {
  image: CanvasImageSource;
  naturalWidth: number;
  naturalHeight: number;
  placement: OverlayPlacement;
};

const MARGIN_RATIO = 0.04;

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Overlay cancelled.", "AbortError");
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampScale(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SCALE;
  return clamp(value, MIN_SCALE, MAX_SCALE);
}

export function clampOpacity(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_OPACITY;
  return clamp(value, MIN_OPACITY, MAX_OPACITY);
}

export function defaultPlacement(): OverlayPlacement {
  return {
    position: "center",
    scale: DEFAULT_SCALE,
    opacity: DEFAULT_OPACITY,
    rotation: 0,
  };
}

export function validateOverlayFile(file: File): string | null {
  return validateImageFile(file);
}

export function validateOverlayAddition(
  incoming: File[],
  existing: File[],
): string | null {
  if (incoming.length === 0) {
    return "Please upload at least one overlay image.";
  }

  for (const file of incoming) {
    const singleError = validateOverlayFile(file);
    if (singleError) {
      return singleError;
    }
  }

  const nextCount = existing.length + incoming.length;
  if (nextCount > MAX_OVERLAY_FILES) {
    return `You can add up to ${MAX_OVERLAY_FILES} overlay images at a time.`;
  }

  const existingTotal = existing.reduce((sum, file) => sum + file.size, 0);
  const incomingTotal = incoming.reduce((sum, file) => sum + file.size, 0);
  if (existingTotal + incomingTotal > MAX_OVERLAY_TOTAL_BYTES) {
    return `Overlay images must total ${formatFileSize(MAX_OVERLAY_TOTAL_BYTES)} or less.`;
  }

  return null;
}

export function loadImageElement(file: File): Promise<HTMLImageElement> {
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
      reject(
        new Error(
          `"${file.name}" could not be read. Try another JPG, PNG, or WebP.`,
        ),
      );
    };
    image.src = url;
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export the composed image."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function stampSize(
  baseWidth: number,
  imageWidth: number,
  imageHeight: number,
  scale: number,
): { width: number; height: number } {
  const width = Math.max(1, baseWidth * scale);
  const height = Math.max(1, width * (imageHeight / Math.max(1, imageWidth)));
  return { width, height };
}

function positionStamp(
  position: OverlayPosition,
  baseWidth: number,
  baseHeight: number,
  stampWidth: number,
  stampHeight: number,
): { x: number; y: number } {
  const margin = Math.max(8, Math.min(baseWidth, baseHeight) * MARGIN_RATIO);

  switch (position) {
    case "top-left":
      return { x: margin, y: margin };
    case "top-center":
      return { x: (baseWidth - stampWidth) / 2, y: margin };
    case "top-right":
      return { x: baseWidth - stampWidth - margin, y: margin };
    case "bottom-left":
      return { x: margin, y: baseHeight - stampHeight - margin };
    case "bottom-center":
      return {
        x: (baseWidth - stampWidth) / 2,
        y: baseHeight - stampHeight - margin,
      };
    case "bottom-right":
      return {
        x: baseWidth - stampWidth - margin,
        y: baseHeight - stampHeight - margin,
      };
    case "center":
    default:
      return {
        x: (baseWidth - stampWidth) / 2,
        y: (baseHeight - stampHeight) / 2,
      };
  }
}

function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: DrawOverlayLayer,
  baseWidth: number,
  baseHeight: number,
  renderScale: number,
) {
  const scale = clampScale(layer.placement.scale);
  const opacity = clampOpacity(layer.placement.opacity);
  const { width, height } = stampSize(
    baseWidth,
    layer.naturalWidth,
    layer.naturalHeight,
    scale,
  );
  const { x, y } = positionStamp(
    layer.placement.position,
    baseWidth,
    baseHeight,
    width,
    height,
  );

  const cx = (x + width / 2) * renderScale;
  const cy = (y + height / 2) * renderScale;
  const drawW = width * renderScale;
  const drawH = height * renderScale;
  const radians = (layer.placement.rotation * Math.PI) / 180;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(cx, cy);
  if (radians !== 0) {
    ctx.rotate(radians);
  }
  ctx.drawImage(layer.image, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

/** Draw the base image and overlay layers onto an existing canvas (full or preview size). */
export function drawOverlaysOnCanvas(
  ctx: CanvasRenderingContext2D,
  base: CanvasImageSource,
  baseWidth: number,
  baseHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  layers: DrawOverlayLayer[],
) {
  const renderScale = Math.min(
    canvasWidth / baseWidth,
    canvasHeight / baseHeight,
  );

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.globalAlpha = 1;
  ctx.drawImage(
    base,
    0,
    0,
    baseWidth,
    baseHeight,
    0,
    0,
    canvasWidth,
    canvasHeight,
  );

  for (const layer of layers) {
    drawLayer(ctx, layer, baseWidth, baseHeight, renderScale);
  }

  ctx.globalAlpha = 1;
}

export function downloadComposedImage(blob: Blob, baseFile: File) {
  downloadBlob(blob, `${fileBaseName(baseFile)}-overlay.png`);
}

export async function addImagesToImage(
  baseFile: File,
  options: AddImagesToImageOptions,
): Promise<AddImagesToImageResult> {
  const { overlays, onProgress, signal } = options;

  if (overlays.length === 0) {
    throw new Error("Add at least one overlay image.");
  }

  throwIfAborted(signal);
  onProgress?.("Loading base image…");
  const baseImage = await loadImageElement(baseFile);
  throwIfAborted(signal);

  const baseWidth = baseImage.naturalWidth || baseImage.width;
  const baseHeight = baseImage.naturalHeight || baseImage.height;
  if (!baseWidth || !baseHeight) {
    throw new Error("Could not determine base image dimensions.");
  }

  const layers: DrawOverlayLayer[] = [];
  for (let i = 0; i < overlays.length; i += 1) {
    throwIfAborted(signal);
    onProgress?.(`Loading overlay ${i + 1} of ${overlays.length}…`);
    const overlay = overlays[i]!;
    const image = await loadImageElement(overlay.file);
    const naturalWidth = image.naturalWidth || image.width;
    const naturalHeight = image.naturalHeight || image.height;
    if (!naturalWidth || !naturalHeight) {
      throw new Error(
        `"${overlay.file.name}" could not be measured. Try another file.`,
      );
    }
    layers.push({
      image,
      naturalWidth,
      naturalHeight,
      placement: {
        position: overlay.placement.position,
        scale: clampScale(overlay.placement.scale),
        opacity: clampOpacity(overlay.placement.opacity),
        rotation: overlay.placement.rotation,
      },
    });
  }

  throwIfAborted(signal);
  onProgress?.("Composing image…");

  const canvas = document.createElement("canvas");
  canvas.width = baseWidth;
  canvas.height = baseHeight;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  drawOverlaysOnCanvas(
    ctx,
    baseImage,
    baseWidth,
    baseHeight,
    baseWidth,
    baseHeight,
    layers,
  );

  throwIfAborted(signal);
  onProgress?.("Encoding PNG…");
  const blob = await canvasToPngBlob(canvas);
  canvas.width = 0;
  canvas.height = 0;

  return {
    blob,
    width: baseWidth,
    height: baseHeight,
    overlayCount: overlays.length,
  };
}
