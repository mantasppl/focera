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
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import ImageSourceBar from "@/components/tools/ImageSourceBar";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  MAX_OUTPUT_SIZE,
  MAX_ZOOM,
  MIN_OUTPUT_SIZE,
  MIN_ZOOM,
  PROFILE_SIZE_PRESETS,
  clampOutputSize,
  clampPan,
  clampZoom,
  createProfilePhoto,
  defaultCropState,
  readImageDimensions,
  type CropState,
  type ProfilePhotoResult,
  type ProfileShape,
} from "@/lib/profile-photo-maker";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function ProfilePhotoMaker() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const sizeId = useId();
  const zoomId = useId();
  const shapeId = useId();
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
  const [selectedPresetId, setSelectedPresetId] = useState("linkedin");
  const [shape, setShape] = useState<ProfileShape>("circle");
  const [crop, setCrop] = useState<CropState>(defaultCropState);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ProfilePhotoResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");

  const hasSource = Boolean(sourceFile && originalUrl && originalWidth);
  const hasResult = Boolean(result && resultUrl);
  const sizeNum = Number(size);
  const sizeValid =
    Number.isFinite(sizeNum) &&
    sizeNum >= MIN_OUTPUT_SIZE &&
    sizeNum <= MAX_OUTPUT_SIZE;

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
      sourceFile && result
        ? `${fileBaseName(sourceFile)}-profile-${result.shape}-${result.size}x${result.size}`
        : null,
  });

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

    // Dragging the image right should reveal more of the left side (pan decreases).
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
      const created = await createProfilePhoto(sourceFile, {
        size: clampOutputSize(sizeNum),
        shape,
        crop,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(created.blob);
      setResult(created);
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
          : "Could not create this profile photo. Try another image or browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  // Cover-style placement for the crop preview frame.
  const previewStyle = (() => {
    if (!originalWidth || !originalHeight) return undefined;
    const base = Math.min(originalWidth, originalHeight);
    const sSize = base / clampZoom(crop.zoom);
    const maxX = Math.max(0, originalWidth - sSize);
    const maxY = Math.max(0, originalHeight - sSize);
    const sx = clampPan(crop.panX) * maxX;
    const sy = clampPan(crop.panY) * maxY;
    // Position so the crop square maps to the 100% frame.
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
    <>
      <ImageEditorShell
        className="profile-photo-maker"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={loading}
        loadingText={progressText || "Creating profile photo…"}
        loadingSubtext="Cropping runs locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasResult
            ? `${result!.size}×${result!.size} · ${result!.shape}`
            : hasSource
              ? `${originalWidth}×${originalHeight} px`
              : "Upload an image to start"
        }
        previewHint={
          hasSource && !hasResult
            ? "Drag to reframe, then click Create profile photo"
            : undefined
        }
        privacyHint={
          hasResult
            ? "Processed locally on your device"
            : "Square or circle crop in your browser · files never upload to Focera"
        }
        sidebar={
          <>
            {!hasSource ? (
              <ImageDropzone
                onFile={(file) => void handleFile(file)}
                onError={setError}
                disabled={loading}
              />
            ) : (
              <ImageSourceBar
                file={sourceFile!}
                width={originalWidth}
                height={originalHeight}
                disabled={loading}
                onReplace={(file) => void handleFile(file)}
              />
            )}

            <div className="profile-photo-maker__options">
              <div className="ui-field">
                <span className="ui-label" id={shapeId}>
                  Shape
                </span>
                <div
                  className="profile-photo-maker__chips profile-photo-maker__chips--shape"
                  role="group"
                  aria-labelledby={shapeId}
                >
                  {(
                    [
                      { id: "circle", label: "Circle", hint: "Transparent PNG" },
                      { id: "square", label: "Square", hint: "Full square" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={cn(
                        "profile-photo-maker__chip",
                        shape === option.id && "is-active",
                      )}
                      disabled={loading || !hasSource}
                      onClick={() => setShape(option.id)}
                    >
                      <span className="profile-photo-maker__chip-label">
                        {option.label}
                      </span>
                      <span className="profile-photo-maker__chip-hint">
                        {option.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ui-field">
                <span className="ui-label" id={presetGroupId}>
                  Platform size
                </span>
                <div
                  className="profile-photo-maker__chips"
                  role="group"
                  aria-labelledby={presetGroupId}
                >
                  {PROFILE_SIZE_PRESETS.map((preset) => {
                    const selected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={cn(
                          "profile-photo-maker__chip",
                          selected && "is-active",
                        )}
                        disabled={loading || !hasSource}
                        onClick={() => handlePreset(preset.id, preset.size)}
                      >
                        <span className="profile-photo-maker__chip-label">
                          {preset.label}
                        </span>
                        <span className="profile-photo-maker__chip-hint">
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
                  Square output from {MIN_OUTPUT_SIZE} to {MAX_OUTPUT_SIZE} px.
                </p>
              </div>

              <div className="ui-field">
                <label className="ui-label" htmlFor={zoomId}>
                  Zoom {crop.zoom.toFixed(1)}×
                </label>
                <input
                  id={zoomId}
                  className="profile-photo-maker__zoom"
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
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button
                onClick={() => void handleCreate()}
                disabled={!hasSource || loading || !sizeValid}
              >
                {loading ? "Creating…" : "Create profile photo"}
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
            {error ? (
              <p className="tool-error" role="alert">
                {error}
              </p>
            ) : null}
          </>
        }
      >
        {hasResult && resultUrl ? (
          <div className="image-editor-shell__result profile-photo-maker__result">
            <p className="image-editor-shell__result-meta profile-photo-maker__result-meta">
              {result!.size}×{result!.size} · {result!.shape}
              {" · "}
              {formatFileSize(result!.blob.size)}
            </p>
            <div
              className={cn(
                "profile-photo-maker__result-frame",
                result!.shape === "circle" && "is-circle",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultUrl}
                alt="Profile photo result"
                className="profile-photo-maker__result-image"
              />
            </div>
          </div>
        ) : hasSource && originalUrl ? (
          <div className="profile-photo-maker__editor">
            <div
              ref={frameRef}
              className={cn(
                "profile-photo-maker__frame",
                shape === "circle" && "is-circle",
              )}
              onPointerDown={onFramePointerDown}
              onPointerMove={onFramePointerMove}
              onPointerUp={onFramePointerUp}
              onPointerCancel={onFramePointerUp}
              role="img"
              aria-label="Profile photo crop preview. Drag to reframe."
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt=""
                draggable={false}
                className="profile-photo-maker__frame-image"
                style={previewStyle}
              />
            </div>
          </div>
        ) : null}
      </ImageEditorShell>

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
