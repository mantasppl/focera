import {
  isTikTokUrl,
  parseTikTokVideoId,
  tiktokPermalink,
  type TikTokVideoResult,
} from "@/lib/tiktok-video";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

type TikTokPlayAddr = {
  UrlList?: string[];
  DataSize?: number;
  Width?: number;
  Height?: number;
};

type TikTokBitrate = {
  Bitrate?: number;
  CodecType?: string;
  QualityType?: number;
  PlayAddr?: TikTokPlayAddr;
};

type TikTokVideoMeta = {
  id?: string;
  width?: number;
  height?: number;
  duration?: number;
  cover?: string;
  originCover?: string;
  dynamicCover?: string;
  playAddr?: string;
  downloadAddr?: string;
  bitrateInfo?: TikTokBitrate[];
};

type TikTokItemStruct = {
  id?: string;
  desc?: string;
  author?: { uniqueId?: string; nickname?: string };
  video?: TikTokVideoMeta;
  imagePost?: unknown;
};

type ResolvedMedia = {
  videoId: string;
  username: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  thumbnailUrl: string | null;
  videoUrl: string;
  cookie: string;
};

function pickCookie(
  setCookieHeaders: string[] | string | null,
  name: string,
): string | null {
  if (!setCookieHeaders) return null;
  const list = Array.isArray(setCookieHeaders)
    ? setCookieHeaders
    : [setCookieHeaders];
  for (const line of list) {
    const match = String(line).match(
      new RegExp(`(?:^|,\\s*)${name}=([^;]+)`, "i"),
    );
    if (match?.[1]) return match[1];
  }
  return null;
}

function cookieHeaderFromResponse(response: Response): string {
  const setCookie =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : response.headers.get("set-cookie");

  const names = ["tt_chain_token", "ttwid", "msToken", "odin_tt", "tt_csrf_token"];
  const parts: string[] = [];
  for (const name of names) {
    const value = pickCookie(setCookie, name);
    if (value) parts.push(`${name}=${value}`);
  }

  // Keep any useful cookies even if names differ.
  if (parts.length === 0 && setCookie) {
    const list = Array.isArray(setCookie) ? setCookie : [setCookie];
    for (const line of list) {
      const pair = String(line).split(";")[0]?.trim();
      if (pair && pair.includes("=")) parts.push(pair);
    }
  }

  return parts.join("; ");
}

function normalizeInputUrl(input: string): string {
  const trimmed = input.trim();
  if (/^\d{8,25}$/.test(trimmed)) {
    return `https://www.tiktok.com/video/${trimmed}`;
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function extractRehydrationJson(html: string): unknown | null {
  const match = html.match(
    /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i,
  );
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1]) as unknown;
  } catch {
    return null;
  }
}

function extractItemStruct(json: unknown): {
  item: TikTokItemStruct | null;
  statusCode: number | null;
  statusMsg: string | null;
} {
  const detail = (
    json as {
      __DEFAULT_SCOPE__?: {
        "webapp.video-detail"?: {
          statusCode?: number;
          statusMsg?: string;
          itemInfo?: { itemStruct?: TikTokItemStruct };
        };
      };
    }
  )?.__DEFAULT_SCOPE__?.["webapp.video-detail"];

  return {
    item: detail?.itemInfo?.itemStruct ?? null,
    statusCode: typeof detail?.statusCode === "number" ? detail.statusCode : null,
    statusMsg: detail?.statusMsg ?? null,
  };
}

function pickBestVideoUrl(video: TikTokVideoMeta): string | null {
  if (video.downloadAddr) return video.downloadAddr;

  const bitrates = [...(video.bitrateInfo ?? [])].filter(
    (b) => b.PlayAddr?.UrlList?.[0],
  );
  if (bitrates.length) {
    // Prefer H.264 for broad player compatibility, then highest bitrate.
    bitrates.sort((a, b) => {
      const aH264 = /h264/i.test(a.CodecType ?? "") ? 1 : 0;
      const bH264 = /h264/i.test(b.CodecType ?? "") ? 1 : 0;
      if (aH264 !== bH264) return bH264 - aH264;
      return (b.Bitrate ?? 0) - (a.Bitrate ?? 0);
    });
    const url = bitrates[0]?.PlayAddr?.UrlList?.[0];
    if (url) return url;
  }

  if (video.playAddr) return video.playAddr;
  return null;
}

async function fetchVideoPage(url: string): Promise<{
  html: string;
  finalUrl: string;
  cookie: string;
}> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.tiktok.com/",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("TikTok rate-limited this request. Try again in a moment.");
    }
    throw new Error("Could not reach TikTok for this video.");
  }

  const html = await response.text();
  if (!html.includes("__UNIVERSAL_DATA_FOR_REHYDRATION__")) {
    if (/captcha|verify|blocked/i.test(html)) {
      throw new Error("TikTok blocked the request. Try again later.");
    }
    throw new Error("TikTok returned an unexpected page. Try again later.");
  }

  return {
    html,
    finalUrl: response.url || url,
    cookie: cookieHeaderFromResponse(response),
  };
}

async function resolveMedia(input: string): Promise<ResolvedMedia> {
  if (!isTikTokUrl(input)) {
    throw new Error("Enter a valid TikTok URL.");
  }

  const pageUrl = normalizeInputUrl(input);
  const { html, finalUrl, cookie } = await fetchVideoPage(pageUrl);
  const json = extractRehydrationJson(html);
  if (!json) {
    throw new Error("TikTok returned an invalid response.");
  }

  const { item, statusCode, statusMsg } = extractItemStruct(json);

  if (statusCode && statusCode !== 0) {
    if (statusCode === 10204 || /doesn't exist|not found/i.test(statusMsg || "")) {
      throw new Error(
        "Video not found, private, or unavailable. Only public TikTok videos work.",
      );
    }
    throw new Error(
      statusMsg?.trim() ||
        "Video not found, private, or unavailable. Only public TikTok videos work.",
    );
  }

  if (!item?.id) {
    throw new Error(
      "Video not found, private, or unavailable. Only public TikTok videos work.",
    );
  }

  if (item.imagePost && !item.video?.playAddr && !item.video?.downloadAddr) {
    throw new Error(
      "This TikTok post is a photo slideshow, not a video. Only video posts can be downloaded.",
    );
  }

  const video = item.video;
  if (!video) {
    throw new Error(
      "This TikTok post does not contain a public video. Photos and private posts cannot be downloaded.",
    );
  }

  const videoUrl = pickBestVideoUrl(video);
  if (!videoUrl) {
    throw new Error(
      "This TikTok post does not contain a public video. Photos and private posts cannot be downloaded.",
    );
  }

  const videoId =
    item.id ||
    parseTikTokVideoId(finalUrl) ||
    parseTikTokVideoId(input) ||
    item.id!;

  return {
    videoId,
    username: item.author?.uniqueId ?? null,
    caption: item.desc?.trim() || null,
    width: video.width ?? null,
    height: video.height ?? null,
    thumbnailUrl: video.cover || video.originCover || video.dynamicCover || null,
    videoUrl,
    cookie,
  };
}

export async function fetchTikTokVideo(input: string): Promise<TikTokVideoResult> {
  const media = await resolveMedia(input);
  return {
    videoId: media.videoId,
    permalink: tiktokPermalink(media.videoId, media.username),
    username: media.username,
    caption: media.caption,
    width: media.width,
    height: media.height,
    thumbnailUrl: media.thumbnailUrl,
  };
}

export async function streamTikTokVideo(options: {
  videoId: string;
  username?: string | null;
}): Promise<{
  response: Response;
  filenameHint: string;
  contentType: string;
}> {
  const videoId = parseTikTokVideoId(options.videoId);
  if (!videoId) {
    throw new Error("Invalid TikTok video id.");
  }

  const pageUrl = options.username
    ? tiktokPermalink(videoId, options.username)
    : `https://www.tiktok.com/video/${videoId}`;

  const media = await resolveMedia(pageUrl);
  if (media.videoId !== videoId) {
    // Still allow if TikTok remapped; prefer resolved media.
  }

  const headers: Record<string, string> = {
    "User-Agent": BROWSER_UA,
    Referer: "https://www.tiktok.com/",
    Accept: "video/mp4,video/*,*/*;q=0.8",
  };
  if (media.cookie) headers.cookie = media.cookie;

  const upstream = await fetch(media.videoUrl, {
    headers,
    redirect: "follow",
  });

  if (!upstream.ok || !upstream.body) {
    throw new Error("Could not download the TikTok video file.");
  }

  const contentType = upstream.headers.get("content-type") || "video/mp4";
  const user = media.username?.replace(/[^\w.-]+/g, "") || "tiktok";
  return {
    response: upstream,
    filenameHint: `tiktok-${user}-${media.videoId}.mp4`,
    contentType,
  };
}
