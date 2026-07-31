const SHORTCODE_RE = /^[A-Za-z0-9_-]{5,20}$/;

export type InstagramMediaKind = "video" | "image" | "carousel";

export type InstagramVideoItem = {
  id: string;
  width: number | null;
  height: number | null;
  thumbnailUrl: string | null;
};

export type InstagramVideoResult = {
  shortcode: string;
  permalink: string;
  username: string | null;
  caption: string | null;
  kind: InstagramMediaKind;
  thumbnailUrl: string | null;
  videos: InstagramVideoItem[];
};

export function parseInstagramShortcode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (SHORTCODE_RE.test(trimmed)) return trimmed;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    if (host !== "instagram.com" && host !== "instagr.am") return null;

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return null;

    // /p/CODE, /reel/CODE, /reels/CODE, /tv/CODE
    if (
      ["p", "reel", "reels", "tv"].includes(parts[0]!) &&
      parts[1] &&
      SHORTCODE_RE.test(parts[1])
    ) {
      return parts[1];
    }

    // /username/reel/CODE or /username/p/CODE
    if (
      parts.length >= 3 &&
      ["p", "reel", "reels", "tv"].includes(parts[1]!) &&
      parts[2] &&
      SHORTCODE_RE.test(parts[2])
    ) {
      return parts[2];
    }
  } catch {
    return null;
  }

  return null;
}

export function validateInstagramUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return "Paste an Instagram post or Reel URL.";
  if (!parseInstagramShortcode(trimmed)) {
    return "Enter a valid Instagram URL (post, Reel, or TV) or shortcode.";
  }
  return null;
}

export function instagramPermalink(shortcode: string): string {
  return `https://www.instagram.com/p/${shortcode}/`;
}

export function describeInstagramResult(result: InstagramVideoResult): string {
  const who = result.username ? `@${result.username}` : "Instagram";
  const count = result.videos.length;
  if (count > 1) {
    return `${who} · ${count} videos in this post`;
  }
  if (result.kind === "image") {
    return `${who} · this post is an image, not a video`;
  }
  return `${who} · ready to download`;
}

export function downloadFilename(
  result: Pick<InstagramVideoResult, "shortcode" | "username">,
  index = 0,
  total = 1,
): string {
  const user = result.username?.replace(/[^\w.-]+/g, "") || "instagram";
  const suffix = total > 1 ? `-${index + 1}` : "";
  return `instagram-${user}-${result.shortcode}${suffix}.mp4`;
}
