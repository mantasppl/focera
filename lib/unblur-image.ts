import { downloadBlob, fileBaseName } from "@/lib/image";

export type UnblurStrength = "light" | "medium" | "strong";

type DeconvSettings = {
  /** Assumed blur size as a fraction of the shortest side. */
  radiusFraction: number;
  minRadius: number;
  maxRadius: number;
  /** Van Cittert iterations — more = stronger deblur. */
  iterations: number;
  /** Residual gain per iteration (0–1). */
  gain: number;
  /** Box-blur repeats used to approximate the PSF (3 ≈ Gaussian). */
  psfPasses: number;
};

type SharpenSettings = {
  /** 3×3 sharpen mix (0 = none, 1 = full high-pass kernel). */
  amount: number;
};

export type UnblurPreset = {
  strength: UnblurStrength;
  label: string;
  hint: string;
  deconv: DeconvSettings;
  sharpen: SharpenSettings;
};

/**
 * Deconvolution radius scales with image size so a 12MP photo is not
 * sharpened by 1–2px (invisible in the preview). Van Cittert actually
 * undoes blur; a tight unsharp pass then restores edge bite.
 */
export const UNBLUR_PRESETS: UnblurPreset[] = [
  {
    strength: "light",
    label: "Light",
    hint: "Soft haze",
    deconv: {
      radiusFraction: 0.005,
      minRadius: 2,
      maxRadius: 9,
      iterations: 7,
      gain: 0.68,
      psfPasses: 3,
    },
    sharpen: { amount: 0.45 },
  },
  {
    strength: "medium",
    label: "Medium",
    hint: "Everyday blur",
    deconv: {
      radiusFraction: 0.008,
      minRadius: 3,
      maxRadius: 14,
      iterations: 12,
      gain: 0.84,
      psfPasses: 3,
    },
    sharpen: { amount: 0.7 },
  },
  {
    strength: "strong",
    label: "Strong",
    hint: "Heavy blur",
    deconv: {
      radiusFraction: 0.011,
      minRadius: 4,
      maxRadius: 20,
      iterations: 16,
      gain: 0.92,
      psfPasses: 3,
    },
    sharpen: { amount: 0.9 },
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

async function yieldToMain(signal?: AbortSignal) {
  throwIfAborted(signal);
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });
  throwIfAborted(signal);
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

function scaledRadius(
  width: number,
  height: number,
  fraction: number,
  minRadius: number,
  maxRadius: number,
): number {
  const minSide = Math.min(width, height);
  return Math.round(
    Math.min(maxRadius, Math.max(minRadius, minSide * fraction)),
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

function blurImage(
  src: Uint8ClampedArray,
  out: Uint8ClampedArray,
  scratch: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
  iterations: number,
  temp: Float32Array,
) {
  const n = Math.max(1, Math.floor(iterations));
  let from = src;
  let to = out;

  for (let i = 0; i < n; i += 1) {
    boxBlurSeparable(from, to, width, height, radius, temp);
    if (i === n - 1) {
      if (to !== out) {
        out.set(to);
      }
      return;
    }
    const nextFrom = to;
    to = from === src ? scratch : from;
    from = nextFrom;
  }
}

/**
 * Van Cittert iteration: estimate += gain × (observed − blur(estimate)).
 * Repeating this with a PSF similar to the blur actually tightens edges.
 */
function vanCittertStep(
  observed: Uint8ClampedArray,
  estimate: Uint8ClampedArray,
  blurred: Uint8ClampedArray,
  scratch: Uint8ClampedArray,
  temp: Float32Array,
  width: number,
  height: number,
  radius: number,
  gain: number,
  psfPasses: number,
) {
  blurImage(
    estimate,
    blurred,
    scratch,
    width,
    height,
    radius,
    psfPasses,
    temp,
  );

  for (let i = 0; i < estimate.length; i += 4) {
    for (let c = 0; c < 3; c += 1) {
      const next = estimate[i + c] + gain * (observed[i + c] - blurred[i + c]);
      estimate[i + c] = Math.min(255, Math.max(0, Math.round(next)));
    }
  }
}

/** 3×3 sharpen: center × (1+4a) − a × (N+S+E+W). */
function applySharpenKernel(
  pixels: Uint8ClampedArray,
  copy: Uint8ClampedArray,
  width: number,
  height: number,
  amount: number,
) {
  if (amount <= 0) return;
  copy.set(pixels);

  for (let y = 0; y < height; y += 1) {
    const yUp = Math.max(0, y - 1);
    const yDown = Math.min(height - 1, y + 1);
    for (let x = 0; x < width; x += 1) {
      const xLeft = Math.max(0, x - 1);
      const xRight = Math.min(width - 1, x + 1);
      const i = (y * width + x) * 4;
      for (let c = 0; c < 3; c += 1) {
        const center = copy[i + c];
        const up = copy[(yUp * width + x) * 4 + c];
        const down = copy[(yDown * width + x) * 4 + c];
        const left = copy[(y * width + xLeft) * 4 + c];
        const right = copy[(y * width + xRight) * 4 + c];
        const next = center * (1 + 4 * amount) - amount * (up + down + left + right);
        pixels[i + c] = Math.min(255, Math.max(0, Math.round(next)));
      }
    }
  }
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export the unblurred image."));
        return;
      }
      resolve(blob);
    }, "image/png");
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
  await yieldToMain(signal);
  const canvas = createCanvas(width, height);
  const ctx = getContext(canvas);
  ctx.drawImage(image, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const observed = new Uint8ClampedArray(pixels);
  const blurred = new Uint8ClampedArray(pixels.length);
  const scratch = new Uint8ClampedArray(pixels.length);
  const temp = new Float32Array(width * height * 3);

  const deconvRadius = scaledRadius(
    width,
    height,
    preset.deconv.radiusFraction,
    preset.deconv.minRadius,
    preset.deconv.maxRadius,
  );

  for (let step = 0; step < preset.deconv.iterations; step += 1) {
    throwIfAborted(signal);
    if (step === 0 || step % 3 === 0) {
      onProgress?.(
        `Deblurring (${preset.label.toLowerCase()}) ${step + 1}/${preset.deconv.iterations}…`,
      );
      await yieldToMain(signal);
    }

    vanCittertStep(
      observed,
      pixels,
      blurred,
      scratch,
      temp,
      width,
      height,
      deconvRadius,
      preset.deconv.gain,
      preset.deconv.psfPasses,
    );
  }

  throwIfAborted(signal);
  onProgress?.("Refining edges…");
  await yieldToMain(signal);

  applySharpenKernel(
    pixels,
    observed,
    width,
    height,
    preset.sharpen.amount,
  );

  ctx.putImageData(imageData, 0, 0);

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
