const ID_RE = /^[a-zA-Z0-9_-]{8,16}$/;

export function youtubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    let id = "";

    if (host === "youtu.be") {
      id = parsed.pathname.split("/").filter(Boolean)[0] || "";
    } else if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
      id =
        parsed.searchParams.get("v") ||
        parsed.pathname.match(/\/(?:embed|shorts|v)\/([^/]+)/)?.[1] ||
        "";
    } else {
      return null;
    }

    const clean = id.replace(/[^a-zA-Z0-9_-]/g, "");
    return ID_RE.test(clean) ? clean : null;
  } catch {
    return null;
  }
}

export function youtubeEmbedUrl(url: string): string | null {
  const id = youtubeVideoId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
