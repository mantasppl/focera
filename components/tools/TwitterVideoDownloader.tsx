"use client";

import { useId, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {
  describeTwitterResult,
  downloadFilename,
  validateTwitterUrl,
  type TwitterVideoResult,
} from "@/lib/twitter-video";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const EXAMPLE_URLS = [
  {
    label: "sample video",
    url: "https://x.com/XDevelopers/status/1460323737035677698",
  },
];

export default function TwitterVideoDownloader() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const urlId = useId();

  const [url, setUrl] = useState("");
  const [result, setResult] = useState<TwitterVideoResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const hasResult = result !== null && result.videos.length > 0;
  const selected = hasResult
    ? (result.videos[selectedIndex] ?? result.videos[0]!)
    : null;
  const canFetch = url.trim().length > 0 && !loading && !downloading;

  async function fetchVideo() {
    const urlError = validateTwitterUrl(url);
    if (urlError) {
      setError(urlError);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setSelectedIndex(0);

    try {
      const response = await fetch("/api/twitter-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = (await response.json().catch(() => null)) as
        | TwitterVideoResult
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          data && "error" in data && data.error
            ? data.error
            : "Could not fetch this Twitter/X video.",
        );
      }

      if (!data || !("videos" in data) || !data.videos?.length) {
        throw new Error("Could not find a video in this Twitter/X post.");
      }

      setResult(data);
      trackSuccess();
    } catch (err) {
      trackFailure();
      setError(
        err instanceof Error
          ? err.message
          : "Could not fetch this Twitter/X video.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!result || !selected) return;

    setDownloading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        statusId: result.statusId,
        videoId: selected.id,
      });
      if (result.username) params.set("username", result.username);

      const response = await fetch(
        `/api/twitter-video/download?${params.toString()}`,
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          data?.error || "Could not download this Twitter/X video.",
        );
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = downloadFilename(
        result,
        selectedIndex,
        result.videos.length,
      );
      link.click();
      URL.revokeObjectURL(objectUrl);
      trackSuccess();
    } catch (err) {
      trackFailure();
      setError(
        err instanceof Error
          ? err.message
          : "Could not download this Twitter/X video.",
      );
    } finally {
      setDownloading(false);
    }
  }

  function handleReset() {
    setUrl("");
    setResult(null);
    setSelectedIndex(0);
    setError("");
  }

  const posterUrl = selected?.thumbnailUrl ?? result?.thumbnailUrl ?? null;

  return (
    <div className="tool-grid twitter-video">
      <div className="tool-panel">
        <Input
          id={urlId}
          label="Twitter / X URL"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            if (error) setError("");
          }}
          placeholder="https://x.com/user/status/…"
          hint="Paste a public x.com or twitter.com post link with a video"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          disabled={loading || downloading}
        />

        <div className="twitter-video__examples" aria-label="Example videos">
          {EXAMPLE_URLS.map((example) => (
            <button
              key={example.url}
              type="button"
              className="twitter-video__example"
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

        {hasResult && result.videos.length > 1 ? (
          <div className="ui-field">
            <span className="ui-label">Choose video</span>
            <div
              className="twitter-video__chips"
              role="radiogroup"
              aria-label="Videos in this post"
            >
              {result.videos.map((video, index) => {
                const selectedChip = index === selectedIndex;
                return (
                  <button
                    key={video.id}
                    type="button"
                    role="radio"
                    aria-checked={selectedChip}
                    className={cn(
                      "twitter-video__chip",
                      selectedChip && "is-active",
                    )}
                    disabled={loading || downloading}
                    onClick={() => setSelectedIndex(index)}
                  >
                    {video.kind === "gif" ? "GIF" : "Video"} {index + 1}
                    {video.width && video.height
                      ? ` · ${video.width}×${video.height}`
                      : ""}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

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
            "tool-stage twitter-video__stage",
            hasResult && "is-ready",
            (loading || downloading) && "is-loading",
          )}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                Fetching Twitter/X video…
              </span>
              <span className="tool-loading__subtext">
                Works with public posts — private accounts are blocked.
              </span>
            </div>
          ) : hasResult && selected ? (
            <div className="twitter-video__result">
              <div className="twitter-video__meta">
                <p className="twitter-video__title">
                  {result.username ? `@${result.username}` : "Twitter/X video"}
                </p>
                <p className="twitter-video__result-meta">
                  {describeTwitterResult(result)}
                </p>
                <a
                  className="twitter-video__link"
                  href={result.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open on X
                </a>
              </div>

              {posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote Twitter CDN poster
                <img
                  className="twitter-video__poster"
                  src={posterUrl}
                  alt={
                    result.username
                      ? `Preview from @${result.username}`
                      : "Twitter/X video preview"
                  }
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="twitter-video__poster-fallback"
                  aria-hidden="true"
                >
                  Video ready
                </div>
              )}

              {result.caption ? (
                <p className="twitter-video__caption">{result.caption}</p>
              ) : null}
            </div>
          ) : (
            <p className="tool-placeholder">
              Paste a Twitter/X video link to preview and download
            </p>
          )}
        </div>
        <p className="tool-hint">
          {hasResult
            ? "Thumbnail preview · download saves an MP4 to your device"
            : "Twitter/X video downloader · public posts · free, no account"}
        </p>
      </div>
    </div>
  );
}
