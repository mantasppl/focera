import { downloadBlob, fileBaseName } from "@/lib/image";

export type UnblurStrength = "light" | "medium" | "strong";

export type UnblurPreset = {
  strength: UnblurStrength;
  label: string;
  hint: string;
  /** Unsharp mask amount (how strongly high-pass is added back). */
  amount: number;
  /** Box-blur radius in pixels (larger = broader haze recovery). */
  radius: number;
  /** Ignore diffs below this to avoid boosting noise. */
  threshold: number;
  /** Extra sharpen pass after the main unsharp mask. */
  secondPass?: { amount: number; radius: number; threshold: number };
};

export const UNBLUR_PRESETS: UnblurPreset[] = [
  {
    strength: "light",
    label: "Light",
    hint: "Soft haze",
    amount: 0.85,
    radius: 1,
    threshold: 3,
  },
  {
    strength: "medium",
    label: "Medium",
    hint: "Everyday blur",
    amount: 1.25,
    radius: 2,
    threshold: 2,
  },
  {
    strength: "strong",
    label: "Strong",
    hint: "Heavy blur",
    amount: 1.55,
    radius: 3,
    threshold: 1,
    secondPass: { amount: 0.55, radius: 1, threshold: 4 },
  },
];

export type UnblurImageResult = {
  blob: Blob;
  width: number;
  height: number;
  strength: UnblurStrength;
};

export type UnblurImageOptions = {
  strength?: UnblurStrength;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Unblur cancelled.", "AbortError");
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

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }
  return ctx;
}

function getPreset(strength: UnblurStrength): UnblurPreset {
  return (
    UNBLUR_PRESETS.find((preset) => preset.strength === strength) ??
    UNBLUR_PRESETS[1]
  );
}

/**
 * Separable box blur into `out` (RGBA). Alpha is copied from source.
 * Uses a sliding-window sum so large radii stay reasonably fast.
 */
function boxBlurSeparable(
  src: Uint8ClampedArray,
  out: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
  temp: Float32Array,
) {
  const r = Math.max(1, Math.floor(radius));
  const windowSize = r * 2 + 1;

  // Horizontal pass → temp (RGB only, as float).
  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;

    for (let kx = -r; kx <= r; kx += 1) {
      const x = Math.min(width - 1, Math.max(0, kx));
      const i = (row + x) * 4;
      sumR += src[i];
      sumG += src[i + 1];
      sumB += src[i + 2];
    }

    for (let x = 0; x < width; x += 1) {
      const t = (row + x) * 3;
      temp[t] = sumR / windowSize;
      temp[t + 1] = sumG / windowSize;
      temp[t + 2] = sumB / windowSize;

      const leaveX = Math.min(width - 1, Math.max(0, x - r));
      const enterX = Math.min(width - 1, Math.max(0, x + r + 1));
      const leave = (row + leaveX) * 4;
      const enter = (row + enterX) * 4;
      sumR += src[enter] - src[leave];
      sumG += src[enter + 1] - src[leave + 1];
      sumB += src[enter + 2] - src[leave + 2];
    }
  }

  // Vertical pass → out.
  for (let x = 0; x < width; x += 1) {
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;

    for (let ky = -r; ky <= r; ky += 1) {
      const y = Math.min(height - 1, Math.max(0, ky));
      const t = (y * width + x) * 3;
      sumR += temp[t];
      sumG += temp[t + 1];
      sumB += temp[t + 2];
    }

    for (let y = 0; y < height; y += 1) {
      const o = (y * width + x) * 4;
      out[o] = sumR / windowSize;
      out[o + 1] = sumG / windowSize;
      out[o + 2] = sumB / windowSize;
      out[o + 3] = src[o + 3];

      const leaveY = Math.min(height - 1, Math.max(0, y - r));
      const enterY = Math.min(height - 1, Math.max(0, y + r + 1));
      const leave = (leaveY * width + x) * 3;
      const enter = (enterY * width + x) * 3;
      sumR += temp[enter] - temp[leave];
      sumG += temp[enter + 1] - temp[leave + 1];
      sumB += temp[enter + 2] - temp[leave + 2];
    }
  }
}

/** Unsharp mask: original + amount × (original − blurred). */
function applyUnsharpMask(
  canvas: HTMLCanvasElement,
  amount: number,
  radius: number,
  threshold: number,
): void {
  const ctx = getContext(canvas);
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const src = imageData.data;
  const copy = new Uint8ClampedArray(src);
  const blurred = new Uint8ClampedArray(src.length);
  const temp = new Float32Array(width * height * 3);

  boxBlurSeparable(copy, blurred, width, height, radius, temp);

  for (let i = 0; i < src.length; i += 4) {
    for (let c = 0; c < 3; c += 1) {
      const diff = copy[i + c] - blurred[i + c];
      if (Math.abs(diff) > threshold) {
        src[i + c] = Math.min(
          255,
          Math.max(0, Math.round(copy[i + c] + diff * amount)),
        );
      }
    }
    src[i + 3] = copy[i + 3];
  }

  ctx.putImageData(imageData, 0, 0);
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not export the unblurred image."));
          return;
        }
        resolve(blob);
      },
      "image/png",
    );
  });
}

export function strengthLabel(strength: UnblurStrength): string {
  return getPreset(strength).label.toLowerCase();
}

export function downloadUnblurredImage(
  blob: Blob,
  sourceFile: File,
  strength: UnblurStrength,
) {
  downloadBlob(
    blob,
    `${fileBaseName(sourceFile)}-unblurred-${strength}.png`,
  );
}

export async function unblurImageFile(
  file: File,
  options: UnblurImageOptions = {},
): Promise<UnblurImageResult> {
  const strength = options.strength ?? "medium";
  const preset = getPreset(strength);
  const { onProgress, signal } = options;

  throwIfAborted(signal);
  onProgress?.("Loading image…");
  const image = await loadImage(file);
  throwIfAborted(signal);

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  if (!width || !height) {
    throw new Error("Could not determine image dimensions.");
  }

  onProgress?.("Preparing image…");
  const canvas = createCanvas(width, height);
  const ctx = getContext(canvas);
  ctx.drawImage(image, 0, 0, width, height);

  throwIfAborted(signal);
  onProgress?.(`Sharpening (${preset.label.toLowerCase()})…`);
  applyUnsharpMask(canvas, preset.amount, preset.radius, preset.threshold);

  if (preset.secondPass) {
    throwIfAborted(signal);
    onProgress?.("Refining edges…");
    applyUnsharpMask(
      canvas,
      preset.secondPass.amount,
      preset.secondPass.radius,
      preset.secondPass.threshold,
    );
  }

  throwIfAborted(signal);
  onProgress?.("Exporting PNG…");
  const blob = await canvasToPngBlob(canvas);
  canvas.width = 0;
  canvas.height = 0;

  return {
    blob,
    width,
    height,
    strength,
  };
}
