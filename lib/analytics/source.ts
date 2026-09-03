/**
 * Classify landing referrers / UTM values into admin-friendly sources
 * (Google, ChatGPT, Direct, …).
 */

const EXACT_SOURCES: Record<string, string> = {
  chatgpt: "ChatGPT",
  "chatgpt.com": "ChatGPT",
  "chat.openai.com": "ChatGPT",
  "openai.com": "ChatGPT",
  gemini: "Gemini",
  "gemini.google.com": "Gemini",
  "bard.google.com": "Gemini",
  perplexity: "Perplexity",
  "perplexity.ai": "Perplexity",
  "www.perplexity.ai": "Perplexity",
  claude: "Claude",
  "claude.ai": "Claude",
  "anthropic.com": "Claude",
  copilot: "Copilot",
  "copilot.microsoft.com": "Copilot",
  grok: "Grok",
  "grok.com": "Grok",
  "grok.x.ai": "Grok",
  "x.ai": "Grok",
  "you.com": "You.com",
  "poe.com": "Poe",
  "meta.ai": "Meta AI",
  "phind.com": "Phind",
  "character.ai": "Character.AI",
  "mistral.ai": "Mistral",
  "deepseek.com": "DeepSeek",
  "chat.deepseek.com": "DeepSeek",
  "huggingface.co": "Hugging Face",
  "kimi.com": "Kimi",
  "kimi.moonshot.cn": "Kimi",
  google: "Google",
  "google.com": "Google",
  "googleweblight.com": "Google",
  bing: "Bing",
  "bing.com": "Bing",
  duckduckgo: "DuckDuckGo",
  "duckduckgo.com": "DuckDuckGo",
  yahoo: "Yahoo",
  "yahoo.com": "Yahoo",
  yandex: "Yandex",
  "yandex.com": "Yandex",
  "yandex.ru": "Yandex",
  baidu: "Baidu",
  "baidu.com": "Baidu",
  ecosia: "Ecosia",
  "ecosia.org": "Ecosia",
  brave: "Brave",
  "search.brave.com": "Brave",
  facebook: "Facebook",
  "facebook.com": "Facebook",
  "fb.com": "Facebook",
  "l.facebook.com": "Facebook",
  "lm.facebook.com": "Facebook",
  "m.facebook.com": "Facebook",
  instagram: "Instagram",
  "instagram.com": "Instagram",
  "l.instagram.com": "Instagram",
  twitter: "X",
  "twitter.com": "X",
  "x.com": "X",
  "t.co": "X",
  linkedin: "LinkedIn",
  "linkedin.com": "LinkedIn",
  "lnkd.in": "LinkedIn",
  reddit: "Reddit",
  "reddit.com": "Reddit",
  youtube: "YouTube",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  tiktok: "TikTok",
  "tiktok.com": "TikTok",
  pinterest: "Pinterest",
  "pinterest.com": "Pinterest",
  threads: "Threads",
  "threads.net": "Threads",
  whatsapp: "WhatsApp",
  "whatsapp.com": "WhatsApp",
  "wa.me": "WhatsApp",
  telegram: "Telegram",
  "telegram.org": "Telegram",
  "t.me": "Telegram",
  discord: "Discord",
  "discord.com": "Discord",
  github: "GitHub",
  "github.com": "GitHub",
  "producthunt.com": "Product Hunt",
  "news.ycombinator.com": "Hacker News",
  "hn.algolia.com": "Hacker News",
};

function hostnameOf(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    const token = trimmed
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      ?.split("?")[0]
      ?.replace(/^www\./, "");
    return token || null;
  }
}

function ownSiteHosts(): string[] {
  const hosts = ["focera.co"];
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    try {
      hosts.push(new URL(site).hostname.replace(/^www\./i, "").toLowerCase());
    } catch {
      // ignore invalid site URL
    }
  }
  return hosts;
}

export function isOwnSiteReferrer(referrer: string | null | undefined): boolean {
  if (!referrer?.trim()) return true;
  const host = hostnameOf(referrer);
  if (!host) return false;
  if (host === "localhost" || host === "127.0.0.1") return true;
  return ownSiteHosts().some(
    (own) => host === own || host.endsWith(`.${own}`),
  );
}

function classifyHost(host: string): string {
  const exact = EXACT_SOURCES[host];
  if (exact) return exact;

  if (
    host === "gemini.google.com" ||
    host === "bard.google.com" ||
    host.endsWith(".gemini.google.com")
  ) {
    return "Gemini";
  }
  if (
    host === "google.com" ||
    host.startsWith("google.") ||
    host.endsWith(".google.com") ||
    host.endsWith(".google.co.uk") ||
    host.includes("googleweblight")
  ) {
    return "Google";
  }
  if (host === "bing.com" || host.endsWith(".bing.com")) return "Bing";
  if (host.endsWith(".yahoo.com") || host.startsWith("yahoo.")) return "Yahoo";
  if (host.endsWith(".yandex.com") || host.endsWith(".yandex.ru") || host.startsWith("yandex.")) {
    return "Yandex";
  }
  if (host.endsWith(".baidu.com")) return "Baidu";
  if (host.endsWith(".facebook.com") || host.endsWith(".fb.com")) return "Facebook";
  if (host.endsWith(".instagram.com")) return "Instagram";
  if (host.endsWith(".linkedin.com")) return "LinkedIn";
  if (host.endsWith(".reddit.com")) return "Reddit";
  if (host.endsWith(".youtube.com")) return "YouTube";
  if (host.endsWith(".tiktok.com")) return "TikTok";
  if (host.endsWith(".pinterest.com")) return "Pinterest";
  if (host.endsWith(".openai.com")) return "ChatGPT";

  return host;
}

/**
 * Turn a stored referrer URL, hostname, or utm_source into a display name.
 */
export function classifyTrafficSource(
  referrer?: string | null,
  utmSource?: string | null,
): string {
  const utm = utmSource?.trim().toLowerCase();
  if (utm) {
    const utmHost = hostnameOf(utm) || utm.replace(/^www\./, "");
    const named = EXACT_SOURCES[utmHost] || EXACT_SOURCES[utm];
    if (named) return named;
    if (utmHost.includes(".")) return classifyHost(utmHost);
    if (utmHost) return utmHost;
  }

  if (!referrer?.trim() || isOwnSiteReferrer(referrer)) return "Direct";

  const host = hostnameOf(referrer);
  if (!host) return "Direct";
  return classifyHost(host);
}

/** Encode a utm_source / click-id into a referrer-like URL for storage. */
export function referrerFromUtmSource(utmSource: string): string {
  const trimmed = utmSource.trim();
  if (!trimmed) return trimmed;
  const host = hostnameOf(trimmed);
  if (host && host.includes(".")) return `https://${host}/`;
  const named = EXACT_SOURCES[trimmed.toLowerCase()];
  if (named) {
    const alias = Object.keys(EXACT_SOURCES).find(
      (key) => EXACT_SOURCES[key] === named && key.includes("."),
    );
    if (alias) return `https://${alias}/`;
  }
  return trimmed.slice(0, 200);
}

export function clickIdReferrer(params: {
  get(name: string): string | null;
  has(name: string): boolean;
}): string | undefined {
  if (
    params.has("gclid") ||
    params.has("gbraid") ||
    params.has("wbraid") ||
    params.get("gad_source")
  ) {
    return "https://www.google.com/";
  }
  if (params.has("fbclid")) return "https://www.facebook.com/";
  if (params.has("msclkid")) return "https://www.bing.com/";
  if (params.has("ttclid")) return "https://www.tiktok.com/";
  return undefined;
}

export function aggregateNamedCounts(
  rows: Array<{ name: string; count: number }>,
  limit = 12,
): Array<{ name: string; count: number }> {
  const merged = new Map<string, number>();
  for (const row of rows) {
    merged.set(row.name, (merged.get(row.name) ?? 0) + row.count);
  }
  const sorted = [...merged.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));
  if (sorted.length <= limit) return sorted;
  const head = sorted.slice(0, limit);
  const rest = sorted.slice(limit).reduce((sum, row) => sum + row.count, 0);
  if (rest > 0) head.push({ name: "Other", count: rest });
  return head;
}
