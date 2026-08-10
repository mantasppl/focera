"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Button from "@/components/Button";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { formatFileSize } from "@/lib/image";
import {
  MAX_OUTPUT_SIZE,
  MAX_ZOOM,
  MIN_OUTPUT_SIZE,
  MIN_ZOOM,
  ROUND_SIZE_PRESETS,
  clampOutputSize,
  clampPan,
  clampZoom,
  createRoundImage,
  defaultCropState,
  downloadRoundImage,
  readImageDimensions,
  type CropState,
  type RoundImageResult,
} from "@/lib/round-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function RoundImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const sizeId = useId();
  const zoomId = useId();
  const presetGroupId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [size, setSize] = useState("400");
  const [selectedPresetId, setSelectedPresetId] = useState("lg");
  const [crop, setCrop] = useState<CropState>(defaultCropState);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<RoundImageResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");

  const hasSource = Boolean(sourceFile && originalUrl && originalWidth);
  const hasResult = Boolean(result && resultUrl);
  const sizeNum = Number(size);
  const sizeValid =
    Number.isFinite(sizeNum) &&
    sizeNum >= MIN_OUTPUT_SIZE &&
    sizeNum <= MAX_OUTPUT_SIZE;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

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
    setCrop(defaultCropState());
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));

    try {
      const dims = await readImageDimensions(file);
      setOriginalWidth(dims.width);
      setOriginalHeight(dims.height);
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
    setSourceFile(null);
    setOriginalUrl("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setCrop(defaultCropState());
    setError("");
    setProgressText("");
    setLoading(false);
  }

  function handlePreset(id: string, presetSize: number) {
    setSelectedPresetId(id);
    setSize(String(presetSize));
  }

  function handleZoomChange(value: number) {
    setCrop((prev) => ({ ...prev, zoom: clampZoom(value) }));
  }

  function onFramePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!hasSource || loading) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPanX: crop.panX,
      startPanY: crop.panY,
    };
  }

  function onFramePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const frame = frameRef.current;
    if (!frame || !originalWidth || !originalHeight) return;

    const rect = frame.getBoundingClientRect();
    const frameSize = Math.min(rect.width, rect.height);
    if (frameSize <= 0) return;

    const base = Math.min(originalWidth, originalHeight);
    const sSize = base / clampZoom(crop.zoom);
    const maxX = Math.max(0, originalWidth - sSize);
    const maxY = Math.max(0, originalHeight - sSize);

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const nextPanX =
      maxX === 0 ? 0.5 : drag.startPanX - (dx / frameSize) * (sSize / maxX);
    const nextPanY =
      maxY === 0 ? 0.5 : drag.startPanY - (dy / frameSize) * (sSize / maxY);

    setCrop((prev) => ({
      ...prev,
      panX: clampPan(nextPanX),
      panY: clampPan(nextPanY),
    }));
  }

  function onFramePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  async function handleCreate() {
    if (!sourceFile) {
      setError("Upload an image to get started.");
      return;
    }
    if (!sizeValid) {
      setError(
        `Enter a size between ${MIN_OUTPUT_SIZE} and ${MAX_OUTPUT_SIZE} px.`,
      );
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
      const created = await createRoundImage(sourceFile, {
        size: clampOutputSize(sizeNum),
        crop,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(created.blob);
      setResult(created);
      setResultUrl(url);
      downloadRoundImage(created.blob, sourceFile, created.size);
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
          : "Could not create this round image. Try another image or browser.";
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
    downloadRoundImage(result.blob, sourceFile, result.size);
  }

  const previewStyle = (() => {
    if (!originalWidth || !originalHeight) return undefined;
    const base = Math.min(originalWidth, originalHeight);
    const sSize = base / clampZoom(crop.zoom);
    const maxX = Math.max(0, originalWidth - sSize);
    const maxY = Math.max(0, originalHeight - sSize);
    const sx = clampPan(crop.panX) * maxX;
    const sy = clampPan(crop.panY) * maxY;
    const leftPercent = -(sx / sSize) * 100;
    const topPercent = -(sy / sSize) * 100;
    const widthPercent = (originalWidth / sSize) * 100;
    const heightPercent = (originalHeight / sSize) * 100;
    return {
      width: `${widthPercent}%`,
      height: `${heightPercent}%`,
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
    } satisfies CSSProperties;
  })();

  return (
    <div className="tool-grid round-image">
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

        <div className="round-image__options">
          <div className="ui-field">
            <span className="ui-label" id={presetGroupId}>
              Output size
            </span>
            <div
              className="round-image__chips"
              role="group"
              aria-labelledby={presetGroupId}
            >
              {ROUND_SIZE_PRESETS.map((preset) => {
                const selected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={cn(
                      "round-image__chip",
                      selected && "is-active",
                    )}
                    disabled={loading || !hasSource}
                    onClick={() => handlePreset(preset.id, preset.size)}
                  >
                    <span className="round-image__chip-label">
                      {preset.label}
                    </span>
                    <span className="round-image__chip-hint">
                      {preset.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor={sizeId}>
              Custom size (px)
            </label>
            <input
              id={sizeId}
              className="ui-input"
              type="number"
              min={MIN_OUTPUT_SIZE}
              max={MAX_OUTPUT_SIZE}
              step={1}
              inputMode="numeric"
              value={size}
              disabled={loading || !hasSource}
              onChange={(event) => {
                setSelectedPresetId("");
                setSize(event.target.value);
              }}
            />
            <p className="ui-hint">
              Circular PNG from {MIN_OUTPUT_SIZE} to {MAX_OUTPUT_SIZE} px.
            </p>
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor={zoomId}>
              Zoom {crop.zoom.toFixed(1)}×
            </label>
            <input
              id={zoomId}
              className="round-image__zoom"
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.05}
              value={crop.zoom}
              disabled={loading || !hasSource}
              onChange={(event) =>
                handleZoomChange(Number(event.target.value))
              }
            />
            <p className="ui-hint">
              Drag the preview to reframe. Zoom in to tighten the crop.
            </p>
          </div>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleCreate()}
            disabled={!hasSource || loading || !sizeValid}
          >
            {loading ? "Creating…" : "Make round image"}
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
                {progressText || "Creating round image…"}
              </span>
              <span className="tool-loading__subtext">
                Cropping runs locally in your browser.
              </span>
            </div>
          ) : hasResult && resultUrl ? (
            <div className="round-image__result">
              <p className="round-image__result-meta">
                {result!.size}×{result!.size} · circle
                {" · "}
                {formatFileSize(result!.blob.size)}
              </p>
              <div className="round-image__result-frame is-circle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultUrl}
                  alt="Round image result"
                  className="round-image__result-image"
                />
              </div>
            </div>
          ) : hasSource && originalUrl ? (
            <div className="round-image__editor">
              <div
                ref={frameRef}
                className="round-image__frame is-circle"
                onPointerDown={onFramePointerDown}
                onPointerMove={onFramePointerMove}
                onPointerUp={onFramePointerUp}
                onPointerCancel={onFramePointerUp}
                role="img"
                aria-label="Round image crop preview. Drag to reframe."
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalUrl}
                  alt=""
                  draggable={false}
                  className="round-image__frame-image"
                  style={previewStyle}
                />
              </div>
              <p className="tool-placeholder preview-single__hint">
                Drag to reframe, then create your {sizeNum || "—"}×
                {sizeNum || "—"} round image.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload an image to make it round here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "Circle crop with transparent edges · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
