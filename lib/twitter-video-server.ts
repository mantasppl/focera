import {
  isTwitterUrl,
  parseTwitterStatusId,
  twitterPermalink,
  type TwitterVideoItem,
  type TwitterVideoResult,
} from "@/lib/twitter-video";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

const SYNDICATION_URL = "https://cdn.syndication.twimg.com/tweet-result";

const SYNDICATION_FEATURES = [
  "tfw_timeline_list:",
  "tfw_follower_count_sunset:true",
  "tfw_tweet_edit_backend:on",
  "tfw_refsrc_session:on",
  "tfw_fosnr_soft_interventions_enabled:on",
  "tfw_show_birdwatch_pivots_enabled:on",
  "tfw_show_business_verified_badge:on",
  "tfw_duplicate_scribes_to_settings:on",
  "tfw_use_profile_image_shape_enabled:on",
  "tfw_show_blue_verified_badge:on",
  "tfw_legacy_timeline_sunset:true",
  "tfw_show_gov_verified_badge:on",
  "tfw_show_business_affiliate_badge:on",
  "tfw_tweet_edit_frontend:on",
].join(";");

type VideoVariant = {
  bitrate?: number;
  content_type?: string;
  url?: string;
};

type MediaDetail = {
  id_str?: string;
  type?: string;
  media_url_https?: string;
  original_info?: { width?: number; height?: number };
  video_info?: {
    aspect_ratio?: number[];
    duration_millis?: number;
    variants?: VideoVariant[];
  };
};

type SyndicationTweet = {
  __typename?: string;
  id_str?: string;
  text?: string;
  user?: { screen_name?: string; name?: string };
  mediaDetails?: MediaDetail[];
  video?: {
    poster?: string;
    variants?: Array<{ type?: string; src?: string; bitrate?: number }>;
  };
};

type ResolvedVideo = TwitterVideoItem & {
  videoUrl: string;
};

type ResolvedMedia = {
  statusId: string;
  username: string | null;
  caption: string | null;
  thumbnailUrl: string | null;
  videos: ResolvedVideo[];
};

/** Token required by Twitter's public syndication embed endpoint. */
function syndicationToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI)
    .toString(36)
    .replace(/(0+|\.)/g, "");
}

function mediaIdFromUrl(url: string | undefined, fallback: string): string {
  if (!url) return fallback;
  const match = url.match(
    /\/(?:ext_tw_video(?:_thumb)?|tweet_video(?:_thumb)?|amplify_video(?:_thumb)?)\/(\d+)\//,
  );
  if (match?.[1]) return match[1];
  return fallback;
}

function pickBestMp4(variants: VideoVariant[] | undefined): string | null {
  if (!variants?.length) return null;
  const mp4s = variants.filter(
    (v) =>
      v.url &&
      (v.content_type === "video/mp4" ||
        (!v.content_type && /\.mp4(\?|$)/i.test(v.url))),
  );
  if (!mp4s.length) return null;
  mp4s.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));
  return mp4s[0]?.url ?? null;
}

function extractVideos(
  tweet: SyndicationTweet,
  statusId: string,
): ResolvedVideo[] {
  const details = tweet.mediaDetails ?? [];
  const fromDetails: ResolvedVideo[] = [];

  details.forEach((media, index) => {
    const type = (media.type || "").toLowerCase();
    if (type !== "video" && type !== "animated_gif") return;

    const videoUrl = pickBestMp4(media.video_info?.variants);
    if (!videoUrl) return;

    const id = mediaIdFromUrl(
      media.media_url_https || videoUrl,
      `${statusId}-${index + 1}`,
    );

    fromDetails.push({
      id,
      width: media.original_info?.width ?? null,
      height: media.original_info?.height ?? null,
      thumbnailUrl: media.media_url_https ?? null,
      kind: type === "animated_gif" ? "gif" : "video",
      videoUrl,
    });
  });

  if (fromDetails.length) return fromDetails;

  // Fallback: top-level `video` object (single clip).
  const topVariants = (tweet.video?.variants ?? []).map((v) => ({
    bitrate: v.bitrate,
    content_type: v.type,
    url: v.src,
  }));
  const videoUrl = pickBestMp4(topVariants);
  if (!videoUrl) return [];

  return [
    {
      id: statusId,
      width: null,
      height: null,
      thumbnailUrl: tweet.video?.poster ?? null,
      kind: "video",
      videoUrl,
    },
  ];
}

async function fetchSyndicationTweet(statusId: string): Promise<SyndicationTweet> {
  const url = new URL(SYNDICATION_URL);
  url.searchParams.set("id", statusId);
  url.searchParams.set("lang", "en");
  url.searchParams.set("token", syndicationToken(statusId));
  url.searchParams.set("features", SYNDICATION_FEATURES);

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "application/json,text/javascript,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://platform.twitter.com/",
    },
    redirect: "follow",
  });

  if (response.status === 404) {
    throw new Error(
      "Post not found, private, or unavailable. Only public Twitter/X videos work.",
    );
  }

  if (response.status === 429) {
    throw new Error("Twitter rate-limited this request. Try again in a moment.");
  }

  if (!response.ok) {
    throw new Error("Could not reach Twitter/X for this post.");
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("json")) {
    throw new Error("Twitter returned an unexpected page. Try again later.");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("Twitter returned an invalid response.");
  }

  if (!data || typeof data !== "object" || Object.keys(data as object).length === 0) {
    throw new Error(
      "Post not found, private, or unavailable. Only public Twitter/X videos work.",
    );
  }

  const tweet = data as SyndicationTweet;
  if (tweet.__typename === "TweetTombstone") {
    throw new Error(
      "This post was deleted or is unavailable. Only public Twitter/X videos work.",
    );
  }

  return tweet;
}

async function resolveMedia(input: string): Promise<ResolvedMedia> {
  if (!isTwitterUrl(input)) {
    throw new Error("Enter a valid Twitter/X URL.");
  }

  const statusId = parseTwitterStatusId(input);
  if (!statusId) {
    throw new Error("Enter a valid Twitter/X URL.");
  }

  const tweet = await fetchSyndicationTweet(statusId);
  const resolvedId = tweet.id_str || statusId;
  const videos = extractVideos(tweet, resolvedId);

  if (!videos.length) {
    throw new Error(
      "This post does not contain a public video. Photos and private posts cannot be downloaded.",
    );
  }

  return {
    statusId: resolvedId,
    username: tweet.user?.screen_name ?? null,
    caption: tweet.text?.trim() || null,
    thumbnailUrl: videos[0]?.thumbnailUrl ?? tweet.video?.poster ?? null,
    videos,
  };
}

export async function fetchTwitterVideo(
  input: string,
): Promise<TwitterVideoResult> {
  const media = await resolveMedia(input);
  return {
    statusId: media.statusId,
    permalink: twitterPermalink(media.statusId, media.username),
    username: media.username,
    caption: media.caption,
    thumbnailUrl: media.thumbnailUrl,
    videos: media.videos.map(({ videoUrl: _url, ...item }) => item),
  };
}

export async function streamTwitterVideo(options: {
  statusId: string;
  videoId: string;
}): Promise<{
  response: Response;
  filenameHint: string;
  contentType: string;
}> {
  const statusId = parseTwitterStatusId(options.statusId);
  if (!statusId) {
    throw new Error("Invalid Twitter/X status id.");
  }

  const videoId = options.videoId.trim();
  if (!videoId) {
    throw new Error("Missing video id.");
  }

  const media = await resolveMedia(statusId);
  const match =
    media.videos.find((v) => v.id === videoId) ??
    (media.videos.length === 1 ? media.videos[0] : undefined);

  if (!match?.videoUrl) {
    throw new Error("Could not find a downloadable video URL for this post.");
  }

  const upstream = await fetch(match.videoUrl, {
    headers: {
      "User-Agent": BROWSER_UA,
      Referer: "https://x.com/",
      Accept: "video/mp4,video/*,*/*;q=0.8",
    },
    redirect: "follow",
  });

  if (!upstream.ok || !upstream.body) {
    throw new Error("Could not download the Twitter/X video file.");
  }

  const contentType = upstream.headers.get("content-type") || "video/mp4";
  const user = media.username?.replace(/[^\w.-]+/g, "") || "twitter";
  return {
    response: upstream,
    filenameHint: `twitter-${user}-${media.statusId}.mp4`,
    contentType,
  };
}
