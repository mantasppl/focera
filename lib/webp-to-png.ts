import JSZip from "jszip";
import { downloadBlob, formatFileSize } from "@/lib/image";

export const ACCEPTED_WEBP_TYPES = ["image/webp"] as const;
export const MAX_WEBP_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_WEBP_FRAMES = 300;

export type ConvertedFrame = {
  frameNumber: number;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  durationMs: number | null;
};

export type ConvertWebpOptions = {
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
};

function isImageDecoderSupported(): boolean {
  return typeof ImageDecoder !== "undefined";
}

export function validateWebpFile(file: File): string | null {
  const isWebp =
    ACCEPTED_WEBP_TYPES.includes(file.type as (typeof ACCEPTED_WEBP_TYPES)[number]) ||
    file.name.toLowerCase().endsWith(".webp");

  if (!isWebp) {
    return "Please upload a WebP file.";
  }

  if (file.size > MAX_WEBP_SIZE_BYTES) {
    return `WebP must be ${formatFileSize(MAX_WEBP_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("Could not encode PNG."));
    }, "image/png");
  });
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

async function convertStaticWebpFallback(
  file: File,
  signal?: AbortSignal,
): Promise<ConvertedFrame[]> {
  throwIfAborted(signal);

  const bitmap = await createImageBitmap(file);
  try {
    throwIfAborted(signal);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not supported in this browser.");
    }

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    // Preserve transparency — do not fill a background
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0);

    const blob = await canvasToPngBlob(canvas);
    return [
      {
        frameNumber: 1,
        blob,
        url: URL.createObjectURL(blob),
        width: canvas.width,
        height: canvas.height,
        durationMs: null,
      },
    ];
  } finally {
    bitmap.close();
  }
}

export async function convertWebpToPngFrames(
  file: File,
  options: ConvertWebpOptions = {},
): Promise<ConvertedFrame[]> {
  throwIfAborted(options.signal);

  if (!isImageDecoderSupported()) {
    options.onProgress?.(1, 1);
    return convertStaticWebpFallback(file, options.signal);
  }

  const supported = await ImageDecoder.isTypeSupported("image/webp");
  if (!supported) {
    options.onProgress?.(1, 1);
    return convertStaticWebpFallback(file, options.signal);
  }

  const data = await file.arrayBuffer();
  throwIfAborted(options.signal);

  const decoder = new ImageDecoder({
    data,
    type: "image/webp",
    preferAnimation: true,
  });

  const frames: ConvertedFrame[] = [];

  try {
    await decoder.tracks.ready;
    await decoder.completed;
    throwIfAborted(options.signal);

    const track = decoder.tracks.selectedTrack;
    if (!track) {
      throw new Error("Could not read frames from this WebP.");
    }

    const frameCount = track.frameCount;
    if (frameCount < 1) {
      throw new Error("This WebP has no decodable frames.");
    }

    if (frameCount > MAX_WEBP_FRAMES) {
      throw new Error(
        `This WebP has ${frameCount} frames. Please use a file with ${MAX_WEBP_FRAMES} frames or fewer.`,
      );
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not supported in this browser.");
    }

    for (let index = 0; index < frameCount; index += 1) {
      throwIfAborted(options.signal);
      options.onProgress?.(index + 1, frameCount);

      const result = await decoder.decode({ frameIndex: index });
      const videoFrame = result.image;

      try {
        canvas.width = videoFrame.displayWidth;
        canvas.height = videoFrame.displayHeight;
        // Preserve transparency — do not fill a background
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(videoFrame, 0, 0);

        const blob = await canvasToPngBlob(canvas);
        const durationUs = videoFrame.duration;
        frames.push({
          frameNumber: index + 1,
          blob,
          url: URL.createObjectURL(blob),
          width: canvas.width,
          height: canvas.height,
          durationMs:
            typeof durationUs === "number" ? Math.round(durationUs / 1000) : null,
        });
      } finally {
        videoFrame.close();
      }
    }
  } finally {
    decoder.close();
  }

  return frames;
}

export function revokeConvertedFrames(frames: ConvertedFrame[]) {
  for (const frame of frames) {
    URL.revokeObjectURL(frame.url);
  }
}

export function downloadFramePng(frame: ConvertedFrame, baseName: string) {
  const safeBase = baseName || "frame";
  const padded = String(frame.frameNumber).padStart(3, "0");
  downloadBlob(frame.blob, `${safeBase}-frame-${padded}.png`);
}

export async function downloadAllFramesZip(
  frames: ConvertedFrame[],
  baseName: string,
) {
  const zip = new JSZip();
  const safeBase = baseName || "webp";

  for (const frame of frames) {
    const padded = String(frame.frameNumber).padStart(3, "0");
    zip.file(`${safeBase}-frame-${padded}.png`, frame.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, `${safeBase}-frames-png.zip`);
}
