"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PngToGifDropzone from "@/components/tools/PngToGifDropzone";
import { formatFileSize } from "@/lib/image";
import {
  convertPngToGif,
  describePngGifOutput,
  downloadConvertedGif,
  downloadPngGifResult,
  PNG_TO_GIF_DELAY_PRESETS,
  PNG_TO_GIF_QUALITY_PRESETS,
  PNG_TO_GIF_SIZE_PRESETS,
  MAX_PNG_FILES,
  revokePngToGifResult,
  type PngToGifDelay,
  type PngToGifMode,
  type PngToGifQuality,
  type PngToGifResult,
  type PngToGifSize,
} from "@/lib/png-to-gif";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type ImageEntry = {
  id: string;
  file: File;
};

function createEntries(files: File[]): ImageEntry[] {
  return files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
    file,
  }));
}

export default function PngToGif() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const listId = useId();
  const modeId = useId();
  const sizeId = useId();
  const qualityId = useId();
  const delayId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<PngToGifResult | null>(null);

  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [mode, setMode] = useState<PngToGifMode>("animated");
  const [size, setSize] = useState<PngToGifSize>("medium");
  const [quality, setQuality] = useState<PngToGifQuality>("medium");
  const [delay, setDelay] = useState<PngToGifDelay>(200);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PngToGifResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);

  const files = entries.map((entry) => entry.file);
  const fileCount = entries.length;
  const hasSource = fileCount > 0;
  const hasResult = Boolean(result);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const showAnimatedOptions = fileCount > 1 && mode === "animated";
  const activeImage =
    result?.images.find((image) => image.id === selectedId) ??
    result?.images[0] ??
    null;

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokePngToGifResult(resultRef.current);
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      revokePngToGifResult(current);
      return null;
    });
    setSelectedId(null);
  }

  function handleAddFiles(incoming: File[]) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    setEntries((current) => [...current, ...createEntries(incoming)]);
  }

  function handleRemove(id: string) {
    clearResult();
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function handleMove(id: string, direction: -1 | 1) {
    clearResult();
    setEntries((current) => {
      const index = current.findIndex((entry) => entry.id === id);
      if (index < 0) return current;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  }

  function handleReset() {
    abortRef.current?.abort();
    clearResult();
    setEntries([]);
    setError("");
    setProgressText("");
    setLoading(false);
    setZipping(false);
  }

  async function handleConvert() {
    if (fileCount === 0) {
      setError("Upload at least one PNG to get started.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Reading PNG…");
    clearResult();

    try {
      const converted = await convertPngToGif(files, {
        mode,
        size,
        quality,
        delay,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) {
        revokePngToGifResult(converted);
        return;
      }

      setResult(converted);
      setSelectedId(converted.images[0]?.id ?? null);
      await downloadPngGifResult(converted, files);
      setProgressText("");
      trackSuccess();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      trackFailure();
      const message =
        err instanceof Error
          ? err.message
          : "Could not convert these PNG files. Try fewer or smaller images.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  async function handleDownloadAgain() {
    if (!result || fileCount === 0) return;
    setZipping(true);
    setError("");
    try {
      await downloadPngGifResult(result, files);
    } catch {
      setError("Could not create the download. Try downloading images one by one.");
    } finally {
      setZipping(false);
    }
  }

  function handleDownloadSelected() {
    if (!activeImage) return;
    downloadConvertedGif(activeImage);
  }

  return (
    <div className="tool-grid heic-to-jpg">
      <div className="tool-panel">
        <PngToGifDropzone
          existingFiles={files}
          onFiles={handleAddFiles}
          onError={setError}
          disabled={loading || fileCount >= MAX_PNG_FILES}
        />

        {fileCount > 0 ? (
          <div className="png-to-pdf__list-wrap">
            <div className="png-to-pdf__list-header">
              <p className="png-to-pdf__list-title" id={listId}>
                {showAnimatedOptions
                  ? `Frame order (${fileCount})`
                  : `Queued files (${fileCount})`}
              </p>
              <p className="png-to-pdf__list-meta">
                {formatFileSize(totalBytes)} total
              </p>
            </div>
            <ol className="png-to-pdf__list" aria-labelledby={listId}>
              {entries.map((entry, index) => (
                <li key={entry.id} className="png-to-pdf__item">
                  {showAnimatedOptions ? (
                    <span className="png-to-pdf__index" aria-hidden="true">
                      {index + 1}
                    </span>
                  ) : null}
                  <div className="png-to-pdf__file">
                    <p className="png-to-pdf__name">{entry.file.name}</p>
                    <p className="png-to-pdf__size">
                      {formatFileSize(entry.file.size)}
                    </p>
                  </div>
                  <div className="png-to-pdf__item-actions">
                    {showAnimatedOptions ? (
                      <>
                        <button
                          type="button"
                          className="png-to-pdf__icon-btn"
                          aria-label={`Move ${entry.file.name} up`}
                          disabled={loading || index === 0}
                          onClick={() => handleMove(entry.id, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="png-to-pdf__icon-btn"
                          aria-label={`Move ${entry.file.name} down`}
                          disabled={loading || index === fileCount - 1}
                          onClick={() => handleMove(entry.id, 1)}
                        >
                          ↓
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      className={cn(
                        "png-to-pdf__icon-btn",
                        "png-to-pdf__icon-btn--danger",
                      )}
                      aria-label={`Remove ${entry.file.name}`}
                      disabled={loading}
                      onClick={() => handleRemove(entry.id)}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="heic-to-jpg__options">
          {fileCount > 1 ? (
            <div className="ui-field">
              <span className="ui-label" id={modeId}>
                Output
              </span>
              <div
                className="heic-to-jpg__chips"
                role="radiogroup"
                aria-labelledby={modeId}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === "animated"}
                  className={cn(
                    "heic-to-jpg__chip",
                    mode === "animated" && "is-active",
                  )}
                  disabled={loading}
                  onClick={() => {
                    setMode("animated");
                    clearResult();
                  }}
                >
                  <span className="heic-to-jpg__chip-label">Animated GIF</span>
                  <span className="heic-to-jpg__chip-hint">One file</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === "separate"}
                  className={cn(
                    "heic-to-jpg__chip",
                    mode === "separate" && "is-active",
                  )}
                  disabled={loading}
                  onClick={() => {
                    setMode("separate");
                    clearResult();
                  }}
                >
                  <span className="heic-to-jpg__chip-label">Separate GIFs</span>
                  <span className="heic-to-jpg__chip-hint">ZIP download</span>
                </button>
              </div>
            </div>
          ) : null}

          <div className="ui-field">
            <span className="ui-label" id={sizeId}>
              Output size
            </span>
            <div
              className="heic-to-jpg__chips"
              role="radiogroup"
              aria-labelledby={sizeId}
            >
              {PNG_TO_GIF_SIZE_PRESETS.map((preset) => {
                const selected = size === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "heic-to-jpg__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => {
                      setSize(preset.id);
                      clearResult();
                    }}
                  >
                    <span className="heic-to-jpg__chip-label">
                      {preset.label}
                    </span>
                    <span className="heic-to-jpg__chip-hint">
                      {preset.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={qualityId}>
              Color quality
            </span>
            <div
              className="heic-to-jpg__chips"
              role="radiogroup"
              aria-labelledby={qualityId}
            >
              {PNG_TO_GIF_QUALITY_PRESETS.map((preset) => {
                const selected = quality === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "heic-to-jpg__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => {
                      setQuality(preset.id);
                      clearResult();
                    }}
                  >
                    <span className="heic-to-jpg__chip-label">
                      {preset.label}
                    </span>
                    <span className="heic-to-jpg__chip-hint">
                      {preset.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {showAnimatedOptions ? (
            <div className="ui-field">
              <span className="ui-label" id={delayId}>
                Frame delay
              </span>
              <div
                className="heic-to-jpg__chips"
                role="radiogroup"
                aria-labelledby={delayId}
              >
                {PNG_TO_GIF_DELAY_PRESETS.map((preset) => {
                  const selected = delay === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={cn(
                        "heic-to-jpg__chip",
                        selected && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => {
                        setDelay(preset.id);
                        clearResult();
                      }}
                    >
                      <span className="heic-to-jpg__chip-label">
                        {preset.label}
                      </span>
                      <span className="heic-to-jpg__chip-hint">
                        {preset.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleConvert()}
            disabled={!hasSource || loading}
          >
            {loading ? "Converting…" : "Convert to GIF"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!hasSource && !hasResult) || loading}
          >
            Start over
          </Button>
        </div>

        {hasResult ? (
          <div className="tool-actions">
            <Button
              onClick={() => void handleDownloadAgain()}
              disabled={zipping}
            >
              {zipping
                ? "Preparing…"
                : result && result.images.length > 1
                  ? "Download ZIP again"
                  : "Download again"}
            </Button>
            {result && result.images.length > 1 && activeImage ? (
              <Button variant="ghost" onClick={handleDownloadSelected}>
                Download selected
              </Button>
            ) : null}
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
          className={`tool-stage${hasResult ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Converting PNG…"}
              </span>
              <span className="tool-loading__subtext">
                Conversion runs locally in your browser.
              </span>
            </div>
          ) : result && activeImage ? (
            <div className="png-to-pdf__success">
              <p className="png-to-pdf__success-title">GIF ready</p>
              <p className="png-to-pdf__success-meta">
                {describePngGifOutput(result)}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage.url}
                alt={`Converted ${activeImage.sourceName}`}
                className="pdf-to-jpg__preview-image"
              />
              {result.images.length > 1 ? (
                <div
                  className="pdf-to-jpg__thumbs"
                  role="radiogroup"
                  aria-label="Converted images"
                >
                  {result.images.map((image, index) => {
                    const selected = image.id === activeImage.id;
                    return (
                      <button
                        key={image.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "pdf-to-jpg__thumb",
                          selected && "is-active",
                        )}
                        aria-label={`Show ${image.sourceName}`}
                        onClick={() => setSelectedId(image.id)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt=""
                          className="pdf-to-jpg__thumb-image"
                        />
                        <span className="pdf-to-jpg__thumb-label">
                          {index + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
              <ul className="png-to-pdf__stats" aria-label="Conversion summary">
                <li>
                  <span className="png-to-pdf__stat-label">
                    {result.animated ? "Frames" : "PNG files"}
                  </span>
                  <span className="png-to-pdf__stat-value">
                    {result.animated ? result.frameCount : result.images.length}
                  </span>
                </li>
                <li>
                  <span className="png-to-pdf__stat-label">Original</span>
                  <span className="png-to-pdf__stat-value">
                    {formatFileSize(result.originalSize)}
                  </span>
                </li>
                <li>
                  <span className="png-to-pdf__stat-label">GIF size</span>
                  <span className="png-to-pdf__stat-value">
                    {formatFileSize(result.outputSize)}
                  </span>
                </li>
              </ul>
              <p className="tool-placeholder preview-single__hint">
                {result.images.length > 1
                  ? "Your ZIP download should start automatically. Select a thumbnail to preview or download one image."
                  : "Your download should start automatically. Convert again anytime."}
              </p>
            </div>
          ) : (
            <div className="png-to-pdf__empty">
              <p className="tool-placeholder">
                {fileCount === 0
                  ? "Upload a PNG image to convert it to GIF"
                  : fileCount === 1
                    ? "1 PNG file queued · click Convert to GIF"
                    : mode === "animated"
                      ? `${fileCount} PNG files queued · click Convert to GIF for one animation`
                      : `${fileCount} PNG files queued · click Convert to GIF`}
              </p>
              {fileCount > 0 ? (
                <ul className="png-to-pdf__summary" aria-label="Queued PNG files">
                  {entries.map((entry, index) => (
                    <li key={entry.id}>
                      {index + 1}. {entry.file.name}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "PNG to GIF runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
