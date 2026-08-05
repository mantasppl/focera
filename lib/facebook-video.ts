import { brandedDownloadFilename } from "@/lib/image";

const VIDEO_ID_RE = /^\d{5,30}$/;
const SHORT_CODE_RE = /^[A-Za-z0-9_-]{4,40}$/;

export type FacebookVideoResult = {
  videoId: string;
  permalink: string;
  username: string | null;
  caption: string | null;
  title: string | null;
  quality: "hd" | "sd";
  thumbnailUrl: string | null;
};

const FACEBOOK_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "mbasic.facebook.com",
  "web.facebook.com",
  "fb.watch",
  "www.fb.watch",
  "fb.com",
  "www.fb.com",
]);

function facebookHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function isAllowedFacebookHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return FACEBOOK_HOSTS.has(host) || facebookHost(host) === "facebook.com";
}

function withProtocol(input: string): string {
  return /^https?:\/\//i.test(input) ? input : `https://${input}`;
}

/** Extract a numeric Facebook video id when the URL/path embeds one. */
export function parseFacebookVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (VIDEO_ID_RE.test(trimmed)) return trimmed;

  try {
    const url = new URL(withProtocol(trimmed));
    if (!isAllowedFacebookHost(url.hostname)) return null;

    const host = facebookHost(url.hostname);
    const parts = url.pathname.split("/").filter(Boolean);

    // watch/?v=ID or video.php?v=ID
    const queryId = url.searchParams.get("v") || url.searchParams.get("id");
    if (queryId && VIDEO_ID_RE.test(queryId)) return queryId;

    // /reel/ID, /reels/ID, /videos/ID, /watch/ID
    for (let i = 0; i < parts.length - 1; i += 1) {
      const kind = parts[i]!.toLowerCase();
      if (
        ["reel", "reels", "videos", "watch", "video"].includes(kind) &&
        parts[i + 1] &&
        VIDEO_ID_RE.test(parts[i + 1]!)
      ) {
        return parts[i + 1]!;
      }
    }

    // /story.php?story_fbid=ID
    const storyId = url.searchParams.get("story_fbid");
    if (storyId && VIDEO_ID_RE.test(storyId)) return storyId;

    // fb.watch short codes are not numeric ids
    if (host === "fb.watch" || host === "fb.com") return null;

    return null;
  } catch {
    return null;
  }
}

/** True when the input looks like a Facebook URL we can attempt to resolve. */
export function isFacebookUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (VIDEO_ID_RE.test(trimmed)) return true;
  if (parseFacebookVideoId(trimmed)) return true;

  try {
    const url = new URL(withProtocol(trimmed));
    if (!isAllowedFacebookHost(url.hostname)) return false;

    const host = facebookHost(url.hostname);
    const parts = url.pathname.split("/").filter(Boolean);

    if (host === "fb.watch" && parts[0] && SHORT_CODE_RE.test(parts[0])) {
      return true;
    }

    if (parts[0] === "share" && parts[1] && parts[2]) {
      return ["v", "r", "p"].includes(parts[1].toLowerCase());
    }

    if (parts.some((p) => ["reel", "reels", "videos", "watch", "video"].includes(p.toLowerCase()))) {
      return true;
    }

    if (url.pathname.toLowerCase().includes("video.php")) return true;
    if (url.searchParams.has("v")) return true;

    return false;
  } catch {
    return false;
  }
}

export function validateFacebookUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return "Paste a Facebook video URL.";
  if (!isFacebookUrl(trimmed)) {
    return "Enter a valid Facebook URL (watch, reel, videos, or fb.watch short link).";
  }
  return null;
}

export function facebookPermalink(videoId: string): string {
  return `https://www.facebook.com/watch/?v=${videoId}`;
}

export function describeFacebookResult(result: FacebookVideoResult): string {
  const who = result.username || "Facebook";
  const quality = result.quality === "hd" ? "HD" : "SD";
  return `${who} · ${quality} · ready to download`;
}

export function downloadFilename(
  result: Pick<FacebookVideoResult, "videoId" | "username" | "quality">,
): string {
  const user = result.username?.replace(/[^\w.-]+/g, "") || "facebook";
  return brandedDownloadFilename(
    `facebook-${user}-${result.videoId}-${result.quality}.mp4`,
  );
}
