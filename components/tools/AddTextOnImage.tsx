"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { formatFileSize } from "@/lib/image";
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_OPACITY,
  MAX_FONT_SIZE,
  MAX_TEXT_LENGTH,
  MIN_FONT_SIZE,
  TEXT_COLORS,
  TEXT_FONTS,
  TEXT_POSITIONS,
  TEXT_ROTATIONS,
  addTextOnImage,
  defaultFontSizeForImage,
  downloadTextImage,
  drawTextOnCanvas,
  loadImageElement,
  type AddTextOnImageResult,
  type TextColorId,
  type TextFontId,
  type TextPosition,
  type TextRotation,
} from "@/lib/add-text-on-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function AddTextOnImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const textId = useId();
  const positionId = useId();
  const fontId = useId();
  const colorId = useId();
  const rotationId = useId();
  const fontSizeId = useId();
  const opacityId = useId();
  const outlineId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [text, setText] = useState("");
  const [position, setPosition] = useState<TextPosition>("center");
  const [font, setFont] = useState<TextFontId>("sans");
  const [color, setColor] = useState<TextColorId>("white");
  const [rotation, setRotation] = useState<TextRotation>(0);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [opacityPercent, setOpacityPercent] = useState(
    Math.round(DEFAULT_OPACITY * 100),
  );
  const [outline, setOutline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AddTextOnImageResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");

  const hasSource = Boolean(sourceFile && originalUrl && originalWidth);
  const hasResult = Boolean(result && resultUrl);
  const canApply = hasSource && text.trim().length > 0;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  useEffect(() => {
    if (!hasSource || !imageRef.current || hasResult || loading) return;

    const canvas = previewCanvasRef.current;
    const image = imageRef.current;
    if (!canvas) return;

    const maxW = 720;
    const maxH = 520;
    const scale = Math.min(maxW / originalWidth, maxH / originalHeight, 1);
    const width = Math.max(1, Math.round(originalWidth * scale));
    const height = Math.max(1, Math.round(originalHeight * scale));

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    drawTextOnCanvas(ctx, image, originalWidth, originalHeight, width, height, {
      text,
      position,
      fontId: font,
      colorId: color,
      rotation,
      fontSize,
      opacity: opacityPercent / 100,
      outline,
    });
  }, [
    hasSource,
    hasResult,
    loading,
    originalWidth,
    originalHeight,
    text,
    position,
    font,
    color,
    rotation,
    fontSize,
    opacityPercent,
    outline,
  ]);

  function clearResult() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResult(null);
    setResultUrl("");
  }

  async function handleFile(file: File) {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setError("");
    setProgressText("");
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    imageRef.current = null;

    try {
      const image = await loadImageElement(file);
      imageRef.current = image;
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      if (!width || !height) {
        throw new Error("Could not determine image dimensions.");
      }
      setOriginalWidth(width);
      setOriginalHeight(height);
      setFontSize(defaultFontSizeForImage(width, height));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not read image dimensions.";
      setError(message);
      setOriginalWidth(0);
      setOriginalHeight(0);
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    imageRef.current = null;
    setSourceFile(null);
    setOriginalUrl("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setText("");
    setError("");
    setProgressText("");
    setLoading(false);
  }

  async function handleApply() {
    if (!sourceFile) {
      setError("Upload an image to get started.");
      return;
    }
    if (!text.trim()) {
      setError("Enter some text to add to the image.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Preparing…");
    clearResult();

    try {
      const stamped = await addTextOnImage(sourceFile, {
        text,
        position,
        fontId: font,
        colorId: color,
        rotation,
        fontSize,
        opacity: opacityPercent / 100,
        outline,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(stamped.blob);
      setResult(stamped);
      setResultUrl(url);
      downloadTextImage(stamped.blob, sourceFile);
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
    downloadTextImage(result.blob, sourceFile);
  }

  function handleEditAgain() {
    clearResult();
  }

  return (
    <div className="tool-grid add-text-on-image">
      <div className="tool-panel">
        <ImageDropzone
          onFile={(file) => void handleFile(file)}
          onError={setError}
          disabled={loading}
        />

        {hasSource ? (
          <div className="upload-meta">
            <p className="upload-meta__name">{sourceFile?.name}</p>
            <p className="upload-meta__size">
              {sourceFile ? formatFileSize(sourceFile.size) : ""}
              {originalWidth
                ? ` · ${originalWidth}×${originalHeight} px`
                : ""}
            </p>
          </div>
        ) : null}

        <div className="add-text-on-image__options">
          <div className="ui-field">
            <label className="ui-label" htmlFor={textId}>
              Text
            </label>
            <textarea
              id={textId}
              className="ui-input ui-input--textarea"
              rows={3}
              maxLength={MAX_TEXT_LENGTH}
              placeholder="Type the text to place on your image…"
              value={text}
              disabled={loading}
              onChange={(event) => {
                clearResult();
                setText(event.target.value);
              }}
            />
            <p className="ui-hint">
              {text.length} / {MAX_TEXT_LENGTH} · line breaks are kept · wraps
              to the image width
            </p>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={positionId}>
              Position
            </span>
            <div
              className="add-text-on-image__chips add-text-on-image__chips--positions"
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
                      "add-text-on-image__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => {
                      clearResult();
                      setPosition(option.value);
                    }}
                  >
                    <span className="add-text-on-image__chip-label">
                      {option.label}
                    </span>
                    <span className="add-text-on-image__chip-hint">
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
              className="add-text-on-image__chips add-text-on-image__chips--fonts"
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
                      "add-text-on-image__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => {
                      clearResult();
                      setFont(option.value);
                    }}
                  >
                    <span className="add-text-on-image__chip-label">
                      {option.label}
                    </span>
                    <span className="add-text-on-image__chip-hint">
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
              className="add-text-on-image__chips add-text-on-image__chips--colors"
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
                      "add-text-on-image__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => {
                      clearResult();
                      setColor(option.value);
                    }}
                  >
                    <span className="add-text-on-image__chip-label">
                      {option.label}
                    </span>
                    <span className="add-text-on-image__chip-hint">
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
              className="add-text-on-image__chips add-text-on-image__chips--rotation"
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
                      "add-text-on-image__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => {
                      clearResult();
                      setRotation(option.value);
                    }}
                  >
                    <span className="add-text-on-image__chip-label">
                      {option.label}
                    </span>
                    <span className="add-text-on-image__chip-hint">
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
              <span className="export-slider__value">{fontSize} px</span>
            </div>
            <input
              id={fontSizeId}
              className="export-slider__input"
              type="range"
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              step={1}
              value={fontSize}
              disabled={loading || !hasSource}
              onChange={(event) => {
                clearResult();
                setFontSize(Number(event.target.value));
              }}
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
              onChange={(event) => {
                clearResult();
                setOpacityPercent(Number(event.target.value));
              }}
            />
          </div>

          <label className="add-text-on-image__outline" htmlFor={outlineId}>
            <input
              id={outlineId}
              type="checkbox"
              checked={outline}
              disabled={loading}
              onChange={(event) => {
                clearResult();
                setOutline(event.target.checked);
              }}
            />
            <span>
              <span className="add-text-on-image__outline-title">
                Text outline
              </span>
              <span className="add-text-on-image__outline-hint">
                Soft dark stroke so light text stays readable on busy photos
              </span>
            </span>
          </label>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleApply()}
            disabled={!canApply || loading}
          >
            {loading ? "Adding text…" : "Add text & download"}
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
            <Button variant="ghost" onClick={handleEditAgain}>
              Edit text
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
          className={`tool-stage${hasResult || hasSource ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Adding text…"}
              </span>
              <span className="tool-loading__subtext">
                Your image stays on this device.
              </span>
            </div>
          ) : hasResult && resultUrl ? (
            <div className="add-text-on-image__result">
              <p className="add-text-on-image__result-meta">
                {result!.width}×{result!.height} px ·{" "}
                {formatFileSize(result!.blob.size)}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultUrl}
                alt="Image with text"
                className="preview-single__image"
              />
              <p className="tool-placeholder preview-single__hint">
                Your download should start automatically. Change options and
                apply again anytime.
              </p>
            </div>
          ) : hasSource ? (
            <div className="add-text-on-image__preview">
              <canvas
                ref={previewCanvasRef}
                className="add-text-on-image__canvas"
                aria-label="Live preview of text on image"
              />
              <p className="tool-placeholder preview-single__hint">
                {text.trim()
                  ? "Live preview — click Add text & download when ready."
                  : "Type text to see it appear on the image."}
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload an image and enter text to preview the result here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "Text is drawn on your photo in the browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
