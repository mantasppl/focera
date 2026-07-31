const STATUS_ID_RE = /^\d{5,25}$/;

export type TwitterVideoItem = {
  id: string;
  width: number | null;
  height: number | null;
  thumbnailUrl: string | null;
  kind: "video" | "gif";
};

export type TwitterVideoResult = {
  statusId: string;
  permalink: string;
  username: string | null;
  caption: string | null;
  thumbnailUrl: string | null;
  videos: TwitterVideoItem[];
};

const TWITTER_HOSTS = new Set([
  "twitter.com",
  "www.twitter.com",
  "mobile.twitter.com",
  "x.com",
  "www.x.com",
  "mobile.x.com",
]);

function isAllowedTwitterHost(hostname: string): boolean {
  return TWITTER_HOSTS.has(hostname.toLowerCase());
}

export function parseTwitterStatusId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (STATUS_ID_RE.test(trimmed)) return trimmed;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!isAllowedTwitterHost(url.hostname)) return null;

    const parts = url.pathname.split("/").filter(Boolean);

    // /user/status/ID or /i/status/ID or /status/ID
    const statusIdx = parts.findIndex((p) => p === "status" || p === "statuses");
    if (
      statusIdx >= 0 &&
      parts[statusIdx + 1] &&
      STATUS_ID_RE.test(parts[statusIdx + 1]!)
    ) {
      return parts[statusIdx + 1]!;
    }
  } catch {
    return null;
  }

  return null;
}

/** True when the input looks like a Twitter/X status URL we can attempt to resolve. */
export function isTwitterUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (STATUS_ID_RE.test(trimmed)) return true;
  return parseTwitterStatusId(trimmed) !== null;
}

export function validateTwitterUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return "Paste a Twitter/X post URL.";
  if (!isTwitterUrl(trimmed)) {
    return "Enter a valid Twitter or X URL (x.com or twitter.com status link).";
  }
  return null;
}

export function twitterPermalink(
  statusId: string,
  username?: string | null,
): string {
  if (username) {
    return `https://x.com/${username}/status/${statusId}`;
  }
  return `https://x.com/i/status/${statusId}`;
}

export function describeTwitterResult(result: TwitterVideoResult): string {
  const who = result.username ? `@${result.username}` : "Twitter/X";
  const count = result.videos.length;
  if (count > 1) {
    return `${who} · ${count} videos in this post`;
  }
  const kind = result.videos[0]?.kind === "gif" ? "GIF" : "video";
  if (result.videos[0]?.width && result.videos[0]?.height) {
    return `${who} · ${result.videos[0].width}×${result.videos[0].height} · ${kind} ready`;
  }
  return `${who} · ${kind} ready to download`;
}

export function downloadFilename(
  result: Pick<TwitterVideoResult, "statusId" | "username">,
  index = 0,
  total = 1,
): string {
  const user = result.username?.replace(/[^\w.-]+/g, "") || "twitter";
  const suffix = total > 1 ? `-${index + 1}` : "";
  return `twitter-${user}-${result.statusId}${suffix}.mp4`;
}
