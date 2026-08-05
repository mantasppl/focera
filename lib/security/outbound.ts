import { isSafeOutboundUrl } from "@/lib/security/request";

/** Common CDN / media host suffixes used by social platforms. */
export const MEDIA_CDN_HOST_SUFFIXES = [
  // Meta
  "fbcdn.net",
  "facebook.com",
  "cdninstagram.com",
  "instagram.com",
  // TikTok
  "tiktok.com",
  "tiktokcdn.com",
  "tiktokcdn-us.com",
  "tiktokv.com",
  "musical.ly",
  "byteoversea.com",
  "ibyteimg.com",
  // X / Twitter
  "twimg.com",
  "twitter.com",
  "x.com",
  "pscp.tv",
  "video.twimg.com",
  // YouTube / Google
  "googlevideo.com",
  "youtube.com",
  "ytimg.com",
  "ggpht.com",
  "googleusercontent.com",
] as const;

export function assertSafeMediaUrl(url: string): void {
  if (!isSafeOutboundUrl(url, [...MEDIA_CDN_HOST_SUFFIXES])) {
    throw new Error("Blocked unsafe media URL.");
  }
}

export async function fetchSafeMedia(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  assertSafeMediaUrl(url);
  return fetch(url, init);
}
