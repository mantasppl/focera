"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PngToEpsDropzone from "@/components/tools/PngToEpsDropzone";
import { formatFileSize } from "@/lib/image";
import {
  convertPngToEps,
  colorLabel,
  describePngEpsOutput,
  dpiLabel,
  downloadConvertedEps,
  downloadPngEpsResult,
  MAX_PNG_FILES,
  revokePngToEpsResult,
  type PngEpsColor,
  type PngEpsDpi,
  type PngToEpsResult,
} from "@/lib/png-to-eps";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type ImageEntry = {
  id: string;
  file: File;
};

const COLOR_OPTIONS: {
  value: PngEpsColor;
  label: string;
  hint: string;
}[] = [
  { value: "rgb", label: "Color", hint: "RGB" },
  { value: "gray", label: "Grayscale", hint: "Print gray" },
];

const DPI_OPTIONS: {
  value: PngEpsDpi;
  label: string;
  hint: string;
}[] = [
  { value: 72, label: "Screen", hint: "72 DPI" },
  { value: 150, label: "Draft", hint: "150 DPI" },
  { value: 300, label: "Print", hint: "300 DPI" },
];

function createEntries(files: File[]): ImageEntry[] {
  return files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
    file,
  }));
}

export default function PngToEps() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const listId = useId();
  const colorId = useId();
  const dpiId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<PngToEpsResult | null>(null);

  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [color, setColor] = useState<PngEpsColor>("rgb");
  const [dpi, setDpi] = useState<PngEpsDpi>(72);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PngToEpsResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);

  const files = entries.map((entry) => entry.file);
  const fileCount = entries.length;
  const hasSource = fileCount > 0;
  const hasResult = Boolean(result);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
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
      revokePngToEpsResult(resultRef.current);
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      revokePngToEpsResult(current);
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
      const converted = await convertPngToEps(files, {
        color,
        dpi,
        signal: controller.signal,
        onProgress: (current, total, fileName) => {
          setProgressText(`Converting ${current} of ${total}: ${fileName}`);
        },
      });

      if (controller.signal.aborted) {
        revokePngToEpsResult(converted);
        return;
      }

      setResult(converted);
      setSelectedId(converted.images[0]?.id ?? null);
      await downloadPngEpsResult(converted, files);
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
      await downloadPngEpsResult(result, files);
    } catch {
      setError("Could not create the download. Try downloading files one by one.");
    } finally {
      setZipping(false);
    }
  }

  function handleDownloadSelected() {
    if (!activeImage) return;
    downloadConvertedEps(activeImage);
  }

  return (
    <div className="tool-grid heic-to-jpg">
      <div className="tool-panel">
        <PngToEpsDropzone
          existingFiles={files}
          onFiles={handleAddFiles}
          onError={setError}
          disabled={loading || fileCount >= MAX_PNG_FILES}
        />

        {fileCount > 0 ? (
          <div className="png-to-pdf__list-wrap">
            <div className="png-to-pdf__list-header">
              <p className="png-to-pdf__list-title" id={listId}>
                Queued files ({fileCount})
              </p>
              <p className="png-to-pdf__list-meta">
                {formatFileSize(totalBytes)} total
              </p>
            </div>
            <ol className="png-to-pdf__list" aria-labelledby={listId}>
              {entries.map((entry) => (
                <li key={entry.id} className="png-to-pdf__item">
                  <div className="png-to-pdf__file">
                    <p className="png-to-pdf__name">{entry.file.name}</p>
                    <p className="png-to-pdf__size">
                      {formatFileSize(entry.file.size)}
                    </p>
                  </div>
                  <div className="png-to-pdf__item-actions">
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
          <div className="ui-field">
            <span className="ui-label" id={colorId}>
              Color
            </span>
            <div
              className="heic-to-jpg__chips"
              role="radiogroup"
              aria-labelledby={colorId}
            >
              {COLOR_OPTIONS.map((option) => {
                const selected = color === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "heic-to-jpg__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => {
                      setColor(option.value);
                      clearResult();
                    }}
                  >
                    <span className="heic-to-jpg__chip-label">
                      {option.label}
                    </span>
                    <span className="heic-to-jpg__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="ui-field">
            <span className="ui-label" id={dpiId}>
              Placement size
            </span>
            <div
              className="heic-to-jpg__chips"
              role="radiogroup"
              aria-labelledby={dpiId}
            >
              {DPI_OPTIONS.map((option) => {
                const selected = dpi === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "heic-to-jpg__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => {
                      setDpi(option.value);
                      clearResult();
                    }}
                  >
                    <span className="heic-to-jpg__chip-label">
                      {option.label}
                    </span>
                    <span className="heic-to-jpg__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleConvert()}
            disabled={!hasSource || loading}
          >
            {loading ? "Converting…" : "Convert to EPS"}
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
              <p className="png-to-pdf__success-title">EPS ready</p>
              <p className="png-to-pdf__success-meta">
                {describePngEpsOutput(result)} · {colorLabel(result.color)} ·{" "}
                {dpiLabel(result.dpi)}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage.url}
                alt={`Preview of ${activeImage.sourceName}`}
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
                  <span className="png-to-pdf__stat-label">PNG files</span>
                  <span className="png-to-pdf__stat-value">
                    {result.images.length}
                  </span>
                </li>
                <li>
                  <span className="png-to-pdf__stat-label">Original</span>
                  <span className="png-to-pdf__stat-value">
                    {formatFileSize(result.originalSize)}
                  </span>
                </li>
                <li>
                  <span className="png-to-pdf__stat-label">EPS size</span>
                  <span className="png-to-pdf__stat-value">
                    {formatFileSize(result.outputSize)}
                  </span>
                </li>
              </ul>
              <p className="tool-placeholder preview-single__hint">
                {result.images.length > 1
                  ? "Your ZIP download should start automatically. Select a thumbnail to preview or download one EPS."
                  : "Your download should start automatically. Change color or DPI and convert again anytime."}
              </p>
            </div>
          ) : (
            <div className="png-to-pdf__empty">
              <p className="tool-placeholder">
                {fileCount === 0
                  ? "Upload a PNG image to convert it to EPS"
                  : `${fileCount} PNG file${fileCount === 1 ? "" : "s"} queued · click Convert to EPS`}
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
            : "PNG to EPS runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
