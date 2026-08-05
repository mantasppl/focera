import {
  facebookPermalink,
  isFacebookUrl,
  parseFacebookVideoId,
  type FacebookVideoResult,
} from "@/lib/facebook-video";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

/** Non-browser UA avoids FBCDN rate limits on large progressive downloads. */
const DOWNLOAD_UA = "facebookexternalhit/1.1";

type ResolvedMedia = {
  videoId: string;
  username: string | null;
  caption: string | null;
  title: string | null;
  quality: "hd" | "sd";
  thumbnailUrl: string | null;
  videoUrl: string;
  permalink: string;
};

function decodeFbString(raw: string): string {
  return raw
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"');
}

function extractQuotedUrl(html: string, key: string): string | null {
  const re = new RegExp(`"${key}"\\s*:\\s*"(https:[^"]+)"`);
  const match = html.match(re);
  return match?.[1] ? decodeFbString(match[1]) : null;
}

function extractMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(
      `property=["']${property}["']\\s+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `content=["']([^"']+)["']\\s+property=["']${property}["']`,
      "i",
    ),
    new RegExp(`name=["']${property}["']\\s+content=["']([^"']+)["']`, "i"),
    new RegExp(`content=["']([^"']+)["']\\s+name=["']${property}["']`, "i"),
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return decodeHtmlEntities(match[1]);
  }
  return null;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);?/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#xb7;|&middot;/gi, "·")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function normalizeInputUrl(input: string): string {
  const trimmed = input.trim();
  if (/^\d{5,30}$/.test(trimmed)) {
    return facebookPermalink(trimmed);
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Prefer a canonical watch URL when we already know the numeric id. */
function canonicalFetchUrl(input: string, videoId: string | null): string {
  if (videoId) return facebookPermalink(videoId);
  return normalizeInputUrl(input);
}

function usernameFromFinalUrl(finalUrl: string): string | null {
  try {
    const url = new URL(finalUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    // /{username}/videos/{id}
    if (
      parts.length >= 3 &&
      parts[1]?.toLowerCase() === "videos" &&
      parts[0] &&
      !/^\d+$/.test(parts[0])
    ) {
      return parts[0];
    }
  } catch {
    // ignore
  }
  return null;
}

function extractOwnerName(html: string): string | null {
  const patterns = [
    /"video_owner"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/,
    /"owner"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/,
    /"ownerName"\s*:\s*"([^"]+)"/,
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return decodeFbString(match[1]);
  }
  return null;
}

function extractUsername(html: string, finalUrl: string): string | null {
  const patterns = [
    /"video_owner"\s*:\s*\{[^}]*"username"\s*:\s*"([^"]+)"/,
    /"owner"\s*:\s*\{[^}]*"username"\s*:\s*"([^"]+)"/,
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return decodeFbString(match[1]);
  }
  return usernameFromFinalUrl(finalUrl) || extractOwnerName(html);
}

function cleanTitle(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/\s*[|·]\s*Facebook\s*$/i, "")
    .replace(/^\d[\d.,]*\s*[KMB]?\s*views\s*[·|]\s*/i, "")
    .replace(/^\d[\d.,]*\s*[KMB]?\s*reactions?\s*[·|]\s*/i, "")
    .trim();
  return cleaned || null;
}

function extractThumbnail(html: string): string | null {
  const og = extractMetaContent(html, "og:image");
  if (og && /^https?:\/\//i.test(og) && !/lookaside\.fbsbx\.com.+get_thumbnail=1/i.test(og)) {
    return og;
  }

  const patterns = [
    /"preferred_thumbnail"\s*:\s*\{[^}]*?"image"\s*:\s*\{[^}]*?"uri"\s*:\s*"(https:[^"]+)"/,
    /"thumbnailImage"\s*:\s*\{[^}]*?"uri"\s*:\s*"(https:[^"]+)"/,
    /"previewImage"\s*:\s*\{[^}]*?"uri"\s*:\s*"(https:[^"]+)"/,
    /"image"\s*:\s*\{[^}]*?"uri"\s*:\s*"(https:[^"]+scontent[^"]+)"/,
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return decodeFbString(match[1]);
  }

  return og;
}

async function fetchVideoPage(url: string): Promise<{
  html: string;
  finalUrl: string;
}> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.facebook.com/",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Facebook rate-limited this request. Try again in a moment.");
    }
    if (response.status === 404) {
      throw new Error(
        "Video not found, private, or unavailable. Only public Facebook videos work.",
      );
    }
    throw new Error("Could not reach Facebook for this video.");
  }

  const html = await response.text();

  if (
    /You must log in to continue|id="login_form"|id="loginbutton"/i.test(html) &&
    !/"browser_native_(?:hd|sd)_url"/.test(html)
  ) {
    throw new Error(
      "Video not found, private, or unavailable. Only public Facebook videos work.",
    );
  }

  if (/captcha|checkpoint\/block/i.test(html) && html.length < 5000) {
    throw new Error("Facebook blocked the request. Try again later.");
  }

  return {
    html,
    finalUrl: response.url || url,
  };
}

function pickVideoUrl(html: string): { url: string; quality: "hd" | "sd" } | null {
  const hd =
    extractQuotedUrl(html, "browser_native_hd_url") ||
    extractQuotedUrl(html, "playable_url_quality_hd");
  if (hd) return { url: hd, quality: "hd" };

  const sd =
    extractQuotedUrl(html, "browser_native_sd_url") ||
    extractQuotedUrl(html, "playable_url");
  if (sd) return { url: sd, quality: "sd" };

  // Legacy progressive sources
  const hdSrc =
    extractQuotedUrl(html, "hd_src_no_ratelimit") ||
    extractQuotedUrl(html, "hd_src");
  if (hdSrc) return { url: hdSrc, quality: "hd" };

  const sdSrc =
    extractQuotedUrl(html, "sd_src_no_ratelimit") ||
    extractQuotedUrl(html, "sd_src");
  if (sdSrc) return { url: sdSrc, quality: "sd" };

  return null;
}

async function resolveMedia(input: string): Promise<ResolvedMedia> {
  if (!isFacebookUrl(input)) {
    throw new Error("Enter a valid Facebook URL.");
  }

  let videoId = parseFacebookVideoId(input);
  let pageUrl = canonicalFetchUrl(input, videoId);

  // Short / share links: follow redirects first to discover the video id.
  if (!videoId) {
    const { html, finalUrl } = await fetchVideoPage(normalizeInputUrl(input));
    videoId =
      parseFacebookVideoId(finalUrl) ||
      html.match(/"video_id"\s*:\s*"(\d+)"/)?.[1] ||
      html.match(/"videoId"\s*:\s*"(\d+)"/)?.[1] ||
      html.match(/\/(?:videos|reel|reels|watch)\/(\d+)/)?.[1] ||
      null;

    if (!videoId) {
      throw new Error(
        "Video not found, private, or unavailable. Only public Facebook videos work.",
      );
    }

    pageUrl = facebookPermalink(videoId);
  }

  const { html, finalUrl } = await fetchVideoPage(pageUrl);
  const resolvedId =
    parseFacebookVideoId(finalUrl) ||
    videoId ||
    html.match(/"video_id"\s*:\s*"(\d+)"/)?.[1] ||
    null;

  if (!resolvedId) {
    throw new Error(
      "Video not found, private, or unavailable. Only public Facebook videos work.",
    );
  }

  const picked = pickVideoUrl(html);
  if (!picked) {
    if (/photo|image/i.test(extractMetaContent(html, "og:type") || "")) {
      throw new Error(
        "This Facebook post does not contain a public video. Photos cannot be downloaded here.",
      );
    }
    throw new Error(
      "This Facebook post does not contain a public video. Private and login-walled posts cannot be downloaded.",
    );
  }

  const title = cleanTitle(
    extractMetaContent(html, "og:title") ||
      html.match(/<title[^>]*>([^<]+)/i)?.[1] ||
      null,
  );
  const caption = extractMetaContent(html, "og:description");

  return {
    videoId: resolvedId,
    username: extractUsername(html, finalUrl),
    caption,
    title,
    quality: picked.quality,
    thumbnailUrl: extractThumbnail(html),
    videoUrl: picked.url,
    permalink: facebookPermalink(resolvedId),
  };
}

export async function fetchFacebookVideo(
  input: string,
): Promise<FacebookVideoResult> {
  const media = await resolveMedia(input);
  return {
    videoId: media.videoId,
    permalink: media.permalink,
    username: media.username,
    caption: media.caption,
    title: media.title,
    quality: media.quality,
    thumbnailUrl: media.thumbnailUrl,
  };
}

export async function streamFacebookVideo(options: {
  videoId: string;
}): Promise<{
  response: Response;
  filenameHint: string;
  contentType: string;
}> {
  const videoId = parseFacebookVideoId(options.videoId);
  if (!videoId) {
    throw new Error("Invalid Facebook video id.");
  }

  const media = await resolveMedia(facebookPermalink(videoId));

  const { fetchSafeMedia } = await import("@/lib/security/outbound");
  const upstream = await fetchSafeMedia(media.videoUrl, {
    headers: {
      "User-Agent": DOWNLOAD_UA,
      Referer: "https://www.facebook.com/",
      Accept: "video/mp4,video/*,*/*;q=0.8",
    },
    redirect: "follow",
  });

  if (!upstream.ok || !upstream.body) {
    throw new Error("Could not download the Facebook video file.");
  }

  const contentType = upstream.headers.get("content-type") || "video/mp4";
  const user = media.username?.replace(/[^\w.-]+/g, "") || "facebook";
  return {
    response: upstream,
    filenameHint: `facebook-${user}-${media.videoId}-${media.quality}.mp4`,
    contentType,
  };
}
