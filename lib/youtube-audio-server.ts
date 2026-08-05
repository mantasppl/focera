import { parseYoutubeVideoId } from "@/lib/youtube-to-text";
import { MAX_AUDIO_UPLOAD_BYTES } from "@/lib/video-transcribe-shared";

export const MAX_YOUTUBE_TRANSCRIBE_DURATION_SEC = 10 * 60;

type AdaptiveFormat = {
  itag?: number;
  url?: string;
  mimeType?: string;
  bitrate?: number;
  contentLength?: string;
  approxDurationMs?: string;
  audioQuality?: string;
  signatureCipher?: string;
};

type PlayerResponse = {
  videoDetails?: {
    title?: string;
    videoId?: string;
    lengthSeconds?: string;
  };
  streamingData?: {
    adaptiveFormats?: AdaptiveFormat[];
    formats?: AdaptiveFormat[];
  };
  playabilityStatus?: {
    status?: string;
    reason?: string;
  };
};

type InnertubeClient = {
  clientName: string;
  clientVersion: string;
  userAgent: string;
  extraClient?: Record<string, string | number>;
};

const INNERTUBE_CLIENTS: InnertubeClient[] = [
  {
    clientName: "ANDROID",
    clientVersion: "20.10.38",
    userAgent: "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
    extraClient: { androidSdkVersion: 30 },
  },
  {
    clientName: "IOS",
    clientVersion: "20.10.4",
    userAgent:
      "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 17_6_1 like Mac OS X;)",
    extraClient: { deviceModel: "iPhone16,2" },
  },
];

export type YoutubeAudioDownload = {
  videoId: string;
  title: string;
  durationSec: number;
  bytes: Buffer;
  filename: string;
  mimeType: string;
};

async function fetchInnertubePlayer(
  videoId: string,
  client: InnertubeClient,
): Promise<PlayerResponse | null> {
  const response = await fetch(
    "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": client.userAgent,
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: client.clientName,
            clientVersion: client.clientVersion,
            hl: "en",
            gl: "US",
            ...(client.extraClient ?? {}),
          },
        },
        videoId,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) return null;
  try {
    return (await response.json()) as PlayerResponse;
  } catch {
    return null;
  }
}

function isAudioOnly(format: AdaptiveFormat): boolean {
  const mime = format.mimeType?.toLowerCase() ?? "";
  return mime.startsWith("audio/");
}

function extensionForMime(mimeType: string): string {
  const lower = mimeType.toLowerCase();
  if (lower.includes("mp4") || lower.includes("m4a") || lower.includes("aac")) {
    return "m4a";
  }
  if (lower.includes("webm") || lower.includes("opus")) return "webm";
  if (lower.includes("mpeg") || lower.includes("mp3")) return "mp3";
  return "audio";
}

function pickAudioFormat(player: PlayerResponse): AdaptiveFormat | null {
  const formats = [
    ...(player.streamingData?.adaptiveFormats ?? []),
    ...(player.streamingData?.formats ?? []),
  ].filter(
    (format) =>
      isAudioOnly(format) &&
      typeof format.url === "string" &&
      format.url.length > 0 &&
      !format.signatureCipher,
  );

  if (!formats.length) return null;

  const withKnownSize = formats.filter((format) => {
    const size = Number.parseInt(format.contentLength ?? "", 10);
    return Number.isFinite(size) && size > 0 && size <= MAX_AUDIO_UPLOAD_BYTES;
  });

  const pool = withKnownSize.length ? withKnownSize : formats;

  pool.sort((a, b) => {
    const aBitrate = typeof a.bitrate === "number" ? a.bitrate : 0;
    const bBitrate = typeof b.bitrate === "number" ? b.bitrate : 0;
    // Prefer medium quality — smaller upload, still clear speech.
    const aScore = Math.abs(aBitrate - 128_000);
    const bScore = Math.abs(bBitrate - 128_000);
    return aScore - bScore;
  });

  return pool[0] ?? null;
}

async function resolvePlayerWithAudio(videoId: string): Promise<{
  player: PlayerResponse;
  format: AdaptiveFormat;
  client: InnertubeClient;
}> {
  let lastPlayer: PlayerResponse | null = null;

  for (const client of INNERTUBE_CLIENTS) {
    const player = await fetchInnertubePlayer(videoId, client);
    if (!player) continue;
    lastPlayer = player;

    const status = player.playabilityStatus?.status;
    if (status && status !== "OK") {
      throw new Error(
        player.playabilityStatus?.reason ||
          "This video is unavailable or cannot be transcribed.",
      );
    }

    const format = pickAudioFormat(player);
    if (format) return { player, format, client };
  }

  if (lastPlayer) {
    throw new Error(
      "Could not download audio for this video. It may be restricted or region-locked.",
    );
  }

  throw new Error("Could not reach YouTube to load this video.");
}

export async function downloadYoutubeAudio(
  urlOrId: string,
): Promise<YoutubeAudioDownload> {
  const videoId = parseYoutubeVideoId(urlOrId);
  if (!videoId) {
    throw new Error(
      "Enter a valid YouTube URL (watch, youtu.be, shorts, or live) or 11-character video ID.",
    );
  }

  const { player, format, client } = await resolvePlayerWithAudio(videoId);
  const lengthSec = Number.parseInt(
    player.videoDetails?.lengthSeconds ?? "",
    10,
  );

  if (Number.isFinite(lengthSec) && lengthSec > MAX_YOUTUBE_TRANSCRIBE_DURATION_SEC) {
    throw new Error(
      `Speech transcription supports videos up to ${MAX_YOUTUBE_TRANSCRIBE_DURATION_SEC / 60} minutes. This one is longer — try a shorter clip, or use a video that already has captions.`,
    );
  }

  const audioUrl = format.url!;
  const { fetchSafeMedia } = await import("@/lib/security/outbound");
  const response = await fetchSafeMedia(audioUrl, {
    headers: {
      "User-Agent": client.userAgent,
      Accept: "*/*",
      Range: `bytes=0-${MAX_AUDIO_UPLOAD_BYTES}`,
    },
    cache: "no-store",
  });

  if (!response.ok && response.status !== 206) {
    throw new Error("Could not download audio from YouTube for transcription.");
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength <= 0) {
    throw new Error("Downloaded YouTube audio was empty.");
  }

  if (arrayBuffer.byteLength > MAX_AUDIO_UPLOAD_BYTES) {
    throw new Error(
      "Audio is too large to transcribe. Try a shorter YouTube video.",
    );
  }

  const mimeType =
    format.mimeType?.split(";")[0]?.trim() ||
    response.headers.get("content-type")?.split(";")[0]?.trim() ||
    "audio/mp4";
  const ext = extensionForMime(mimeType);

  return {
    videoId: player.videoDetails?.videoId || videoId,
    title: player.videoDetails?.title?.trim() || `YouTube ${videoId}`,
    durationSec: Number.isFinite(lengthSec) ? lengthSec : 0,
    bytes: Buffer.from(arrayBuffer),
    filename: `youtube-${videoId}.${ext}`,
    mimeType,
  };
}
