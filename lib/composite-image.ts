export const BLUR_RADIUS = { min: 4, max: 48, step: 2, default: 18 } as const;

/** Slider values are authored against this preview width. */
const BLUR_REFERENCE_EDGE = 720;

function resolveBlurRadius(
  sliderPx: number,
  width: number,
  height: number,
): number {
  const longEdge = Math.max(width, height);
  return Math.max(1, sliderPx * (longEdge / BLUR_REFERENCE_EDGE));
}

/**
 * Separable box blur into `out` (RGBA). Alpha is copied from source.
 * Three passes approximate a Gaussian. Sliding-window sums keep large radii fast.
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

/** Three stacked box blurs ≈ Gaussian. Mutates the canvas pixels. */
function applyGaussianBlur(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.max(1, Math.round(radius));
  const image = ctx.getImageData(0, 0, width, height);
  const a = image.data;
  const b = new Uint8ClampedArray(a.length);
  const temp = new Float32Array(width * height * 3);

  boxBlurSeparable(a, b, width, height, r, temp);
  boxBlurSeparable(b, a, width, height, r, temp);
  boxBlurSeparable(a, b, width, height, r, temp);
  a.set(b);
  ctx.putImageData(image, 0, 0);
}

function enableHighQualitySmoothing(ctx: CanvasRenderingContext2D) {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

/**
 * Approximate a Gaussian by blurring a moderately scaled buffer, then
 * upsampling. Never mosaic-shrink — that reads as square pixels.
 */
function drawGaussianBlur(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  radius: number,
) {
  const maxWorkEdge = 1600;
  const longEdge = Math.max(width, height);
  const scale = Math.min(1, maxWorkEdge / longEdge);
  const workW = Math.max(1, Math.round(width * scale));
  const workH = Math.max(1, Math.round(height * scale));
  const workRadius = Math.max(1, radius * (workW / width));

  const work = document.createElement("canvas");
  work.width = workW;
  work.height = workH;
  const workCtx = work.getContext("2d", { willReadFrequently: true });
  if (!workCtx) {
    ctx.drawImage(image, 0, 0, width, height);
    return;
  }

  enableHighQualitySmoothing(workCtx);
  workCtx.drawImage(image, 0, 0, workW, workH);
  applyGaussianBlur(workCtx, workW, workH, workRadius);

  enableHighQualitySmoothing(ctx);
  ctx.drawImage(work, 0, 0, workW, workH, 0, 0, width, height);
}

/**
 * Draw `image` into `ctx` with a natural Gaussian blur.
 * Avoids mosaic downsample/upsample, which reads as square pixels.
 */
function drawBlurredImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  radius: number,
): void {
  if (radius <= 0) {
    ctx.drawImage(image, 0, 0, width, height);
    return;
  }

  drawGaussianBlur(
    ctx,
    image,
    width,
    height,
    resolveBlurRadius(radius, width, height),
  );
}

function loadImage(source: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export image"));
      },
      "image/png",
      1,
    );
  });
}

function drawBackgroundCover(
  ctx: CanvasRenderingContext2D,
  background: HTMLImageElement,
  width: number,
  height: number,
): void {
  const scale = Math.max(width / background.width, height / background.height);
  const drawWidth = background.width * scale;
  const drawHeight = background.height * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;
  ctx.drawImage(background, x, y, drawWidth, drawHeight);
}

export async function compositeOnColor(
  foreground: Blob,
  color: string,
): Promise<Blob> {
  const fg = await loadImage(foreground);
  const canvas = document.createElement("canvas");
  canvas.width = fg.naturalWidth;
  canvas.height = fg.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser");

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(fg, 0, 0);

  return canvasToBlob(canvas);
}

export async function compositeOnImage(
  foreground: Blob,
  background: Blob,
): Promise<Blob> {
  const [fg, bg] = await Promise.all([
    loadImage(foreground),
    loadImage(background),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = fg.naturalWidth;
  canvas.height = fg.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser");

  drawBackgroundCover(ctx, bg, canvas.width, canvas.height);
  ctx.drawImage(fg, 0, 0);

  return canvasToBlob(canvas);
}

export async function compositeWithBlur(
  original: Blob,
  foreground: Blob,
  blurRadius: number,
): Promise<Blob> {
  const [originalImage, fg] = await Promise.all([
    loadImage(original),
    loadImage(foreground),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = fg.naturalWidth;
  canvas.height = fg.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser");

  drawBlurredImage(
    ctx,
    originalImage,
    canvas.width,
    canvas.height,
    Math.max(0, blurRadius),
  );
  ctx.drawImage(fg, 0, 0);

  return canvasToBlob(canvas);
}
