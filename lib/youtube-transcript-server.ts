import {
  parseYoutubeVideoId,
  segmentsToPlainText,
  type YoutubeTranscriptResult,
  type YoutubeTranscriptSegment,
} from "@/lib/youtube-to-text";

type CaptionTrack = {
  baseUrl: string;
  languageCode: string;
  name?: string;
  kind?: string;
};

type PlayerResponse = {
  videoDetails?: {
    title?: string;
    videoId?: string;
  };
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: Array<{
        baseUrl?: string;
        languageCode?: string;
        name?: { simpleText?: string };
        kind?: string;
      }>;
    };
  };
  playabilityStatus?: {
    status?: string;
    reason?: string;
  };
};

type Json3Event = {
  tStartMs?: number;
  dDurationMs?: number;
  segs?: Array<{ utf8?: string }>;
};

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );
}

function cleanCaptionText(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractJsonObject(source: string, marker: string): unknown | null {
  const start = source.indexOf(marker);
  if (start === -1) return null;
  const braceStart = source.indexOf("{", start + marker.length);
  if (braceStart === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = braceStart; i < source.length; i++) {
    const char = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        const slice = source.slice(braceStart, i + 1);
        try {
          return JSON.parse(slice) as unknown;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function tracksFromPlayer(player: PlayerResponse): CaptionTrack[] {
  const raw =
    player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
  return raw
    .map((track) => ({
      baseUrl: typeof track.baseUrl === "string" ? track.baseUrl : "",
      languageCode:
        typeof track.languageCode === "string" ? track.languageCode : "",
      name:
        typeof track.name?.simpleText === "string"
          ? track.name.simpleText
          : undefined,
      kind: typeof track.kind === "string" ? track.kind : undefined,
    }))
    .filter((track) => track.baseUrl && track.languageCode);
}

function pickTrack(
  tracks: CaptionTrack[],
  preferredLanguage?: string,
): CaptionTrack | null {
  if (!tracks.length) return null;

  const preferred = preferredLanguage?.trim().toLowerCase();
  if (preferred && preferred !== "auto") {
    const exact = tracks.find(
      (track) => track.languageCode.toLowerCase() === preferred,
    );
    if (exact) return exact;

    const prefix = tracks.find((track) =>
      track.languageCode.toLowerCase().startsWith(preferred),
    );
    if (prefix) return prefix;
  }

  const englishManual = tracks.find(
    (track) =>
      track.languageCode.toLowerCase().startsWith("en") &&
      track.kind !== "asr",
  );
  if (englishManual) return englishManual;

  const englishAny = tracks.find((track) =>
    track.languageCode.toLowerCase().startsWith("en"),
  );
  if (englishAny) return englishAny;

  const anyManual = tracks.find((track) => track.kind !== "asr");
  return anyManual ?? tracks[0] ?? null;
}

type InnertubeClient = {
  clientName: string;
  clientVersion: string;
  userAgent: string;
  extraClient?: Record<string, string | number>;
};

/** Mobile clients return timedtext URLs that still work; WEB watch URLs often return empty bodies. */
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

async function fetchWatchPlayer(videoId: string): Promise<PlayerResponse | null> {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
    headers: {
      "User-Agent": BROWSER_UA,
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) return null;
  const html = await response.text();
  const parsed = extractJsonObject(html, "ytInitialPlayerResponse");
  if (!parsed || typeof parsed !== "object") return null;
  return parsed as PlayerResponse;
}

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

async function resolvePlayer(videoId: string): Promise<PlayerResponse> {
  for (const client of INNERTUBE_CLIENTS) {
    const player = await fetchInnertubePlayer(videoId, client);
    if (player && tracksFromPlayer(player).length) return player;
  }

  // Title / playability fallback only — WEB timedtext URLs are often empty.
  const fromWatch = await fetchWatchPlayer(videoId);
  if (fromWatch) return fromWatch;

  throw new Error("Could not reach YouTube to load this video.");
}

function parseJson3Transcript(payload: unknown): YoutubeTranscriptSegment[] {
  if (!payload || typeof payload !== "object") return [];
  const events = (payload as { events?: Json3Event[] }).events;
  if (!Array.isArray(events)) return [];

  const segments: YoutubeTranscriptSegment[] = [];

  for (const event of events) {
    if (!event?.segs?.length) continue;
    const text = cleanCaptionText(
      event.segs.map((seg) => seg.utf8 ?? "").join(""),
    );
    if (!text || text === "\n") continue;
    const startMs = typeof event.tStartMs === "number" ? event.tStartMs : 0;
    const durationMs =
      typeof event.dDurationMs === "number" ? event.dDurationMs : 2000;
    segments.push({
      start: startMs / 1000,
      duration: durationMs / 1000,
      text,
    });
  }

  return segments;
}

function parseXmlTranscript(xml: string): YoutubeTranscriptSegment[] {
  const segments: YoutubeTranscriptSegment[] = [];
  const re =
    /<text\b[^>]*\bstart="([^"]+)"[^>]*\bdur="([^"]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    const start = Number.parseFloat(match[1] ?? "");
    const duration = Number.parseFloat(match[2] ?? "");
    const text = cleanCaptionText(match[3] ?? "");
    if (!text || !Number.isFinite(start)) continue;
    segments.push({
      start,
      duration: Number.isFinite(duration) ? duration : 2,
      text,
    });
  }
  return segments;
}

async function fetchCaptionSegments(
  track: CaptionTrack,
): Promise<YoutubeTranscriptSegment[]> {
  const headers = {
    "User-Agent": INNERTUBE_CLIENTS[0]?.userAgent ?? BROWSER_UA,
    "Accept-Language": "en-US,en;q=0.9",
  };

  const { fetchSafeMedia } = await import("@/lib/security/outbound");
  const jsonUrl = new URL(track.baseUrl);
  jsonUrl.searchParams.set("fmt", "json3");

  const jsonResponse = await fetchSafeMedia(jsonUrl.toString(), {
    headers,
    cache: "no-store",
  });

  if (jsonResponse.ok) {
    const raw = await jsonResponse.text();
    if (raw.trim()) {
      try {
        const payload = JSON.parse(raw) as unknown;
        const segments = parseJson3Transcript(payload);
        if (segments.length) return segments;
      } catch {
        // Fall through to XML.
      }
    }
  }

  const xmlResponse = await fetchSafeMedia(track.baseUrl, {
    headers,
    cache: "no-store",
  });

  if (!xmlResponse.ok) {
    throw new Error("Could not download captions for this video.");
  }

  const xml = await xmlResponse.text();
  const segments = parseXmlTranscript(xml);
  if (!segments.length) {
    throw new Error("Captions were empty for this video.");
  }
  return segments;
}

export async function fetchYoutubeTranscript(
  urlOrId: string,
  options?: { language?: string },
): Promise<YoutubeTranscriptResult> {
  const videoId = parseYoutubeVideoId(urlOrId);
  if (!videoId) {
    throw new Error(
      "Enter a valid YouTube URL (watch, youtu.be, shorts, or live) or 11-character video ID.",
    );
  }

  const player = await resolvePlayer(videoId);
  const status = player.playabilityStatus?.status;
  if (status && status !== "OK") {
    throw new Error(
      player.playabilityStatus?.reason ||
        "This video is unavailable or cannot be transcribed.",
    );
  }

  const tracks = tracksFromPlayer(player);
  if (!tracks.length) {
    throw new Error(
      "No captions found for this video. Try a video with subtitles or auto-generated captions.",
    );
  }

  const track = pickTrack(tracks, options?.language);
  if (!track) {
    throw new Error("No captions found for this video.");
  }

  const segments = await fetchCaptionSegments(track);
  const text = segmentsToPlainText(segments);
  if (!text) {
    throw new Error("Captions were empty for this video.");
  }

  return {
    videoId: player.videoDetails?.videoId || videoId,
    title: player.videoDetails?.title?.trim() || `YouTube ${videoId}`,
    language: track.name || track.languageCode,
    languageCode: track.languageCode,
    isAutoGenerated: track.kind === "asr",
    text,
    segments,
  };
}
