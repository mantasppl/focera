"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import ImageDropzone from "@/components/tools/ImageDropzone";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  DEFAULT_OPACITY,
  DEFAULT_SCALE,
  MAX_SCALE,
  MIN_SCALE,
  WATERMARK_POSITIONS,
  WATERMARK_ROTATIONS,
  addWatermarkToPdf,
  describeWatermarkResult,
  downloadWatermarkedPdf,
  type PdfWatermarkResult,
  type WatermarkPosition,
  type WatermarkRotation,
} from "@/lib/pdf-watermark";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function PdfWatermark() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const positionId = useId();
  const rotationId = useId();
  const scaleId = useId();
  const opacityId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const stampPreviewRef = useRef<string | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);
  const [stampPreview, setStampPreview] = useState<string | null>(null);
  const [position, setPosition] = useState<WatermarkPosition>("center");
  const [rotation, setRotation] = useState<WatermarkRotation>(0);
  const [scalePercent, setScalePercent] = useState(
    Math.round(DEFAULT_SCALE * 100),
  );
  const [opacityPercent, setOpacityPercent] = useState(
    Math.round(DEFAULT_OPACITY * 100),
  );
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PdfWatermarkResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const canApply = Boolean(pdfFile && stampFile);
  const hasResult = Boolean(result);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      if (stampPreviewRef.current) URL.revokeObjectURL(stampPreviewRef.current);
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

  function handlePdfFile(file: File) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    setPdfFile(file);
  }

  function handleStampFile(file: File) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    setStampFile(file);

    if (stampPreviewRef.current) {
      URL.revokeObjectURL(stampPreviewRef.current);
    }
    const url = URL.createObjectURL(file);
    stampPreviewRef.current = url;
    setStampPreview(url);
  }

  function handleReset() {
    abortRef.current?.abort();
    clearResult();
    setPdfFile(null);
    setStampFile(null);
    if (stampPreviewRef.current) {
      URL.revokeObjectURL(stampPreviewRef.current);
      stampPreviewRef.current = null;
    }
    setStampPreview(null);
    setError("");
    setProgressText("");
    setLoading(false);
  }

  async function handleApply() {
    if (!pdfFile || !stampFile) {
      setError("Upload a PDF and a stamp image to get started.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Reading files…");
    clearResult();

    try {
      const stamped = await addWatermarkToPdf(pdfFile, stampFile, {
        position,
        scale: scalePercent / 100,
        opacity: opacityPercent / 100,
        rotation,
        signal: controller.signal,
        onProgress: (current, total) => {
          if (current === 0) {
            setProgressText("Preparing stamp…");
            return;
          }
          setProgressText(`Stamping page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(stamped.blob);
      resultUrlRef.current = url;
      setPreviewUrl(url);
      setResult(stamped);
      downloadWatermarkedPdf(stamped.blob, pdfFile);
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
          : "Could not watermark this PDF. Try another file or browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleDownloadAgain() {
    if (!pdfFile || !result) return;
    downloadWatermarkedPdf(result.blob, pdfFile);
  }

  return (
    <div className="tool-grid pdf-watermark">
      <div className="tool-panel">
        <div className="ui-field">
          <span className="ui-label">PDF document</span>
          <PdfDropzone
            onFile={handlePdfFile}
            onError={setError}
            disabled={loading}
          />
        </div>

        {pdfFile ? (
          <div className="upload-meta">
            <p className="upload-meta__name">{pdfFile.name}</p>
            <p className="upload-meta__size">
              {formatFileSize(pdfFile.size)}
            </p>
          </div>
        ) : null}

        <div className="ui-field">
          <span className="ui-label">Stamp image</span>
          <ImageDropzone
            onFile={handleStampFile}
            onError={setError}
            disabled={loading}
          />
        </div>

        {stampFile ? (
          <div className="pdf-watermark__stamp-meta">
            {stampPreview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={stampPreview}
                alt="Stamp preview"
                className="pdf-watermark__stamp-thumb"
              />
            ) : null}
            <div className="upload-meta">
              <p className="upload-meta__name">{stampFile.name}</p>
              <p className="upload-meta__size">
                {formatFileSize(stampFile.size)}
              </p>
            </div>
          </div>
        ) : null}

        <div className="pdf-watermark__options">
          <div className="ui-field">
            <span className="ui-label" id={positionId}>
              Position
            </span>
            <div
              className="pdf-watermark__chips pdf-watermark__chips--positions"
              role="radiogroup"
              aria-labelledby={positionId}
            >
              {WATERMARK_POSITIONS.map((option) => {
                const selected = position === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "pdf-watermark__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setPosition(option.value)}
                  >
                    <span className="pdf-watermark__chip-label">
                      {option.label}
                    </span>
                    <span className="pdf-watermark__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={rotationId}>
              Rotation
            </span>
            <div
              className="pdf-watermark__chips pdf-watermark__chips--rotation"
              role="radiogroup"
              aria-labelledby={rotationId}
            >
              {WATERMARK_ROTATIONS.map((option) => {
                const selected = rotation === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "pdf-watermark__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setRotation(option.value)}
                  >
                    <span className="pdf-watermark__chip-label">
                      {option.label}
                    </span>
                    <span className="pdf-watermark__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="export-slider">
            <div className="export-slider__label">
              <label htmlFor={scaleId}>Size</label>
              <span className="export-slider__value">{scalePercent}%</span>
            </div>
            <input
              id={scaleId}
              className="export-slider__input"
              type="range"
              min={Math.round(MIN_SCALE * 100)}
              max={Math.round(MAX_SCALE * 100)}
              step={1}
              value={scalePercent}
              disabled={loading}
              onChange={(event) => setScalePercent(Number(event.target.value))}
            />
          </div>

          <div className="export-slider">
            <div className="export-slider__label">
              <label htmlFor={opacityId}>Opacity</label>
              <span className="export-slider__value">{opacityPercent}%</span>
            </div>
            <input
              id={opacityId}
              className="export-slider__input"
              type="range"
              min={5}
              max={100}
              step={1}
              value={opacityPercent}
              disabled={loading}
              onChange={(event) =>
                setOpacityPercent(Number(event.target.value))
              }
            />
          </div>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleApply()}
            disabled={!canApply || loading}
          >
            {loading ? "Stamping…" : "Add watermark"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!pdfFile && !stampFile && !hasResult) || loading}
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
                {progressText || "Adding watermark…"}
              </span>
              <span className="tool-loading__subtext">
                Your PDF and stamp stay on this device.
              </span>
            </div>
          ) : result ? (
            <div className="pdf-watermark__success">
              <p className="pdf-watermark__success-title">
                Watermarked PDF ready
              </p>
              <p className="pdf-watermark__success-meta">
                {describeWatermarkResult(result.pageCount, result.outputSize)}
              </p>
              {previewUrl ? (
                <iframe
                  title="Watermarked PDF preview"
                  src={previewUrl}
                  className="pdf-watermark__preview"
                />
              ) : null}
              <p className="tool-placeholder preview-single__hint">
                Your download should start automatically. Adjust position, size,
                or opacity and stamp again anytime.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF and an image stamp to preview the watermarked result
              here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "PNG stamps keep transparency · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
