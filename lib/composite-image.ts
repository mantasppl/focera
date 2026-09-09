export const BLUR_RADIUS = { min: 4, max: 48, step: 2, default: 18 } as const;

/** Safari exposes `ctx.filter` but leaves it disabled — detect real blur. */
let canvasFilterBlurSupported: boolean | null = null;

function supportsCanvasFilterBlur(): boolean {
  if (canvasFilterBlurSupported != null) return canvasFilterBlurSupported;
  if (typeof document === "undefined") {
    canvasFilterBlurSupported = false;
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || typeof ctx.filter === "undefined") {
      canvasFilterBlurSupported = false;
      return false;
    }

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 16, 16);
    ctx.filter = "blur(6px)";
    ctx.fillStyle = "#000";
    ctx.fillRect(6, 6, 4, 4);
    ctx.filter = "none";

    // If blur applied, ink spreads into the corner sample.
    const sample = ctx.getImageData(0, 0, 1, 1).data[0];
    canvasFilterBlurSupported = sample < 250;
    return canvasFilterBlurSupported;
  } catch {
    canvasFilterBlurSupported = false;
    return false;
  }
}

/**
 * Draw `image` into `ctx` with soft blur. Uses canvas filters when available;
 * falls back to downsample→upsample (Safari / iOS ignore `ctx.filter`).
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

  if (supportsCanvasFilterBlur()) {
    ctx.filter = `blur(${radius}px)`;
    ctx.drawImage(image, 0, 0, width, height);
    ctx.filter = "none";
    return;
  }

  // Map slider px ≈ visual softness via shrink factor (bilinear upsample).
  const shrink = Math.max(2, Math.min(48, Math.round(radius * 0.9)));
  const smallW = Math.max(1, Math.round(width / shrink));
  const smallH = Math.max(1, Math.round(height / shrink));
  const small = document.createElement("canvas");
  small.width = smallW;
  small.height = smallH;
  const smallCtx = small.getContext("2d");
  if (!smallCtx) {
    ctx.drawImage(image, 0, 0, width, height);
    return;
  }

  smallCtx.drawImage(image, 0, 0, smallW, smallH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(small, 0, 0, smallW, smallH, 0, 0, width, height);
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
