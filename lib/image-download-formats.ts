import { downloadBlob } from "@/lib/image";

export type ImageDownloadFormat = "jpg" | "png" | "webp";

export const IMAGE_DOWNLOAD_FORMATS: Array<{
  value: ImageDownloadFormat;
  label: string;
  hint: string;
}> = [
  {
    value: "jpg",
    label: "JPG",
    hint: "Smaller file size, great for photos",
  },
  {
    value: "png",
    label: "PNG",
    hint: "Lossless quality, supports transparency",
  },
  {
    value: "webp",
    label: "WebP",
    hint: "Modern format, best compression",
  },
];

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not encode image."));
      },
      type,
      quality,
    );
  });
}

export async function encodeImageForDownload(
  source: Blob,
  format: ImageDownloadFormat,
): Promise<Blob> {
  if (format === "jpg" && source.type === "image/jpeg") return source;
  if (format === "png" && source.type === "image/png") return source;
  if (format === "webp" && source.type === "image/webp") return source;

  const bitmap = await createImageBitmap(source);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d", { alpha: format !== "jpg" });
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas is not supported in this browser.");
  }

  if (format === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const mimeType =
    format === "jpg"
      ? "image/jpeg"
      : format === "webp"
        ? "image/webp"
        : "image/png";
  const blob = await canvasToBlob(canvas, mimeType, 0.92);
  canvas.width = 0;
  canvas.height = 0;
  return blob;
}

/** Download a raster image blob in the chosen format. Filename should omit extension. */
export async function downloadImageInFormat(
  blob: Blob,
  filenameWithoutExtension: string,
  format: ImageDownloadFormat = "png",
): Promise<void> {
  const encoded = await encodeImageForDownload(blob, format);
  const base = filenameWithoutExtension.replace(/\.(jpe?g|png|webp)$/i, "");
  downloadBlob(encoded, `${base}.${format}`);
}
