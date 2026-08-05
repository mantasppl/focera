"use client";

import { useId, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {
  describeTikTokResult,
  downloadFilename,
  validateTikTokUrl,
  type TikTokVideoResult,
} from "@/lib/tiktok-video";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const EXAMPLE_URLS = [
  {
    label: "sample video",
    url: "https://www.tiktok.com/@huydutblox/video/7531511767806135569",
  },
];

export default function TikTokVideoDownloader() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const urlId = useId();

  const [url, setUrl] = useState("");
  const [result, setResult] = useState<TikTokVideoResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const hasResult = result !== null;
  const canFetch = url.trim().length > 0 && !loading && !downloading;

  async function fetchVideo() {
    const urlError = validateTikTokUrl(url);
    if (urlError) {
      setError(urlError);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/tiktok-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = (await response.json().catch(() => null)) as
        | TikTokVideoResult
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          data && "error" in data && data.error
            ? data.error
            : "Could not fetch this TikTok video.",
        );
      }

      if (!data || !("videoId" in data) || !data.videoId) {
        throw new Error("Could not find a video in this TikTok link.");
      }

      setResult(data);
      trackSuccess();
    } catch (err) {
      trackFailure();
      setError(
        err instanceof Error
          ? err.message
          : "Could not fetch this TikTok video.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!result) return;

    setDownloading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        videoId: result.videoId,
      });
      if (result.username) params.set("username", result.username);

      const response = await fetch(
        `/api/tiktok-video/download?${params.toString()}`,
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Could not download this TikTok video.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = downloadFilename(result);
      link.click();
      URL.revokeObjectURL(objectUrl);
      trackSuccess();
    } catch (err) {
      trackFailure();
      setError(
        err instanceof Error
          ? err.message
          : "Could not download this TikTok video.",
      );
    } finally {
      setDownloading(false);
    }
  }

  function handleReset() {
    setUrl("");
    setResult(null);
    setError("");
  }

  return (
    <div className="tool-grid tiktok-video">
      <div className="tool-panel">
        <Input
          id={urlId}
          label="TikTok URL"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            if (error) setError("");
          }}
          placeholder="https://www.tiktok.com/@user/video/…"
          hint="Paste a public TikTok video link — full URL or vm/vt short link"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          disabled={loading || downloading}
        />

        <div className="tiktok-video__examples" aria-label="Example videos">
          {EXAMPLE_URLS.map((example) => (
            <button
              key={example.url}
              type="button"
              className="tiktok-video__example"
              disabled={loading || downloading}
              onClick={() => {
                setUrl(example.url);
                if (error) setError("");
              }}
            >
              Try {example.label}
            </button>
          ))}
        </div>

        <div className="tool-actions">
          <Button onClick={() => void fetchVideo()} disabled={!canFetch}>
            {loading ? "Fetching…" : "Fetch video"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={loading || downloading || (!url && !hasResult)}
          >
            Start over
          </Button>
        </div>

        {hasResult ? (
          <div className="tool-actions">
            <Button
              onClick={() => void handleDownload()}
              disabled={downloading || loading}
            >
              {downloading ? "Downloading…" : "Download MP4"}
            </Button>
          </div>
        ) : null}

        {error ? (
          <p className="tool-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="tool-panel tool-panel--preview">
        <div
          className={cn(
            "tool-stage tiktok-video__stage",
            hasResult && "is-ready",
            (loading || downloading) && "is-loading",
          )}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">Fetching TikTok video…</span>
              <span className="tool-loading__subtext">
                Works with public videos — private accounts are blocked.
              </span>
            </div>
          ) : hasResult && result ? (
            <div className="tiktok-video__result">
              <div className="tiktok-video__meta">
                <p className="tiktok-video__title">
                  {result.username ? `@${result.username}` : "TikTok video"}
                </p>
                <p className="tiktok-video__result-meta">
                  {describeTikTokResult(result)}
                </p>
                <a
                  className="tiktok-video__link"
                  href={result.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open on TikTok
                </a>
              </div>

              {result.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote TikTok CDN poster
                <img
                  className="tiktok-video__poster"
                  src={result.thumbnailUrl}
                  alt={
                    result.username
                      ? `Preview from @${result.username}`
                      : "TikTok video preview"
                  }
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="tiktok-video__poster-fallback" aria-hidden="true">
                  Video ready
                </div>
              )}

              {result.caption ? (
                <p className="tiktok-video__caption">{result.caption}</p>
              ) : null}
            </div>
          ) : (
            <p className="tool-placeholder">
              Paste a TikTok video link to preview and download
            </p>
          )}
        </div>
        <p className="tool-hint">
          {hasResult
            ? "Thumbnail preview · download saves an MP4 to your device"
            : "TikTok video downloader · public videos · free, no account"}
        </p>
      </div>
    </div>
  );
}
