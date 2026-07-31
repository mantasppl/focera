import {
  instagramPermalink,
  parseInstagramShortcode,
  type InstagramMediaKind,
  type InstagramVideoItem,
  type InstagramVideoResult,
} from "@/lib/instagram-video";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

const IG_APP_ID = "936619743392459";
/** PolarisPostRootQuery — returns xdt_api__v1__media__shortcode__web_info */
const DOC_ID = "24368985919464652";

type Session = {
  csrf: string;
  cookie: string;
};

type IgVideoVersion = {
  width?: number;
  height?: number;
  url?: string;
};

type IgImageCandidate = {
  width?: number;
  height?: number;
  url?: string;
};

type IgCarouselItem = {
  id?: string;
  pk?: string | number;
  media_type?: number;
  video_versions?: IgVideoVersion[];
  image_versions2?: { candidates?: IgImageCandidate[] };
};

type IgMediaItem = {
  code?: string;
  id?: string;
  pk?: string | number;
  media_type?: number;
  product_type?: string;
  caption?: { text?: string } | null;
  user?: { username?: string } | null;
  video_versions?: IgVideoVersion[];
  image_versions2?: { candidates?: IgImageCandidate[] };
  carousel_media?: IgCarouselItem[];
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

async function bootstrapSession(): Promise<Session> {
  const response = await fetch("https://www.instagram.com/", {
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });

  const setCookie =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : response.headers.get("set-cookie");

  const csrf = pickCookie(setCookie, "csrftoken") || "missing";
  const mid = pickCookie(setCookie, "mid");
  const parts = [`csrftoken=${csrf}`];
  if (mid) parts.push(`mid=${mid}`);

  // Consume body so the connection can close cleanly.
  await response.arrayBuffer().catch(() => undefined);

  return { csrf, cookie: parts.join("; ") };
}

function bestVideo(versions: IgVideoVersion[] | undefined): IgVideoVersion | null {
  if (!versions?.length) return null;
  return [...versions].sort(
    (a, b) => (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0),
  )[0]!;
}

function bestImage(
  candidates: IgImageCandidate[] | undefined,
): IgImageCandidate | null {
  if (!candidates?.length) return null;
  return [...candidates].sort(
    (a, b) => (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0),
  )[0]!;
}

function mediaKind(media: IgMediaItem): InstagramMediaKind {
  if (media.media_type === 8 || (media.carousel_media?.length ?? 0) > 0) {
    return "carousel";
  }
  if (media.media_type === 2 || (media.video_versions?.length ?? 0) > 0) {
    return "video";
  }
  return "image";
}

function toVideoItem(
  source: {
    id?: string;
    pk?: string | number;
    video_versions?: IgVideoVersion[];
    image_versions2?: { candidates?: IgImageCandidate[] };
  },
  fallbackId: string,
): InstagramVideoItem | null {
  const video = bestVideo(source.video_versions);
  if (!video?.url) return null;
  const thumb = bestImage(source.image_versions2?.candidates);
  return {
    id: String(source.id ?? source.pk ?? fallbackId),
    width: video.width ?? null,
    height: video.height ?? null,
    thumbnailUrl: thumb?.url ?? null,
  };
}

function extractVideos(media: IgMediaItem, shortcode: string): InstagramVideoItem[] {
  if (media.carousel_media?.length) {
    const items: InstagramVideoItem[] = [];
    media.carousel_media.forEach((item, index) => {
      const video = toVideoItem(item, `${shortcode}-${index + 1}`);
      if (video) items.push(video);
    });
    return items;
  }

  const single = toVideoItem(media, shortcode);
  return single ? [single] : [];
}

async function fetchMediaByShortcode(
  shortcode: string,
  session: Session,
): Promise<IgMediaItem> {
  const variables = encodeURIComponent(JSON.stringify({ shortcode }));
  const body = [
    "fb_api_caller_class=RelayModern",
    "fb_api_req_friendly_name=PolarisPostRootQuery",
    "server_timestamps=true",
    `variables=${variables}`,
    `doc_id=${DOC_ID}`,
  ].join("&");

  const response = await fetch("https://www.instagram.com/graphql/query", {
    method: "POST",
    headers: {
      accept: "*/*",
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": BROWSER_UA,
      "x-ig-app-id": IG_APP_ID,
      "x-csrftoken": session.csrf,
      cookie: session.cookie,
      origin: "https://www.instagram.com",
      referer: `https://www.instagram.com/p/${shortcode}/`,
    },
    body,
  });

  const text = await response.text();
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Instagram rate-limited this request. Try again in a moment.");
    }
    throw new Error("Could not reach Instagram for this post.");
  }

  if (!text.startsWith("{")) {
    throw new Error("Instagram blocked the request. Try again later.");
  }

  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Instagram returned an invalid response.");
  }

  const media = (
    json as {
      data?: {
        xdt_api__v1__media__shortcode__web_info?: { items?: IgMediaItem[] };
      };
    }
  )?.data?.xdt_api__v1__media__shortcode__web_info?.items?.[0];

  if (!media) {
    throw new Error(
      "Post not found, private, or unavailable. Only public Instagram videos work.",
    );
  }

  return media;
}

async function resolveVideoUrl(
  shortcode: string,
  videoId: string,
  session: Session,
): Promise<string> {
  const media = await fetchMediaByShortcode(shortcode, session);

  if (media.carousel_media?.length) {
    for (const [index, item] of media.carousel_media.entries()) {
      const id = String(item.id ?? item.pk ?? `${shortcode}-${index + 1}`);
      if (id !== videoId) continue;
      const video = bestVideo(item.video_versions);
      if (video?.url) return video.url;
    }
  }

  const singleId = String(media.id ?? media.pk ?? shortcode);
  if (singleId === videoId || videoId === shortcode) {
    const video = bestVideo(media.video_versions);
    if (video?.url) return video.url;
  }

  // Fallback: first available video when id mismatches after Instagram reshuffles.
  const videos = extractVideos(media, shortcode);
  if (videos.length === 1) {
    const video = bestVideo(media.video_versions);
    if (video?.url) return video.url;
    for (const item of media.carousel_media ?? []) {
      const v = bestVideo(item.video_versions);
      if (v?.url) return v.url;
    }
  }

  throw new Error("Could not find a downloadable video URL for this post.");
}

export async function fetchInstagramVideo(
  input: string,
): Promise<InstagramVideoResult> {
  const shortcode = parseInstagramShortcode(input);
  if (!shortcode) {
    throw new Error("Enter a valid Instagram URL or shortcode.");
  }

  const session = await bootstrapSession();
  const media = await fetchMediaByShortcode(shortcode, session);
  const videos = extractVideos(media, shortcode);
  const kind = mediaKind(media);
  const thumb = bestImage(media.image_versions2?.candidates);

  if (kind === "image" || videos.length === 0) {
    throw new Error(
      "This Instagram post does not contain a public video. Photos and private posts cannot be downloaded.",
    );
  }

  return {
    shortcode: media.code || shortcode,
    permalink: instagramPermalink(media.code || shortcode),
    username: media.user?.username ?? null,
    caption: media.caption?.text?.trim() || null,
    kind,
    thumbnailUrl: thumb?.url ?? videos[0]?.thumbnailUrl ?? null,
    videos,
  };
}

export async function streamInstagramVideo(options: {
  shortcode: string;
  videoId: string;
}): Promise<{
  response: Response;
  filenameHint: string;
  contentType: string;
}> {
  const shortcode = parseInstagramShortcode(options.shortcode);
  if (!shortcode) {
    throw new Error("Invalid Instagram shortcode.");
  }

  const session = await bootstrapSession();
  const videoUrl = await resolveVideoUrl(shortcode, options.videoId, session);

  const upstream = await fetch(videoUrl, {
    headers: {
      "User-Agent": BROWSER_UA,
      Referer: "https://www.instagram.com/",
      Accept: "video/mp4,video/*,*/*;q=0.8",
    },
    redirect: "follow",
  });

  if (!upstream.ok || !upstream.body) {
    throw new Error("Could not download the Instagram video file.");
  }

  const contentType = upstream.headers.get("content-type") || "video/mp4";
  return {
    response: upstream,
    filenameHint: `instagram-${shortcode}.mp4`,
    contentType,
  };
}
