import { Mp3Encoder } from "@breezystack/lamejs";
import {
  downloadBlob,
  formatVideoDuration,
  formatVideoFileSize,
  MAX_VIDEO_DURATION_SEC,
  validateVideoFile,
  videoFileBaseName,
} from "@/lib/video-caption";

export type Mp3Bitrate = 128 | 192 | 320;

export type Mp3QualityPreset = {
  bitrate: Mp3Bitrate;
  label: string;
  hint: string;
};

export const MP3_QUALITY_PRESETS: Mp3QualityPreset[] = [
  {
    bitrate: 128,
    label: "128 kbps",
    hint: "Smaller file",
  },
  {
    bitrate: 192,
    label: "192 kbps",
    hint: "Good default",
  },
  {
    bitrate: 320,
    label: "320 kbps",
    hint: "Best quality",
  },
];

export type Mp4ToMp3Result = {
  blob: Blob;
  originalSize: number;
  outputSize: number;
  durationSec: number;
  bitrate: Mp3Bitrate;
  sampleRate: number;
  channels: number;
};

export type Mp4ToMp3Options = {
  bitrate?: Mp3Bitrate;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

const LAME_SAMPLE_RATES = [
  8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000,
] as const;

const ENCODE_BLOCK = 1152;
const YIELD_EVERY_BLOCKS = 40;

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

function nearestLameSampleRate(rate: number): number {
  let best: number = LAME_SAMPLE_RATES[7];
  let bestDiff = Math.abs(rate - best);
  for (const candidate of LAME_SAMPLE_RATES) {
    const diff = Math.abs(rate - candidate);
    if (diff < bestDiff) {
      best = candidate;
      bestDiff = diff;
    }
  }
  return best;
}

function mixToMono(buffer: AudioBuffer): Float32Array {
  const { numberOfChannels, length } = buffer;
  if (numberOfChannels === 1) {
    return buffer.getChannelData(0).slice(0);
  }
  const mono = new Float32Array(length);
  for (let ch = 0; ch < numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      mono[i] += (data[i] ?? 0) / numberOfChannels;
    }
  }
  return mono;
}

function resampleLinear(
  input: Float32Array,
  fromRate: number,
  toRate: number,
): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const outLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const srcIndex = i * ratio;
    const left = Math.floor(srcIndex);
    const right = Math.min(left + 1, input.length - 1);
    const t = srcIndex - left;
    output[i] = (input[left] ?? 0) * (1 - t) + (input[right] ?? 0) * t;
  }
  return output;
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const sample = Math.max(-1, Math.min(1, input[i] ?? 0));
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return output;
}

async function encodeMp3(
  left: Int16Array,
  right: Int16Array | null,
  sampleRate: number,
  bitrate: Mp3Bitrate,
  options?: {
    onProgress?: (message: string) => void;
    signal?: AbortSignal;
  },
): Promise<Blob> {
  const { onProgress, signal } = options ?? {};
  const channels = right ? 2 : 1;
  const encoder = new Mp3Encoder(channels, sampleRate, bitrate);
  const chunks: Uint8Array[] = [];
  const total = left.length;
  let blocks = 0;

  for (let i = 0; i < total; i += ENCODE_BLOCK) {
    throwIfAborted(signal);
    const end = Math.min(i + ENCODE_BLOCK, total);
    const leftChunk = left.subarray(i, end);
    const encoded = right
      ? encoder.encodeBuffer(leftChunk, right.subarray(i, end))
      : encoder.encodeBuffer(leftChunk);
    if (encoded.length > 0) chunks.push(encoded);

    blocks += 1;
    if (blocks % YIELD_EVERY_BLOCKS === 0) {
      const pct = Math.min(99, Math.round((end / total) * 100));
      onProgress?.(`Encoding MP3… ${pct}%`);
      await yieldToMain();
    }
  }

  throwIfAborted(signal);
  const flushed = encoder.flush();
  if (flushed.length > 0) chunks.push(flushed);

  return new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
}

export async function convertMp4ToMp3(
  file: File,
  options: Mp4ToMp3Options = {},
): Promise<Mp4ToMp3Result> {
  const bitrate = options.bitrate ?? 192;
  const { onProgress, signal } = options;

  const validationError = validateVideoFile(file);
  if (validationError) throw new Error(validationError);

  throwIfAborted(signal);
  onProgress?.("Reading video…");

  const arrayBuffer = await file.arrayBuffer();
  throwIfAborted(signal);

  onProgress?.("Extracting audio…");
  const ctx = new AudioContext();
  try {
    let decoded: AudioBuffer;
    try {
      decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
    } catch {
      throw new Error(
        "Could not extract audio from this video. Try another MP4, WebM, or MOV with an audio track.",
      );
    }

    throwIfAborted(signal);

    if (!Number.isFinite(decoded.duration) || decoded.duration <= 0) {
      throw new Error("This video has no readable audio duration.");
    }
    if (decoded.duration > MAX_VIDEO_DURATION_SEC) {
      throw new Error(
        `Video must be ${Math.floor(MAX_VIDEO_DURATION_SEC / 60)} minutes or shorter.`,
      );
    }
    if (decoded.length === 0 || decoded.numberOfChannels === 0) {
      throw new Error(
        "No audio track found. Use a video that includes sound.",
      );
    }

    const targetRate = nearestLameSampleRate(decoded.sampleRate);
    const useStereo = decoded.numberOfChannels >= 2;
    let left: Float32Array;
    let right: Float32Array | null = null;

    if (useStereo) {
      left = resampleLinear(
        decoded.getChannelData(0).slice(0),
        decoded.sampleRate,
        targetRate,
      );
      right = resampleLinear(
        decoded.getChannelData(1).slice(0),
        decoded.sampleRate,
        targetRate,
      );
      const length = Math.min(left.length, right.length);
      if (left.length !== length) left = left.subarray(0, length);
      if (right.length !== length) right = right.subarray(0, length);
    } else {
      left = resampleLinear(
        mixToMono(decoded),
        decoded.sampleRate,
        targetRate,
      );
    }

    throwIfAborted(signal);
    onProgress?.("Encoding MP3…");

    const leftPcm = floatTo16BitPCM(left);
    const rightPcm = right ? floatTo16BitPCM(right) : null;
    const blob = await encodeMp3(leftPcm, rightPcm, targetRate, bitrate, {
      onProgress,
      signal,
    });

    if (blob.size === 0) {
      throw new Error("MP3 encoding produced an empty file. Try another video.");
    }

    onProgress?.("Done");

    return {
      blob,
      originalSize: file.size,
      outputSize: blob.size,
      durationSec: decoded.duration,
      bitrate,
      sampleRate: targetRate,
      channels: useStereo ? 2 : 1,
    };
  } finally {
    await ctx.close().catch(() => undefined);
  }
}

export function downloadMp3(blob: Blob, sourceFile: File): void {
  downloadBlob(blob, `${videoFileBaseName(sourceFile)}.mp3`);
}

export function describeMp3Meta(result: Mp4ToMp3Result): string {
  const channels = result.channels === 2 ? "stereo" : "mono";
  return `${formatVideoDuration(result.durationSec)} · ${result.bitrate} kbps · ${channels} · ${formatVideoFileSize(result.outputSize)}`;
}
