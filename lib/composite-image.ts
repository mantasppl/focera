export const BLUR_RADIUS = { min: 4, max: 48, step: 2, default: 18 } as const;

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

  const radius = Math.max(0, blurRadius);
  ctx.filter = radius > 0 ? `blur(${radius}px)` : "none";
  ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
  ctx.filter = "none";
  ctx.drawImage(fg, 0, 0);

  return canvasToBlob(canvas);
}
