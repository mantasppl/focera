"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PngToPdfDropzone from "@/components/tools/PngToPdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  convertPngToPdf,
  describePngPdfOutput,
  downloadPngPdf,
  MAX_PNG_FILES,
  pageSizeLabel,
  revokePngToPdfResult,
  type PngPdfMargin,
  type PngPdfPageSize,
  type PngToPdfResult,
} from "@/lib/png-to-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type ImageEntry = {
  id: string;
  file: File;
};

const PAGE_OPTIONS: {
  value: PngPdfPageSize;
  label: string;
  hint: string;
}[] = [
  {
    value: "fit",
    label: "Fit",
    hint: "Page matches image",
  },
  {
    value: "a4",
    label: "A4",
    hint: "Standard international",
  },
  {
    value: "letter",
    label: "Letter",
    hint: "US letter size",
  },
];

const MARGIN_OPTIONS: {
  value: PngPdfMargin;
  label: string;
  hint: string;
}[] = [
  { value: "none", label: "None", hint: "Edge to edge" },
  { value: "small", label: "Small", hint: "Light padding" },
  { value: "medium", label: "Medium", hint: "Print-friendly" },
];

function createEntries(files: File[]): ImageEntry[] {
  return files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
    file,
  }));
}

export default function PngToPdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const listId = useId();
  const pageSizeId = useId();
  const marginId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<PngToPdfResult | null>(null);

  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [pageSize, setPageSize] = useState<PngPdfPageSize>("fit");
  const [margin, setMargin] = useState<PngPdfMargin>("small");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PngToPdfResult | null>(null);

  const files = entries.map((entry) => entry.file);
  const fileCount = entries.length;
  const hasSource = fileCount > 0;
  const hasResult = Boolean(result);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const showMargin = pageSize !== "fit";

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokePngToPdfResult(resultRef.current);
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      revokePngToPdfResult(current);
      return null;
    });
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
  }

  async function handleConvert() {
    if (fileCount === 0) {
      setError("Upload at least one PNG (or JPG / WebP) to get started.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Preparing images…");
    clearResult();

    try {
      const converted = await convertPngToPdf(files, {
        pageSize,
        margin,
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Adding image ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) {
        revokePngToPdfResult(converted);
        return;
      }

      setResult(converted);
      downloadPngPdf(converted.blob, files);
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
          : "Could not convert these images. Try fewer or smaller files.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleDownloadAgain() {
    if (!result || fileCount === 0) return;
    downloadPngPdf(result.blob, files);
  }

  return (
    <div className="tool-grid png-to-pdf">
      <div className="tool-panel">
        <PngToPdfDropzone
          existingFiles={files}
          onFiles={handleAddFiles}
          onError={setError}
          disabled={loading || fileCount >= MAX_PNG_FILES}
        />

        {fileCount > 0 ? (
          <div className="png-to-pdf__list-wrap">
            <div className="png-to-pdf__list-header">
              <p className="png-to-pdf__list-title" id={listId}>
                Page order ({fileCount})
              </p>
              <p className="png-to-pdf__list-meta">
                {formatFileSize(totalBytes)} total
              </p>
            </div>
            <ol className="png-to-pdf__list" aria-labelledby={listId}>
              {entries.map((entry, index) => (
                <li key={entry.id} className="png-to-pdf__item">
                  <span className="png-to-pdf__index" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="png-to-pdf__file">
                    <p className="png-to-pdf__name">{entry.file.name}</p>
                    <p className="png-to-pdf__size">
                      {formatFileSize(entry.file.size)}
                    </p>
                  </div>
                  <div className="png-to-pdf__item-actions">
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

        <div className="png-to-pdf__options">
          <div className="ui-field">
            <span className="ui-label" id={pageSizeId}>
              Page size
            </span>
            <div
              className="png-to-pdf__chips"
              role="radiogroup"
              aria-labelledby={pageSizeId}
            >
              {PAGE_OPTIONS.map((option) => {
                const selected = pageSize === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "png-to-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => {
                      setPageSize(option.value);
                      clearResult();
                    }}
                  >
                    <span className="png-to-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="png-to-pdf__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {showMargin ? (
            <div className="ui-field">
              <span className="ui-label" id={marginId}>
                Margin
              </span>
              <div
                className="png-to-pdf__chips"
                role="radiogroup"
                aria-labelledby={marginId}
              >
                {MARGIN_OPTIONS.map((option) => {
                  const selected = margin === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={cn(
                        "png-to-pdf__chip",
                        selected && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => {
                        setMargin(option.value);
                        clearResult();
                      }}
                    >
                      <span className="png-to-pdf__chip-label">
                        {option.label}
                      </span>
                      <span className="png-to-pdf__chip-hint">
                        {option.hint}
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
            {loading ? "Converting…" : "Convert to PDF"}
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
            <Button onClick={handleDownloadAgain}>Download again</Button>
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
                {progressText || "Building PDF…"}
              </span>
              <span className="tool-loading__subtext">
                Conversion runs locally in your browser.
              </span>
            </div>
          ) : result ? (
            <div className="png-to-pdf__success">
              <p className="png-to-pdf__success-title">PDF ready</p>
              <p className="png-to-pdf__success-meta">
                {describePngPdfOutput(result)} · {pageSizeLabel(result.pageSize)}
              </p>
              {result.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.previewUrl}
                  alt="First page preview"
                  className="png-to-pdf__preview-image"
                />
              ) : null}
              <ul className="png-to-pdf__stats" aria-label="Conversion summary">
                <li>
                  <span className="png-to-pdf__stat-label">Images</span>
                  <span className="png-to-pdf__stat-value">
                    {result.imageCount}
                  </span>
                </li>
                <li>
                  <span className="png-to-pdf__stat-label">Pages</span>
                  <span className="png-to-pdf__stat-value">
                    {result.pageCount}
                  </span>
                </li>
                <li>
                  <span className="png-to-pdf__stat-label">PDF size</span>
                  <span className="png-to-pdf__stat-value">
                    {formatFileSize(result.outputSize)}
                  </span>
                </li>
              </ul>
              <p className="tool-placeholder preview-single__hint">
                Your download should start automatically. Reorder images or
                change page size and convert again anytime.
              </p>
            </div>
          ) : (
            <div className="png-to-pdf__empty">
              <p className="tool-placeholder">
                {fileCount === 0
                  ? "Upload PNG images to turn them into a PDF"
                  : `${fileCount} image${fileCount === 1 ? "" : "s"} queued · click Convert to PDF`}
              </p>
              {fileCount > 0 ? (
                <ul className="png-to-pdf__summary" aria-label="Queued images">
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
            : "PNG to PDF runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
