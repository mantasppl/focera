"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_START,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  PAGE_NUMBER_FORMATS,
  PAGE_NUMBER_POSITIONS,
  addPageNumbersToPdf,
  describeNumberedResult,
  downloadNumberedPdf,
  type AddPageNumbersResult,
  type PageNumberFormat,
  type PageNumberPosition,
} from "@/lib/add-page-numbers-to-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function AddPageNumbersToPdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const positionId = useId();
  const formatId = useId();
  const startId = useId();
  const fontSizeId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [position, setPosition] =
    useState<PageNumberPosition>("bottom-center");
  const [format, setFormat] = useState<PageNumberFormat>("number");
  const [startNumber, setStartNumber] = useState(DEFAULT_START);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AddPageNumbersResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    };
  }, []);

  function clearResult() {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
    setPreviewUrl(null);
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    setSourceFile(file);
  }

  function handleReset() {
    abortRef.current?.abort();
    clearResult();
    setSourceFile(null);
    setError("");
    setProgressText("");
    setLoading(false);
  }

  async function handleApply() {
    if (!sourceFile) {
      setError("Upload a PDF to get started.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Reading PDF…");
    clearResult();

    try {
      const numbered = await addPageNumbersToPdf(sourceFile, {
        position,
        format,
        startNumber,
        fontSize,
        signal: controller.signal,
        onProgress: (current, total) => {
          if (current === 0) {
            setProgressText("Preparing…");
            return;
          }
          setProgressText(`Numbering page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(numbered.blob);
      resultUrlRef.current = url;
      setPreviewUrl(url);
      setResult(numbered);
      downloadNumberedPdf(numbered.blob, sourceFile);
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
          : "Could not add page numbers. Try another file or browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleDownloadAgain() {
    if (!sourceFile || !result) return;
    downloadNumberedPdf(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid add-page-numbers-to-pdf">
      <div className="tool-panel">
        <PdfDropzone
          onFile={handleFile}
          onError={setError}
          disabled={loading}
        />

        {hasSource ? (
          <div className="upload-meta">
            <p className="upload-meta__name">{sourceFile?.name}</p>
            <p className="upload-meta__size">
              {sourceFile ? formatFileSize(sourceFile.size) : ""}
            </p>
          </div>
        ) : null}

        <div className="add-page-numbers-to-pdf__options">
          <div className="ui-field">
            <span className="ui-label" id={positionId}>
              Position
            </span>
            <div
              className="add-page-numbers-to-pdf__chips add-page-numbers-to-pdf__chips--positions"
              role="radiogroup"
              aria-labelledby={positionId}
            >
              {PAGE_NUMBER_POSITIONS.map((option) => {
                const selected = position === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "add-page-numbers-to-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setPosition(option.value)}
                  >
                    <span className="add-page-numbers-to-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="add-page-numbers-to-pdf__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={formatId}>
              Format
            </span>
            <div
              className="add-page-numbers-to-pdf__chips add-page-numbers-to-pdf__chips--formats"
              role="radiogroup"
              aria-labelledby={formatId}
            >
              {PAGE_NUMBER_FORMATS.map((option) => {
                const selected = format === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "add-page-numbers-to-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setFormat(option.value)}
                  >
                    <span className="add-page-numbers-to-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="add-page-numbers-to-pdf__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor={startId}>
              Start number
            </label>
            <input
              id={startId}
              className="ui-input"
              type="number"
              min={1}
              max={9999}
              step={1}
              value={startNumber}
              disabled={loading}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!Number.isFinite(next)) return;
                setStartNumber(Math.max(1, Math.floor(next)));
              }}
            />
            <p className="ui-hint">
              First page uses this number; later pages count up from there.
            </p>
          </div>

          <div className="export-slider">
            <div className="export-slider__label">
              <label htmlFor={fontSizeId}>Font size</label>
              <span className="export-slider__value">{fontSize} pt</span>
            </div>
            <input
              id={fontSizeId}
              className="export-slider__input"
              type="range"
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              step={1}
              value={fontSize}
              disabled={loading}
              onChange={(event) => setFontSize(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleApply()}
            disabled={!hasSource || loading}
          >
            {loading ? "Numbering…" : "Add page numbers"}
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
                {progressText || "Adding page numbers…"}
              </span>
              <span className="tool-loading__subtext">
                Your PDF stays on this device.
              </span>
            </div>
          ) : result ? (
            <div className="add-page-numbers-to-pdf__success">
              <p className="add-page-numbers-to-pdf__success-title">
                Numbered PDF ready
              </p>
              <p className="add-page-numbers-to-pdf__success-meta">
                {describeNumberedResult(result.pageCount, result.outputSize)}
              </p>
              {previewUrl ? (
                <iframe
                  title="Numbered PDF preview"
                  src={previewUrl}
                  className="add-page-numbers-to-pdf__preview"
                />
              ) : null}
              <p className="tool-placeholder preview-single__hint">
                Your download should start automatically. Change position,
                format, or size and number again anytime.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF to preview numbered pages here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "Numbers draw on every page · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
