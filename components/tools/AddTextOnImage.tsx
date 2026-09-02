"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Button from "@/components/Button";
import ImageDropzone from "@/components/tools/ImageDropzone";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import AddTextOnImageColorPicker from "@/components/tools/AddTextOnImageColorPicker";
import AddTextOnImageFontPicker from "@/components/tools/AddTextOnImageFontPicker";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize, validateImageFile } from "@/lib/image";
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_OPACITY,
  DEFAULT_TEXT_COLOR,
  MAX_TEXT_LENGTH,
  addTextOnImage,
  centeredPlacement,
  clampFontSize,
  defaultFontSizeForImage,
  drawTextOnCanvas,
  ensureFontReady,
  ensureTextFontsLoaded,
  loadImageElement,
  measureTextBlock,
  measureTextBlockSize,
  normalizeRotation,
  placementForCenter,
  textBlockCenter,
  type AddTextOnImageResult,
  type TextBlockBounds,
  type TextFontId,
  type TextPlacement,
} from "@/lib/add-text-on-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type TransformMode =
  | "move"
  | "resize-nw"
  | "resize-ne"
  | "resize-sw"
  | "resize-se"
  | "rotate";

const RESIZE_HANDLES = ["nw", "ne", "sw", "se"] as const;

function canvasPointer(
  event: ReactPointerEvent | PointerEvent,
  canvas: HTMLCanvasElement,
) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

export default function AddTextOnImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const textId = useId();
  const opacityId = useId();
  const outlineId = useId();
  const replaceInputId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewStageRef = useRef<HTMLDivElement | null>(null);
  const transformRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const userPlacedRef = useRef(false);
  const transformDragRef = useRef<{
    pointerId: number;
    mode: TransformMode;
    startPointerX: number;
    startPointerY: number;
    startPlacement: TextPlacement;
    startFontSize: number;
    startRotation: number;
    startCenterX: number;
    startCenterY: number;
    startDistance: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [text, setText] = useState("");
  const [placement, setPlacement] = useState<TextPlacement>({ x: 0.5, y: 0.5 });
  const [font, setFont] = useState<TextFontId>("system-sans");
  const [color, setColor] = useState(DEFAULT_TEXT_COLOR);
  const [rotation, setRotation] = useState(0);
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
  const [transforming, setTransforming] = useState(false);
  const [textBounds, setTextBounds] = useState<TextBlockBounds | null>(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const hasSource = Boolean(sourceFile && originalUrl && originalWidth);
  const hasResult = Boolean(result && resultUrl);
  const canApply = hasSource && text.trim().length > 0;

  const {
    formatOpen,
    setFormatOpen,
    downloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => result?.blob ?? null,
    getFilename: () =>
      sourceFile ? `${fileBaseName(sourceFile)}-with-text` : null,
  });

  const drawOptions = {
    text,
    placement,
    fontId: font,
    color,
    rotation,
    fontSize,
    opacity: opacityPercent / 100,
    outline,
  };

  useEffect(() => {
    if (!hasSource || !text.trim() || userPlacedRef.current) return;
    setPlacement(
      centeredPlacement(originalWidth, originalHeight, {
        text,
        fontId: font,
        color,
        rotation,
        fontSize,
        opacity: opacityPercent / 100,
        outline,
      }),
    );
  }, [
    hasSource,
    originalWidth,
    originalHeight,
    text,
    font,
    color,
    rotation,
    fontSize,
    opacityPercent,
    outline,
  ]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  useEffect(() => {
    void ensureTextFontsLoaded();
  }, []);

  useEffect(() => {
    const stage = previewStageRef.current;
    if (!stage || !hasSource) {
      setStageSize({ width: 0, height: 0 });
      return;
    }

    const update = () => {
      const rect = stage.getBoundingClientRect();
      setStageSize({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [hasSource, hasResult, originalUrl]);

  useEffect(() => {
    if (!hasSource || !imageRef.current || hasResult || loading) return;

    const canvas = previewCanvasRef.current;
    const image = imageRef.current;
    if (!canvas) return;

    let cancelled = false;

    void (async () => {
      await ensureFontReady(font, fontSize);
      if (cancelled) return;

      const availW = stageSize.width > 0 ? stageSize.width : 720;
      const availH = stageSize.height > 0 ? stageSize.height : 520;
      const scale = Math.min(availW / originalWidth, availH / originalHeight, 1);
      const width = Math.max(1, Math.round(originalWidth * scale));
      const height = Math.max(1, Math.round(originalHeight * scale));

      canvas.width = width;
      canvas.height = height;
      setPreviewSize({ width, height });

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx || cancelled) return;

      drawTextOnCanvas(
        ctx,
        image,
        originalWidth,
        originalHeight,
        width,
        height,
        drawOptions,
      );

      const bounds = measureTextBlock(
        originalWidth,
        originalHeight,
        width,
        height,
        drawOptions,
      );
      if (!cancelled) setTextBounds(bounds);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    hasSource,
    hasResult,
    loading,
    originalWidth,
    originalHeight,
    text,
    placement,
    font,
    color,
    rotation,
    fontSize,
    opacityPercent,
    outline,
    stageSize.width,
    stageSize.height,
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
    userPlacedRef.current = false;
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
      setRotation(0);
      setColor(DEFAULT_TEXT_COLOR);
      setFont("system-sans");
      setPlacement({ x: 0.5, y: 0.5 });
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
    userPlacedRef.current = false;
    setSourceFile(null);
    setOriginalUrl("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setText("");
    setPlacement({ x: 0.5, y: 0.5 });
    setRotation(0);
    setColor(DEFAULT_TEXT_COLOR);
    setFont("system-sans");
    setError("");
    setProgressText("");
    setLoading(false);
    setTextBounds(null);
    setFormatOpen(false);
  }

  function startTransform(
    event: ReactPointerEvent<HTMLElement>,
    mode: TransformMode,
  ) {
    if (!textBounds || loading || hasResult) return;
    event.preventDefault();
    event.stopPropagation();

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const pointer = canvasPointer(event, canvas);
    const center = textBlockCenter(textBounds);

    transformDragRef.current = {
      pointerId: event.pointerId,
      mode,
      startPointerX: pointer.x,
      startPointerY: pointer.y,
      startPlacement: { ...placement },
      startFontSize: fontSize,
      startRotation: rotation,
      startCenterX: center.x,
      startCenterY: center.y,
      startDistance:
        Math.max(
          24,
          Math.hypot(pointer.x - center.x, pointer.y - center.y),
        ) || 24,
      offsetX: pointer.x - textBounds.x,
      offsetY: pointer.y - textBounds.y,
    };

    transformRef.current?.setPointerCapture(event.pointerId);
    setTransforming(true);
    clearResult();
  }

  function handleTransformMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = transformDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const canvas = previewCanvasRef.current;
    if (!canvas || !originalWidth || !originalHeight || !textBounds) return;

    const pointer = canvasPointer(event, canvas);
    const canvasScale = canvas.width / originalWidth;

    if (drag.mode === "move") {
      const blockX = pointer.x - drag.offsetX;
      const blockY = pointer.y - drag.offsetY;
      const sourceX = blockX / canvasScale;
      const sourceY = blockY / canvasScale;

      userPlacedRef.current = true;
      setPlacement({
        x: sourceX / originalWidth,
        y: sourceY / originalHeight,
      });
      return;
    }

    if (drag.mode === "rotate") {
      const startAngle = Math.atan2(
        drag.startPointerY - drag.startCenterY,
        drag.startPointerX - drag.startCenterX,
      );
      const currentAngle = Math.atan2(
        pointer.y - drag.startCenterY,
        pointer.x - drag.startCenterX,
      );
      const deltaDeg = ((currentAngle - startAngle) * 180) / Math.PI;

      userPlacedRef.current = true;
      setRotation(normalizeRotation(drag.startRotation + deltaDeg));
      return;
    }

    const distance = Math.hypot(
      pointer.x - drag.startCenterX,
      pointer.y - drag.startCenterY,
    );
    const ratio = distance / drag.startDistance;
    const nextFontSize = clampFontSize(drag.startFontSize * ratio);
    const size = measureTextBlockSize(originalWidth, {
      text,
      fontId: font,
      color,
      rotation,
      fontSize: nextFontSize,
      opacity: opacityPercent / 100,
      outline,
    });
    if (!size) return;

    const centerSourceX = drag.startCenterX / canvasScale;
    const centerSourceY = drag.startCenterY / canvasScale;

    userPlacedRef.current = true;
    setFontSize(nextFontSize);
    setPlacement(
      placementForCenter(
        centerSourceX,
        centerSourceY,
        size.width,
        size.height,
        originalWidth,
        originalHeight,
      ),
    );
  }

  function handleTransformEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = transformDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    transformDragRef.current = null;
    setTransforming(false);
    if (transformRef.current?.hasPointerCapture(event.pointerId)) {
      transformRef.current.releasePointerCapture(event.pointerId);
    }
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
        placement,
        fontId: font,
        color,
        rotation: normalizeRotation(rotation),
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

  function handleEditAgain() {
    clearResult();
  }

  function handleReplaceFile(file: File | undefined) {
    if (!file || loading) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    void handleFile(file);
  }

  const transformStyle =
    textBounds && previewSize.width
      ? {
          left: `${(textBounds.x / previewSize.width) * 100}%`,
          top: `${(textBounds.y / previewSize.height) * 100}%`,
          width: `${(textBounds.width / previewSize.width) * 100}%`,
          height: `${(textBounds.height / previewSize.height) * 100}%`,
          transform: `rotate(${rotation}deg)`,
        }
      : undefined;

  return (
    <>
    <div
      className={cn(
        "tool-grid add-text-on-image",
        hasSource && "is-preview-first add-text-on-image--editing",
      )}
    >
      <aside className="add-text-on-image__sidebar tool-panel">
        {hasSource ? (
          <div className="add-text-on-image__file-bar">
            <div className="upload-meta">
              <p className="upload-meta__name">{sourceFile?.name}</p>
              <p className="upload-meta__size">
                {sourceFile ? formatFileSize(sourceFile.size) : ""}
                {originalWidth
                  ? ` · ${originalWidth}×${originalHeight} px`
                  : ""}
              </p>
            </div>
            <label
              className="add-text-on-image__replace-btn"
              htmlFor={replaceInputId}
            >
              Replace
              <input
                id={replaceInputId}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="add-text-on-image__replace-input"
                disabled={loading}
                onChange={(event) => {
                  handleReplaceFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        ) : (
          <ImageDropzone
            onFile={(file) => void handleFile(file)}
            onError={setError}
            disabled={loading}
          />
        )}

        <div className="add-text-on-image__options">
          <section className="add-text-on-image__section">
            <h2 className="add-text-on-image__section-title">Text</h2>
            <div className="ui-field">
              <label className="ui-label" htmlFor={textId}>
                Content
              </label>
              <textarea
                id={textId}
                className="ui-input ui-input--textarea add-text-on-image__text-input"
                rows={3}
                maxLength={MAX_TEXT_LENGTH}
                placeholder="Type your caption, title, or label…"
                value={text}
                disabled={loading}
                onChange={(event) => {
                  clearResult();
                  setText(event.target.value);
                }}
              />
              <p className="ui-hint">
                {text.length} / {MAX_TEXT_LENGTH}
              </p>
            </div>
          </section>

          <section className="add-text-on-image__section">
            <h2 className="add-text-on-image__section-title">Typography</h2>
            <div className="add-text-on-image__style-bar">
              <AddTextOnImageFontPicker
                value={font}
                disabled={loading}
                onChange={(nextFont) => {
                  clearResult();
                  setFont(nextFont);
                }}
              />
              <AddTextOnImageColorPicker
                value={color}
                disabled={loading}
                onChange={(nextColor) => {
                  clearResult();
                  setColor(nextColor);
                }}
              />
            </div>
          </section>

          <section className="add-text-on-image__section">
            <h2 className="add-text-on-image__section-title">Effects</h2>
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
                  Improves readability on busy backgrounds
                </span>
              </span>
            </label>
          </section>
        </div>

        <div className="add-text-on-image__sidebar-footer">
          <div className="tool-actions add-text-on-image__actions">
            <Button
              onClick={() => void handleApply()}
              disabled={!canApply || loading}
            >
              {loading ? "Applying…" : hasResult ? "Apply again" : "Apply"}
            </Button>
            {hasResult ? (
              <Button onClick={openDownload} disabled={loading}>
                Download
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={(!hasSource && !hasResult) || loading}
            >
              Start over
            </Button>
          </div>

          {hasResult ? (
            <div className="tool-actions add-text-on-image__actions">
              <Button variant="ghost" onClick={handleEditAgain}>
                Keep editing
              </Button>
            </div>
          ) : null}

          {error ? (
            <p className="tool-error" role="alert">
              {error}
            </p>
          ) : null}
          {downloadError ? (
            <p className="tool-error" role="alert">
              {downloadError}
            </p>
          ) : null}
        </div>
      </aside>

      <div className="add-text-on-image__canvas-panel tool-panel tool-panel--preview">
        <div className="add-text-on-image__canvas-header">
          <div>
            <p className="add-text-on-image__canvas-title">Canvas</p>
            {hasSource ? (
              <p className="add-text-on-image__canvas-meta">
                {originalWidth}×{originalHeight} px
                {text.trim()
                  ? ` · ${fontSize} px · ${Math.round(rotation)}°`
                  : ""}
              </p>
            ) : (
              <p className="add-text-on-image__canvas-meta">
                Upload an image to start editing
              </p>
            )}
          </div>
          {hasSource && text.trim() ? (
            <p className="add-text-on-image__canvas-hint">
              Drag to move · corners to resize · top handle to rotate
            </p>
          ) : null}
        </div>

        <div
          ref={previewStageRef}
          className={`add-text-on-image__stage tool-stage${hasResult || hasSource ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
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
                Click Download to choose JPG, PNG, or WebP.
              </p>
            </div>
          ) : hasSource ? (
            <div className="add-text-on-image__preview">
              <div className="add-text-on-image__preview-stage">
                <canvas
                  ref={previewCanvasRef}
                  className="add-text-on-image__canvas"
                  aria-label="Live preview of text on image"
                />
                {text.trim() && textBounds && transformStyle ? (
                  <div
                    ref={transformRef}
                    className={cn(
                      "add-text-on-image__transform",
                      transforming && "is-active",
                    )}
                    style={transformStyle}
                    onPointerMove={handleTransformMove}
                    onPointerUp={handleTransformEnd}
                    onPointerCancel={handleTransformEnd}
                  >
                    <div
                      className="add-text-on-image__transform-rotate-arm"
                      aria-hidden="true"
                    >
                      <span className="add-text-on-image__transform-rotate-line" />
                      <button
                        type="button"
                        className="add-text-on-image__transform-handle add-text-on-image__transform-handle--rotate"
                        aria-label="Rotate text"
                        onPointerDown={(event) =>
                          startTransform(event, "rotate")
                        }
                      />
                    </div>
                    <div
                      className="add-text-on-image__transform-body"
                      onPointerDown={(event) => startTransform(event, "move")}
                      role="button"
                      tabIndex={0}
                      aria-label="Drag to move text"
                    />
                    {RESIZE_HANDLES.map((corner) => (
                      <button
                        key={corner}
                        type="button"
                        className={cn(
                          "add-text-on-image__transform-handle",
                          `add-text-on-image__transform-handle--${corner}`,
                        )}
                        aria-label={`Resize text from ${corner}`}
                        onPointerDown={(event) =>
                          startTransform(event, `resize-${corner}`)
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="add-text-on-image__empty-canvas">
              <p className="tool-placeholder">
                Your image preview appears here
              </p>
              <p className="add-text-on-image__empty-hint">
                Upload a photo on the left, then type and style your text.
              </p>
            </div>
          )}
        </div>

        <p className="tool-hint add-text-on-image__privacy-hint">
          {hasResult
            ? "Processed locally on your device"
            : "Files never upload to Focera · everything runs in your browser"}
        </p>
      </div>
    </div>

    <ImageFormatDownloadDialog
      open={formatOpen}
      onOpenChange={setFormatOpen}
      onSelect={handleFormat}
      downloading={downloading}
      error={downloadError}
    />
    </>
  );
}
