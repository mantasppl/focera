import { SITE_NAME, SITE_URL } from "@/lib/seo";

export type ShareNetworkId =
  | "facebook"
  | "x"
  | "linkedin"
  | "whatsapp"
  | "telegram"
  | "reddit"
  | "pinterest"
  | "threads"
  | "bluesky"
  | "tumblr"
  | "qr"
  | "email";

export type ShareNetwork = {
  id: ShareNetworkId;
  label: string;
};

export const SHARE_NETWORKS: ShareNetwork[] = [
  { id: "facebook", label: "Facebook" },
  { id: "x", label: "X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "reddit", label: "Reddit" },
  { id: "pinterest", label: "Pinterest" },
  { id: "threads", label: "Threads" },
  { id: "bluesky", label: "Bluesky" },
  { id: "tumblr", label: "Tumblr" },
  { id: "qr", label: "QR code" },
  { id: "email", label: "Email" },
];

export function canonicalShareUrl(override?: string): string {
  if (override) return override;
  if (typeof window === "undefined") return SITE_URL;
  const path = window.location.pathname || "/";
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path}`;
}

export function sharePageTitle(override?: string): string {
  if (override) return override;
  if (typeof document !== "undefined" && document.title) {
    return document.title;
  }
  return SITE_NAME;
}

export function sharePageText(title: string, override?: string): string {
  if (override) return override;
  return `${title} — free online tools on ${SITE_NAME}`;
}

export function shareNetworkHref(
  id: ShareNetworkId,
  url: string,
  text: string,
): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const composed = encodeURIComponent(`${text} ${url}`);

  switch (id) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "x":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "whatsapp":
      return `https://wa.me/?text=${composed}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
    case "pinterest":
      return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`;
    case "threads":
      return `https://www.threads.net/intent/post?text=${composed}`;
    case "bluesky":
      return `https://bsky.app/intent/compose?text=${composed}`;
    case "tumblr":
      return `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodedUrl}&title=${encodedText}&caption=${encodedText}`;
    case "email":
      return `mailto:?subject=${encodedText}&body=${composed}`;
    case "qr":
      return url;
  }
}
