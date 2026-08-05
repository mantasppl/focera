import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import puppeteer, { type Browser, type PDFOptions } from "puppeteer";
import {
  normalizePageUrl,
  type UrlToPdfPageFormat,
  URL_TO_PDF_MAX_BYTES,
} from "@/lib/url-to-pdf";

/** Chromium PDF height ceiling (CSS px) for a single continuous page. */
const MAX_FULL_PAGE_HEIGHT_PX = 16_000;
const VIEWPORT_WIDTH = 1280;
const NAVIGATION_TIMEOUT_MS = 45_000;
const RENDER_SETTLE_MS = 750;

export class UrlToPdfError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "UrlToPdfError";
    this.status = status;
  }
}

export type UrlToPdfResult = {
  pdf: Buffer;
  title: string;
  finalUrl: string;
  pageCountHint: "full" | "paginated";
};

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".lan") ||
    host === "metadata.google.internal" ||
    host === "metadata"
  ) {
    return true;
  }
  return false;
}

function isPrivateOrLocalIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === undefined || b === undefined) return true;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    // Carrier-grade NAT
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }
  if (version === 6) {
    const normalized = ip.toLowerCase();
    if (normalized === "::" || normalized === "::1") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    if (normalized.startsWith("fe80:")) return true;
    // IPv4-mapped
    if (normalized.startsWith("::ffff:")) {
      const mapped = normalized.slice(7);
      if (isIP(mapped) === 4) return isPrivateOrLocalIp(mapped);
    }
    return false;
  }
  return true;
}

/** SSRF-safe public page URL: https only, no credentials, no private hosts/IPs. */
export async function assertSafePublicPageUrl(rawUrl: string): Promise<string> {
  const normalized = normalizePageUrl(rawUrl);
  if (!normalized) {
    throw new UrlToPdfError("Enter a valid webpage URL (https://…).", 400);
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new UrlToPdfError("Enter a valid webpage URL (https://…).", 400);
  }

  if (parsed.protocol !== "https:") {
    throw new UrlToPdfError("Only HTTPS URLs are supported.", 400);
  }
  if (parsed.username || parsed.password) {
    throw new UrlToPdfError("URLs with credentials are not allowed.", 400);
  }
  if (isBlockedHostname(parsed.hostname)) {
    throw new UrlToPdfError("This URL cannot be converted.", 400);
  }

  const hostIp = isIP(parsed.hostname);
  if (hostIp) {
    if (isPrivateOrLocalIp(parsed.hostname)) {
      throw new UrlToPdfError("This URL cannot be converted.", 400);
    }
    return parsed.toString();
  }

  try {
    const records = await lookup(parsed.hostname, { all: true, verbatim: true });
    if (!records.length) {
      throw new UrlToPdfError("Could not resolve this hostname.", 400);
    }
    for (const record of records) {
      if (isPrivateOrLocalIp(record.address)) {
        throw new UrlToPdfError("This URL cannot be converted.", 400);
      }
    }
  } catch (err) {
    if (err instanceof UrlToPdfError) throw err;
    throw new UrlToPdfError("Could not resolve this hostname.", 400);
  }

  return parsed.toString();
}

async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
    ],
  });
}

async function scrollFullPage(page: Awaited<ReturnType<Browser["newPage"]>>) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const distance = 800;
      let total = 0;
      const maxScroll = Math.min(
        Math.max(
          document.documentElement.scrollHeight,
          document.body?.scrollHeight ?? 0,
        ),
        40_000,
      );
      const timer = window.setInterval(() => {
        window.scrollBy(0, distance);
        total += distance;
        if (total >= maxScroll) {
          window.clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 50);
    });
  });
}

function pdfOptionsForFormat(
  format: UrlToPdfPageFormat,
  widthPx: number,
  heightPx: number,
): { options: PDFOptions; pageCountHint: "full" | "paginated" } {
  if (format === "full" && heightPx <= MAX_FULL_PAGE_HEIGHT_PX) {
    return {
      pageCountHint: "full",
      options: {
        width: `${Math.max(320, Math.min(widthPx, 1920))}px`,
        height: `${Math.max(400, heightPx)}px`,
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      },
    };
  }

  return {
    pageCountHint: "paginated",
    options: {
      format: format === "letter" ? "Letter" : "A4",
      printBackground: true,
      margin: { top: "0.4in", right: "0.4in", bottom: "0.4in", left: "0.4in" },
      preferCSSPageSize: false,
    },
  };
}

export async function renderUrlToPdf(options: {
  url: string;
  format?: UrlToPdfPageFormat;
}): Promise<UrlToPdfResult> {
  const format = options.format ?? "full";
  const safeUrl = await assertSafePublicPageUrl(options.url);

  let browser: Browser | null = null;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({
      width: VIEWPORT_WIDTH,
      height: 900,
      deviceScaleFactor: 1,
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 FoceraUrlToPdf/1.0",
    );

    const response = await page.goto(safeUrl, {
      waitUntil: "networkidle2",
      timeout: NAVIGATION_TIMEOUT_MS,
    });

    if (!response) {
      throw new UrlToPdfError("The page did not respond.", 502);
    }

    const status = response.status();
    if (status >= 400) {
      throw new UrlToPdfError(
        status === 404
          ? "Page not found (404)."
          : `The page returned HTTP ${status}.`,
        status === 404 ? 422 : 502,
      );
    }

    // Block navigations to non-https / private after redirects.
    const finalUrl = page.url();
    await assertSafePublicPageUrl(finalUrl);

    await scrollFullPage(page);
    await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const width = Math.max(
        doc.scrollWidth,
        body?.scrollWidth ?? 0,
        doc.clientWidth,
      );
      const height = Math.max(
        doc.scrollHeight,
        body?.scrollHeight ?? 0,
        doc.clientHeight,
      );
      return {
        width: Math.ceil(width),
        height: Math.ceil(height),
        title: document.title?.trim() || "",
      };
    });

    const { options: pdfOptions, pageCountHint } = pdfOptionsForFormat(
      format,
      metrics.width || VIEWPORT_WIDTH,
      metrics.height || 900,
    );

    const pdf = Buffer.from(await page.pdf(pdfOptions));

    if (!pdf.length) {
      throw new UrlToPdfError("PDF generation produced an empty file.", 502);
    }
    if (pdf.length > URL_TO_PDF_MAX_BYTES) {
      throw new UrlToPdfError(
        "The generated PDF is too large. Try a shorter page or A4/Letter format.",
        422,
      );
    }

    return {
      pdf,
      title: metrics.title || new URL(finalUrl).hostname,
      finalUrl,
      pageCountHint:
        format === "full" && pageCountHint === "paginated"
          ? "paginated"
          : pageCountHint,
    };
  } catch (err) {
    if (err instanceof UrlToPdfError) throw err;

    const message = err instanceof Error ? err.message : "";
    if (/timeout|Navigation timeout|TimeoutError/i.test(message)) {
      throw new UrlToPdfError(
        "Timed out loading this page. Try again or use a simpler URL.",
        504,
      );
    }
    if (/net::ERR_|NS_ERROR_|Navigation failed/i.test(message)) {
      throw new UrlToPdfError(
        "Could not load this page. Check the URL and try again.",
        502,
      );
    }
    if (/Could not find Chrome|Failed to launch|browser process/i.test(message)) {
      throw new UrlToPdfError(
        "PDF rendering is temporarily unavailable on this server.",
        503,
      );
    }

    throw new UrlToPdfError(
      "Could not convert this webpage to PDF.",
      502,
    );
  } finally {
    if (browser) {
      await browser.close().catch(() => undefined);
    }
  }
}
