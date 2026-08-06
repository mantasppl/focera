"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_OPACITY,
  MAX_FONT_SIZE,
  MAX_TEXT_LENGTH,
  MIN_FONT_SIZE,
  TEXT_COLORS,
  TEXT_FONTS,
  TEXT_PAGE_TARGETS,
  TEXT_POSITIONS,
  TEXT_ROTATIONS,
  addTextToPdf,
  describeTextResult,
  downloadTextPdf,
  type AddTextToPdfResult,
  type TextColorId,
  type TextFontId,
  type TextPageTarget,
  type TextPosition,
  type TextRotation,
} from "@/lib/add-text-to-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function AddTextToPdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const textId = useId();
  const positionId = useId();
  const fontId = useId();
  const colorId = useId();
  const pagesId = useId();
  const rotationId = useId();
  const fontSizeId = useId();
  const opacityId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [position, setPosition] = useState<TextPosition>("center");
  const [font, setFont] = useState<TextFontId>("helvetica");
  const [color, setColor] = useState<TextColorId>("black");
  const [pageTarget, setPageTarget] = useState<TextPageTarget>("all");
  const [rotation, setRotation] = useState<TextRotation>(0);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [opacityPercent, setOpacityPercent] = useState(
    Math.round(DEFAULT_OPACITY * 100),
  );
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AddTextToPdfResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);
  const canApply = hasSource && text.trim().length > 0;

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

    if (!text.trim()) {
      setError("Enter some text to add to the PDF.");
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
      const stamped = await addTextToPdf(sourceFile, {
        text,
        position,
        fontId: font,
        colorId: color,
        pageTarget,
        rotation,
        fontSize,
        opacity: opacityPercent / 100,
        signal: controller.signal,
        onProgress: (current, total) => {
          if (current === 0) {
            setProgressText("Preparing…");
            return;
          }
          setProgressText(`Adding text on page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(stamped.blob);
      resultUrlRef.current = url;
      setPreviewUrl(url);
      setResult(stamped);
      downloadTextPdf(stamped.blob, sourceFile);
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
          : "Could not add text. Try another file or browser.";
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
    downloadTextPdf(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid add-text-to-pdf">
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

        <div className="add-text-to-pdf__options">
          <div className="ui-field">
            <label className="ui-label" htmlFor={textId}>
              Text
            </label>
            <textarea
              id={textId}
              className="ui-input ui-input--textarea"
              rows={4}
              maxLength={MAX_TEXT_LENGTH}
              placeholder="Type the text to place on your PDF…"
              value={text}
              disabled={loading}
              onChange={(event) => setText(event.target.value)}
            />
            <p className="ui-hint">
              {text.length} / {MAX_TEXT_LENGTH} · line breaks are kept · wraps
              to the page width
            </p>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={positionId}>
              Position
            </span>
            <div
              className="add-text-to-pdf__chips add-text-to-pdf__chips--positions"
              role="radiogroup"
              aria-labelledby={positionId}
            >
              {TEXT_POSITIONS.map((option) => {
                const selected = position === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "add-text-to-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setPosition(option.value)}
                  >
                    <span className="add-text-to-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="add-text-to-pdf__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={fontId}>
              Font
            </span>
            <div
              className="add-text-to-pdf__chips add-text-to-pdf__chips--fonts"
              role="radiogroup"
              aria-labelledby={fontId}
            >
              {TEXT_FONTS.map((option) => {
                const selected = font === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "add-text-to-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setFont(option.value)}
                  >
                    <span className="add-text-to-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="add-text-to-pdf__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={colorId}>
              Color
            </span>
            <div
              className="add-text-to-pdf__chips add-text-to-pdf__chips--colors"
              role="radiogroup"
              aria-labelledby={colorId}
            >
              {TEXT_COLORS.map((option) => {
                const selected = color === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "add-text-to-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setColor(option.value)}
                  >
                    <span className="add-text-to-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="add-text-to-pdf__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={pagesId}>
              Pages
            </span>
            <div
              className="add-text-to-pdf__chips add-text-to-pdf__chips--pages"
              role="radiogroup"
              aria-labelledby={pagesId}
            >
              {TEXT_PAGE_TARGETS.map((option) => {
                const selected = pageTarget === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "add-text-to-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setPageTarget(option.value)}
                  >
                    <span className="add-text-to-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="add-text-to-pdf__chip-hint">
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
              className="add-text-to-pdf__chips add-text-to-pdf__chips--rotation"
              role="radiogroup"
              aria-labelledby={rotationId}
            >
              {TEXT_ROTATIONS.map((option) => {
                const selected = rotation === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "add-text-to-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setRotation(option.value)}
                  >
                    <span className="add-text-to-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="add-text-to-pdf__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
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
            {loading ? "Adding text…" : "Add text"}
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
                {progressText || "Adding text…"}
              </span>
              <span className="tool-loading__subtext">
                Your PDF stays on this device.
              </span>
            </div>
          ) : result ? (
            <div className="add-text-to-pdf__success">
              <p className="add-text-to-pdf__success-title">PDF with text ready</p>
              <p className="add-text-to-pdf__success-meta">
                {describeTextResult(
                  result.stampedPages,
                  result.pageCount,
                  result.outputSize,
                )}
              </p>
              {previewUrl ? (
                <iframe
                  title="PDF with text preview"
                  src={previewUrl}
                  className="add-text-to-pdf__preview"
                />
              ) : null}
              <p className="tool-placeholder preview-single__hint">
                Your download should start automatically. Change the text or
                options and apply again anytime.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF and enter text to preview the result here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "Text is drawn on top of pages · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
