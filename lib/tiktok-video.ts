import { brandedDownloadFilename } from "@/lib/image";

const VIDEO_ID_RE = /^\d{8,25}$/;
const SHORT_CODE_RE = /^[A-Za-z0-9]{5,20}$/;

export type TikTokVideoResult = {
  videoId: string;
  permalink: string;
  username: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  thumbnailUrl: string | null;
};

const TIKTOK_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
]);

function tiktokHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function isAllowedTikTokHost(hostname: string): boolean {
  const host = tiktokHost(hostname);
  return (
    host === "tiktok.com" ||
    host === "m.tiktok.com" ||
    host === "vm.tiktok.com" ||
    host === "vt.tiktok.com" ||
    TIKTOK_HOSTS.has(hostname.toLowerCase())
  );
}

export function parseTikTokVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (VIDEO_ID_RE.test(trimmed)) return trimmed;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!isAllowedTikTokHost(url.hostname)) return null;

    const parts = url.pathname.split("/").filter(Boolean);

    // /@user/video/ID or /@user/photo/ID
    const videoIdx = parts.findIndex((p) => p === "video" || p === "photo");
    if (
      videoIdx >= 0 &&
      parts[videoIdx + 1] &&
      VIDEO_ID_RE.test(parts[videoIdx + 1]!)
    ) {
      return parts[videoIdx + 1]!;
    }
  } catch {
    return null;
  }

  return null;
}

/** True when the input looks like a TikTok URL we can attempt to resolve. */
export function isTikTokUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (VIDEO_ID_RE.test(trimmed)) return true;
  if (parseTikTokVideoId(trimmed)) return true;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!isAllowedTikTokHost(url.hostname)) return false;
    const host = tiktokHost(url.hostname);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "t" && parts[1] && SHORT_CODE_RE.test(parts[1])) {
      return true;
    }
    if (
      (host === "vm.tiktok.com" || host === "vt.tiktok.com") &&
      parts[0] &&
      SHORT_CODE_RE.test(parts[0])
    ) {
      return true;
    }
    return parts.some((p) => p === "video" || p === "photo");
  } catch {
    return false;
  }
}

export function validateTikTokUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return "Paste a TikTok video URL.";
  if (!isTikTokUrl(trimmed)) {
    return "Enter a valid TikTok URL (video link or vm/vt short link).";
  }
  return null;
}

export function tiktokPermalink(videoId: string, username?: string | null): string {
  if (username) {
    return `https://www.tiktok.com/@${username}/video/${videoId}`;
  }
  return `https://www.tiktok.com/video/${videoId}`;
}

export function describeTikTokResult(result: TikTokVideoResult): string {
  const who = result.username ? `@${result.username}` : "TikTok";
  if (result.width && result.height) {
    return `${who} · ${result.width}×${result.height} · ready to download`;
  }
  return `${who} · ready to download`;
}

export function downloadFilename(
  result: Pick<TikTokVideoResult, "videoId" | "username">,
): string {
  const user = result.username?.replace(/[^\w.-]+/g, "") || "tiktok";
  return brandedDownloadFilename(`tiktok-${user}-${result.videoId}.mp4`);
}
