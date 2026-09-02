import { createHash } from "node:crypto";

const BOT_UA =
  /bot|crawler|spider|crawling|preview|slurp|facebookexternalhit|pingdom|lighthouse|headlesschrome|wget|curl|python-requests|go-http-client|bytespider|semrush|ahrefs|dotbot/i;

export function hashVisitorIp(ip: string): string {
  const salt =
    process.env.ANALYTICS_IP_SALT?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    (process.env.NODE_ENV === "production" ? null : "focera-analytics-dev");
  if (!salt) {
    return createHash("sha256")
      .update(`ephemeral:${ip}:${process.pid}`)
      .digest("hex")
      .slice(0, 32);
  }
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export function extractRequestIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || null;
}

export function extractRequestCountry(request: Request): string | null {
  return (
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    null
  );
}

export function isBotUserAgent(ua: string | null): boolean {
  if (!ua) return false;
  return BOT_UA.test(ua);
}
