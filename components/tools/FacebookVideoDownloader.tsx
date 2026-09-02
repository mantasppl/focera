"use client";

import { useId, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {
  describeFacebookResult,
  downloadFilename,
  validateFacebookUrl,
  type FacebookVideoResult,
} from "@/lib/facebook-video";
import { useToolAnalytics } from "@/lib/analytics/client";
import { downloadBlob } from "@/lib/image";
import { cn } from "@/lib/utils";

const EXAMPLE_URLS = [
  {
    label: "sample video",
    url: "https://www.facebook.com/watch/?v=10153231379946729",
  },
];

export default function FacebookVideoDownloader() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const urlId = useId();

  const [url, setUrl] = useState("");
  const [result, setResult] = useState<FacebookVideoResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const hasResult = result !== null;
  const canFetch = url.trim().length > 0 && !loading && !downloading;

  async function fetchVideo() {
    const urlError = validateFacebookUrl(url);
    if (urlError) {
      setError(urlError);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/facebook-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = (await response.json().catch(() => null)) as
        | FacebookVideoResult
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          data && "error" in data && data.error
            ? data.error
            : "Could not fetch this Facebook video.",
        );
      }

      if (!data || !("videoId" in data) || !data.videoId) {
        throw new Error("Could not find a video in this Facebook link.");
      }

      setResult(data);
      trackSuccess();
    } catch (err) {
      trackFailure();
      setError(
        err instanceof Error
          ? err.message
          : "Could not fetch this Facebook video.",
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

      const response = await fetch(
        `/api/facebook-video/download?${params.toString()}`,
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          data?.error || "Could not download this Facebook video.",
        );
      }

      const blob = await response.blob();
      downloadBlob(blob, downloadFilename(result));
      trackSuccess();
    } catch (err) {
      trackFailure();
      setError(
        err instanceof Error
          ? err.message
          : "Could not download this Facebook video.",
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
    <div className="tool-grid facebook-video">
      <div className="tool-panel">
        <Input
          id={urlId}
          label="Facebook URL"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            if (error) setError("");
          }}
          placeholder="https://www.facebook.com/watch/?v=…"
          hint="Paste a public Facebook watch, reel, videos, or fb.watch link"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          disabled={loading || downloading}
        />

        <div className="facebook-video__examples" aria-label="Example videos">
          {EXAMPLE_URLS.map((example) => (
            <button
              key={example.url}
              type="button"
              className="facebook-video__example"
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
            "tool-stage facebook-video__stage",
            hasResult && "is-ready",
            (loading || downloading) && "is-loading",
          )}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                Fetching Facebook video…
              </span>
              <span className="tool-loading__subtext">
                Works with public videos — private posts are blocked.
              </span>
            </div>
          ) : hasResult && result ? (
            <div className="facebook-video__result">
              <div className="facebook-video__meta">
                <p className="facebook-video__title">
                  {result.title ||
                    (result.username
                      ? `${result.username} video`
                      : "Facebook video")}
                </p>
                <p className="facebook-video__result-meta">
                  {describeFacebookResult(result)}
                </p>
                <a
                  className="facebook-video__link"
                  href={result.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open on Facebook
                </a>
              </div>

              {result.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote Facebook CDN poster
                <img
                  className="facebook-video__poster"
                  src={result.thumbnailUrl}
                  alt={
                    result.title ||
                    (result.username
                      ? `Preview from ${result.username}`
                      : "Facebook video preview")
                  }
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="facebook-video__poster-fallback"
                  aria-hidden="true"
                >
                  Video ready
                </div>
              )}

              {result.caption ? (
                <p className="facebook-video__caption">{result.caption}</p>
              ) : null}
            </div>
          ) : (
            <p className="tool-placeholder">
              Paste a Facebook video link to preview and download
            </p>
          )}
        </div>
        <p className="tool-hint">
          {hasResult
            ? "Preview · download saves an MP4 to your device"
            : "Facebook video downloader · public videos · free, no account"}
        </p>
      </div>
    </div>
  );
}
