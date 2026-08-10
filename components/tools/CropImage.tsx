"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { formatFileSize } from "@/lib/image";
import {
  ASPECT_RATIO_PRESETS,
  MIN_CROP_SIZE,
  applyAspectRatio,
  clampCropRect,
  cropImageFile,
  defaultCropRect,
  describeCrop,
  downloadCroppedImage,
  readImageDimensions,
  type CropImageResult,
  type CropRect,
} from "@/lib/crop-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type DragMode =
  | "move"
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

type DisplayMetrics = {
  offsetX: number;
  offsetY: number;
  displayWidth: number;
  displayHeight: number;
  scale: number;
};

function getDisplayMetrics(
  container: HTMLElement,
  imageWidth: number,
  imageHeight: number,
): DisplayMetrics | null {
  if (!imageWidth || !imageHeight) return null;
  const rect = container.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const scale = Math.min(rect.width / imageWidth, rect.height / imageHeight);
  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;
  const offsetX = (rect.width - displayWidth) / 2;
  const offsetY = (rect.height - displayHeight) / 2;
  return { offsetX, offsetY, displayWidth, displayHeight, scale };
}

function clientToImage(
  clientX: number,
  clientY: number,
  container: HTMLElement,
  metrics: DisplayMetrics,
): { x: number; y: number } {
  const rect = container.getBoundingClientRect();
  return {
    x: (clientX - rect.left - metrics.offsetX) / metrics.scale,
    y: (clientY - rect.top - metrics.offsetY) / metrics.scale,
  };
}

export default function CropImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const aspectId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cropRef = useRef<CropRect>({
    x: 0,
    y: 0,
    width: MIN_CROP_SIZE,
    height: MIN_CROP_SIZE,
  });
  const dragRef = useRef<{
    pointerId: number;
    mode: DragMode;
    startX: number;
    startY: number;
    origin: CropRect;
  } | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [aspectIdSelected, setAspectIdSelected] = useState("free");
  const [crop, setCrop] = useState<CropRect>({
    x: 0,
    y: 0,
    width: MIN_CROP_SIZE,
    height: MIN_CROP_SIZE,
  });
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CropImageResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const hasSource = Boolean(sourceFile && originalUrl && originalWidth);
  const hasResult = Boolean(result && resultUrl);
  const activeRatio =
    ASPECT_RATIO_PRESETS.find((preset) => preset.id === aspectIdSelected)
      ?.ratio ?? null;
  const cropValid =
    hasSource &&
    crop.width >= MIN_CROP_SIZE &&
    crop.height >= MIN_CROP_SIZE &&
    crop.width <= originalWidth &&
    crop.height <= originalHeight;

  useEffect(() => {
    cropRef.current = crop;
  }, [crop]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !hasSource) return;

    const update = () => {
      const rect = stage.getBoundingClientRect();
      setStageSize({ width: rect.width, height: rect.height });
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [hasSource, originalUrl]);

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
    setAspectIdSelected("free");
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));

    try {
      const dims = await readImageDimensions(file);
      setOriginalWidth(dims.width);
      setOriginalHeight(dims.height);
      const next = defaultCropRect(dims.width, dims.height, null);
      setCrop(next);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not read image dimensions.";
      setError(message);
      setOriginalWidth(0);
      setOriginalHeight(0);
      setCrop({
        x: 0,
        y: 0,
        width: MIN_CROP_SIZE,
        height: MIN_CROP_SIZE,
      });
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setSourceFile(null);
    setOriginalUrl("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setAspectIdSelected("free");
    setCrop({
      x: 0,
      y: 0,
      width: MIN_CROP_SIZE,
      height: MIN_CROP_SIZE,
    });
    setError("");
    setProgressText("");
    setLoading(false);
  }

  function handleAspectPreset(id: string, ratio: number | null) {
    if (!originalWidth || !originalHeight) return;
    setAspectIdSelected(id);
    setCrop((prev) =>
      applyAspectRatio(prev, originalWidth, originalHeight, ratio),
    );
  }

  function updateCropFromDrag(
    mode: DragMode,
    imageX: number,
    imageY: number,
    origin: CropRect,
  ) {
    if (!originalWidth || !originalHeight) return;

    let next: CropRect = { ...origin };
    const minSize = MIN_CROP_SIZE;

    if (mode === "move") {
      next = {
        ...origin,
        x: imageX,
        y: imageY,
      };
      setCrop(clampCropRect(next, originalWidth, originalHeight, activeRatio));
      return;
    }

    const right = origin.x + origin.width;
    const bottom = origin.y + origin.height;

    if (mode.includes("e")) {
      next.width = Math.max(minSize, imageX - origin.x);
    }
    if (mode.includes("w")) {
      const newX = Math.min(imageX, right - minSize);
      next.x = newX;
      next.width = right - newX;
    }
    if (mode.includes("s")) {
      next.height = Math.max(minSize, imageY - origin.y);
    }
    if (mode.includes("n")) {
      const newY = Math.min(imageY, bottom - minSize);
      next.y = newY;
      next.height = bottom - newY;
    }

    if (activeRatio != null) {
      // Keep the opposite corner/edge anchored while enforcing aspect.
      if (mode === "e" || mode === "w") {
        next.height = Math.max(minSize, Math.round(next.width / activeRatio));
        if (mode === "w") {
          next.y = bottom - next.height;
        }
      } else if (mode === "n" || mode === "s") {
        next.width = Math.max(minSize, Math.round(next.height * activeRatio));
        if (mode === "n") {
          next.x = right - next.width;
        }
      } else {
        // Corner handles: drive from the changing width, adjust height.
        next.height = Math.max(minSize, Math.round(next.width / activeRatio));
        if (mode.includes("n")) {
          next.y = bottom - next.height;
        }
        if (mode.includes("w")) {
          next.x = right - next.width;
        }
      }
    }

    setCrop(clampCropRect(next, originalWidth, originalHeight, activeRatio));
  }

  function onPointerDown(
    event: ReactPointerEvent<HTMLElement>,
    mode: DragMode,
  ) {
    if (!hasSource || loading || !stageRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    const metrics = getDisplayMetrics(
      stageRef.current,
      originalWidth,
      originalHeight,
    );
    if (!metrics) return;

    const point = clientToImage(
      event.clientX,
      event.clientY,
      stageRef.current,
      metrics,
    );
    const origin = { ...cropRef.current };

    dragRef.current = {
      pointerId: event.pointerId,
      mode,
      startX: mode === "move" ? point.x - origin.x : point.x,
      startY: mode === "move" ? point.y - origin.y : point.y,
      origin,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !stageRef.current) {
      return;
    }

    const metrics = getDisplayMetrics(
      stageRef.current,
      originalWidth,
      originalHeight,
    );
    if (!metrics) return;

    const point = clientToImage(
      event.clientX,
      event.clientY,
      stageRef.current,
      metrics,
    );

    if (drag.mode === "move") {
      // startX/Y store the pointer offset inside the crop at drag start.
      updateCropFromDrag(
        "move",
        point.x - drag.startX,
        point.y - drag.startY,
        drag.origin,
      );
      return;
    }

    updateCropFromDrag(drag.mode, point.x, point.y, drag.origin);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  async function handleCrop() {
    if (!sourceFile) {
      setError("Upload an image to get started.");
      return;
    }
    if (!cropValid) {
      setError("Adjust the crop area so it stays inside the image.");
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
      const cropped = await cropImageFile(sourceFile, {
        crop,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(cropped.blob);
      setResult(cropped);
      setResultUrl(url);
      downloadCroppedImage(
        cropped.blob,
        sourceFile,
        cropped.width,
        cropped.height,
      );
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
          : "Could not crop this image. Try another file or browser.";
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
    downloadCroppedImage(
      result.blob,
      sourceFile,
      result.width,
      result.height,
    );
  }

  const metrics =
    hasSource && stageSize.width > 0
      ? (() => {
          const scale = Math.min(
            stageSize.width / originalWidth,
            stageSize.height / originalHeight,
          );
          const displayWidth = originalWidth * scale;
          const displayHeight = originalHeight * scale;
          return {
            offsetX: (stageSize.width - displayWidth) / 2,
            offsetY: (stageSize.height - displayHeight) / 2,
            displayWidth,
            displayHeight,
            scale,
          };
        })()
      : null;

  const selectionStyle =
    metrics && hasSource
      ? {
          left: metrics.offsetX + crop.x * metrics.scale,
          top: metrics.offsetY + crop.y * metrics.scale,
          width: crop.width * metrics.scale,
          height: crop.height * metrics.scale,
        }
      : undefined;

  const handles: DragMode[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

  return (
    <div className="tool-grid crop-image">
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

        <div className="crop-image__options">
          <div className="ui-field">
            <span className="ui-label" id={aspectId}>
              Aspect ratio
            </span>
            <div
              className="crop-image__chips"
              role="group"
              aria-labelledby={aspectId}
            >
              {ASPECT_RATIO_PRESETS.map((preset) => {
                const selected = aspectIdSelected === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={cn(
                      "crop-image__chip",
                      selected && "is-active",
                    )}
                    disabled={loading || !hasSource}
                    onClick={() =>
                      handleAspectPreset(preset.id, preset.ratio)
                    }
                  >
                    <span className="crop-image__chip-label">
                      {preset.label}
                    </span>
                    <span className="crop-image__chip-hint">
                      {preset.hint}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="ui-hint">
              Drag the box to move it. Use the handles to resize
              {activeRatio != null ? " (ratio locked)" : ""}.
            </p>
          </div>

          {hasSource ? (
            <p className="crop-image__dims-meta" aria-live="polite">
              Crop size: {crop.width}×{crop.height} px
            </p>
          ) : null}
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleCrop()}
            disabled={!hasSource || loading || !cropValid}
          >
            {loading ? "Cropping…" : "Crop image"}
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
                {progressText || "Cropping image…"}
              </span>
              <span className="tool-loading__subtext">
                Cropping runs locally in your browser.
              </span>
            </div>
          ) : hasResult && originalUrl && resultUrl ? (
            <div className="crop-image__result">
              <p className="crop-image__result-meta">
                {describeCrop(
                  result!.originalWidth,
                  result!.originalHeight,
                  result!.width,
                  result!.height,
                )}
                {" · "}
                {formatFileSize(result!.blob.size)}
              </p>
              <BeforeAfterPreview
                beforeSrc={originalUrl}
                afterSrc={resultUrl}
                beforeAlt="Original image"
                afterAlt="Cropped image"
                hint="Drag the slider to compare the original and cropped image."
              />
            </div>
          ) : hasSource && originalUrl ? (
            <div className="crop-image__editor">
              <div
                ref={stageRef}
                className="crop-image__stage"
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalUrl}
                  alt="Uploaded preview"
                  draggable={false}
                  className="crop-image__image"
                  style={
                    metrics
                      ? {
                          left: metrics.offsetX,
                          top: metrics.offsetY,
                          width: metrics.displayWidth,
                          height: metrics.displayHeight,
                        }
                      : undefined
                  }
                />
                {metrics && selectionStyle ? (
                  <>
                    <div
                      className="crop-image__shade"
                      style={{
                        left: metrics.offsetX,
                        top: metrics.offsetY,
                        width: metrics.displayWidth,
                        height: Math.max(0, selectionStyle.top - metrics.offsetY),
                      }}
                    />
                    <div
                      className="crop-image__shade"
                      style={{
                        left: metrics.offsetX,
                        top: selectionStyle.top + selectionStyle.height,
                        width: metrics.displayWidth,
                        height: Math.max(
                          0,
                          metrics.offsetY +
                            metrics.displayHeight -
                            (selectionStyle.top + selectionStyle.height),
                        ),
                      }}
                    />
                    <div
                      className="crop-image__shade"
                      style={{
                        left: metrics.offsetX,
                        top: selectionStyle.top,
                        width: Math.max(
                          0,
                          selectionStyle.left - metrics.offsetX,
                        ),
                        height: selectionStyle.height,
                      }}
                    />
                    <div
                      className="crop-image__shade"
                      style={{
                        left: selectionStyle.left + selectionStyle.width,
                        top: selectionStyle.top,
                        width: Math.max(
                          0,
                          metrics.offsetX +
                            metrics.displayWidth -
                            (selectionStyle.left + selectionStyle.width),
                        ),
                        height: selectionStyle.height,
                      }}
                    />
                    <div
                      className="crop-image__selection"
                      style={selectionStyle}
                      onPointerDown={(event) => onPointerDown(event, "move")}
                      role="img"
                      aria-label={`Crop selection ${crop.width} by ${crop.height} pixels. Drag to move.`}
                    >
                      {handles.map((handle) => (
                        <span
                          key={handle}
                          className={cn(
                            "crop-image__handle",
                            `crop-image__handle--${handle}`,
                          )}
                          onPointerDown={(event) =>
                            onPointerDown(event, handle)
                          }
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
              <p className="tool-placeholder preview-single__hint">
                Adjust the crop, then click Crop image.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload an image to crop it here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "Crop in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
