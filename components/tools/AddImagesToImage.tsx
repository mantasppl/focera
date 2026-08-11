"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import ImageDropzone from "@/components/tools/ImageDropzone";
import AddImagesToImageDropzone from "@/components/tools/AddImagesToImageDropzone";
import { formatFileSize } from "@/lib/image";
import {
  DEFAULT_OPACITY,
  DEFAULT_SCALE,
  MAX_OPACITY,
  MAX_OVERLAY_FILES,
  MAX_SCALE,
  MIN_OPACITY,
  MIN_SCALE,
  OVERLAY_POSITIONS,
  OVERLAY_ROTATIONS,
  addImagesToImage,
  clampOpacity,
  clampScale,
  defaultPlacement,
  downloadComposedImage,
  drawOverlaysOnCanvas,
  loadImageElement,
  type AddImagesToImageResult,
  type DrawOverlayLayer,
  type OverlayPlacement,
  type OverlayPosition,
  type OverlayRotation,
} from "@/lib/add-images-to-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type OverlayEntry = {
  id: string;
  file: File;
  placement: OverlayPlacement;
};

function createEntries(files: File[]): OverlayEntry[] {
  return files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
    file,
    placement: defaultPlacement(),
  }));
}

export default function AddImagesToImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const listId = useId();
  const positionId = useId();
  const rotationId = useId();
  const scaleId = useId();
  const opacityId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const overlayImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [overlays, setOverlays] = useState<OverlayEntry[]>([]);
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AddImagesToImageResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [previewTick, setPreviewTick] = useState(0);

  const overlayFiles = overlays.map((entry) => entry.file);
  const activeOverlay =
    overlays.find((entry) => entry.id === activeOverlayId) ?? overlays[0] ?? null;
  const hasBase = Boolean(baseFile && originalUrl && originalWidth);
  const hasOverlays = overlays.length > 0;
  const hasResult = Boolean(result && resultUrl);
  const canCompose = hasBase && hasOverlays && !loading;
  const totalOverlayBytes = overlayFiles.reduce((sum, file) => sum + file.size, 0);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const overlayFileKey = overlays
    .map(
      (entry) =>
        `${entry.id}:${entry.file.name}:${entry.file.size}:${entry.file.lastModified}`,
    )
    .join("|");

  useEffect(() => {
    let cancelled = false;
    const snapshot = overlays.map((entry) => ({
      id: entry.id,
      file: entry.file,
    }));

    async function loadOverlays() {
      const nextMap = new Map<string, HTMLImageElement>();
      for (const entry of snapshot) {
        try {
          const image = await loadImageElement(entry.file);
          if (cancelled) return;
          nextMap.set(entry.id, image);
        } catch {
          // Preview skips failed overlays; compose will surface the error.
        }
      }
      if (cancelled) return;
      overlayImagesRef.current = nextMap;
      setPreviewTick((tick) => tick + 1);
    }

    void loadOverlays();
    return () => {
      cancelled = true;
    };
    // Only reload decoded bitmaps when overlay files change — not placement edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- overlayFileKey tracks file identity
  }, [overlayFileKey]);

  useEffect(() => {
    if (!hasBase || !baseImageRef.current || hasResult || loading) return;

    const canvas = previewCanvasRef.current;
    const base = baseImageRef.current;
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

    const layers: DrawOverlayLayer[] = [];
    for (const entry of overlays) {
      const image = overlayImagesRef.current.get(entry.id);
      if (!image) continue;
      const naturalWidth = image.naturalWidth || image.width;
      const naturalHeight = image.naturalHeight || image.height;
      if (!naturalWidth || !naturalHeight) continue;
      layers.push({
        image,
        naturalWidth,
        naturalHeight,
        placement: entry.placement,
      });
    }

    drawOverlaysOnCanvas(
      ctx,
      base,
      originalWidth,
      originalHeight,
      width,
      height,
      layers,
    );
  }, [
    hasBase,
    hasResult,
    loading,
    originalWidth,
    originalHeight,
    overlays,
    previewTick,
  ]);

  function clearResult() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResult(null);
    setResultUrl("");
  }

  async function handleBaseFile(file: File) {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setError("");
    setProgressText("");
    setBaseFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    baseImageRef.current = null;

    try {
      const image = await loadImageElement(file);
      baseImageRef.current = image;
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      if (!width || !height) {
        throw new Error("Could not determine image dimensions.");
      }
      setOriginalWidth(width);
      setOriginalHeight(height);
      setPreviewTick((tick) => tick + 1);
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

  function handleAddOverlays(incoming: File[]) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    const entries = createEntries(incoming);
    setOverlays((current) => [...current, ...entries]);
    setActiveOverlayId((current) => current ?? entries[0]?.id ?? null);
  }

  function handleRemoveOverlay(id: string) {
    clearResult();
    setOverlays((current) => {
      const next = current.filter((entry) => entry.id !== id);
      if (activeOverlayId === id) {
        setActiveOverlayId(next[0]?.id ?? null);
      }
      return next;
    });
  }

  function handleMoveOverlay(id: string, direction: -1 | 1) {
    clearResult();
    setOverlays((current) => {
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

  function updateActivePlacement(patch: Partial<OverlayPlacement>) {
    if (!activeOverlay) return;
    clearResult();
    setOverlays((current) =>
      current.map((entry) =>
        entry.id === activeOverlay.id
          ? { ...entry, placement: { ...entry.placement, ...patch } }
          : entry,
      ),
    );
  }

  function handleReset() {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    baseImageRef.current = null;
    overlayImagesRef.current = new Map();
    setBaseFile(null);
    setOriginalUrl("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setOverlays([]);
    setActiveOverlayId(null);
    setError("");
    setProgressText("");
    setLoading(false);
  }

  async function handleCompose() {
    if (!baseFile) {
      setError("Upload a base image to get started.");
      return;
    }
    if (overlays.length === 0) {
      setError("Add at least one overlay image.");
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
      const composed = await addImagesToImage(baseFile, {
        overlays: overlays.map((entry) => ({
          file: entry.file,
          placement: entry.placement,
        })),
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(composed.blob);
      setResult(composed);
      setResultUrl(url);
      downloadComposedImage(composed.blob, baseFile);
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
          : "Could not compose these images. Try smaller files or another browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleDownloadAgain() {
    if (!baseFile || !result) return;
    downloadComposedImage(result.blob, baseFile);
  }

  function handleEditAgain() {
    clearResult();
  }

  const scalePercent = Math.round(
    (activeOverlay?.placement.scale ?? DEFAULT_SCALE) * 100,
  );
  const opacityPercent = Math.round(
    (activeOverlay?.placement.opacity ?? DEFAULT_OPACITY) * 100,
  );

  return (
    <div className="tool-grid add-images-to-image">
      <div className="tool-panel">
        <div className="ui-field">
          <span className="ui-label">Base image</span>
          <ImageDropzone
            onFile={(file) => void handleBaseFile(file)}
            onError={setError}
            disabled={loading}
          />
        </div>

        {hasBase ? (
          <div className="upload-meta">
            <p className="upload-meta__name">{baseFile?.name}</p>
            <p className="upload-meta__size">
              {baseFile ? formatFileSize(baseFile.size) : ""}
              {originalWidth
                ? ` · ${originalWidth}×${originalHeight} px`
                : ""}
            </p>
          </div>
        ) : null}

        <div className="ui-field">
          <span className="ui-label">Overlay images</span>
          <AddImagesToImageDropzone
            existingFiles={overlayFiles}
            onFiles={handleAddOverlays}
            onError={setError}
            disabled={loading || overlays.length >= MAX_OVERLAY_FILES}
          />
        </div>

        {hasOverlays ? (
          <div className="add-images-to-image__list-wrap">
            <div className="add-images-to-image__list-header">
              <p className="add-images-to-image__list-title" id={listId}>
                Overlays ({overlays.length})
              </p>
              <p className="add-images-to-image__list-meta">
                {formatFileSize(totalOverlayBytes)} total
              </p>
            </div>
            <ol className="add-images-to-image__list" aria-labelledby={listId}>
              {overlays.map((entry, index) => {
                const selected = entry.id === activeOverlay?.id;
                return (
                  <li
                    key={entry.id}
                    className={cn(
                      "add-images-to-image__item",
                      selected && "is-active",
                    )}
                  >
                    <button
                      type="button"
                      className="add-images-to-image__select"
                      aria-pressed={selected}
                      onClick={() => {
                        setActiveOverlayId(entry.id);
                      }}
                    >
                      <span
                        className="add-images-to-image__index"
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                      <span className="add-images-to-image__file">
                        <span className="add-images-to-image__name">
                          {entry.file.name}
                        </span>
                        <span className="add-images-to-image__size">
                          {formatFileSize(entry.file.size)}
                        </span>
                      </span>
                    </button>
                    <div className="add-images-to-image__item-actions">
                      <button
                        type="button"
                        className="add-images-to-image__icon-btn"
                        aria-label={`Move ${entry.file.name} up`}
                        disabled={loading || index === 0}
                        onClick={() => handleMoveOverlay(entry.id, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="add-images-to-image__icon-btn"
                        aria-label={`Move ${entry.file.name} down`}
                        disabled={loading || index === overlays.length - 1}
                        onClick={() => handleMoveOverlay(entry.id, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="add-images-to-image__icon-btn"
                        aria-label={`Remove ${entry.file.name}`}
                        disabled={loading}
                        onClick={() => handleRemoveOverlay(entry.id)}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="ui-hint">
              Select an overlay to set its position, size, opacity, and
              rotation. Order is bottom to top.
            </p>
          </div>
        ) : null}

        {activeOverlay ? (
          <div className="add-images-to-image__options">
            <div className="ui-field">
              <span className="ui-label" id={positionId}>
                Position
              </span>
              <div
                className="add-images-to-image__chips add-images-to-image__chips--positions"
                role="radiogroup"
                aria-labelledby={positionId}
              >
                {OVERLAY_POSITIONS.map((option) => {
                  const selected =
                    activeOverlay.placement.position === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={cn(
                        "add-images-to-image__chip",
                        selected && "is-active",
                      )}
                      disabled={loading}
                      onClick={() =>
                        updateActivePlacement({
                          position: option.value as OverlayPosition,
                        })
                      }
                    >
                      <span className="add-images-to-image__chip-label">
                        {option.label}
                      </span>
                      <span className="add-images-to-image__chip-hint">
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
                className="add-images-to-image__chips add-images-to-image__chips--rotation"
                role="radiogroup"
                aria-labelledby={rotationId}
              >
                {OVERLAY_ROTATIONS.map((option) => {
                  const selected =
                    activeOverlay.placement.rotation === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={cn(
                        "add-images-to-image__chip",
                        selected && "is-active",
                      )}
                      disabled={loading}
                      onClick={() =>
                        updateActivePlacement({
                          rotation: option.value as OverlayRotation,
                        })
                      }
                    >
                      <span className="add-images-to-image__chip-label">
                        {option.label}
                      </span>
                      <span className="add-images-to-image__chip-hint">
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
                onChange={(event) => {
                  updateActivePlacement({
                    scale: clampScale(Number(event.target.value) / 100),
                  });
                }}
              />
              <p className="ui-hint">Width relative to the base image.</p>
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
                min={Math.round(MIN_OPACITY * 100)}
                max={Math.round(MAX_OPACITY * 100)}
                step={1}
                value={opacityPercent}
                disabled={loading}
                onChange={(event) => {
                  updateActivePlacement({
                    opacity: clampOpacity(Number(event.target.value) / 100),
                  });
                }}
              />
            </div>
          </div>
        ) : null}

        <div className="tool-actions">
          <Button
            onClick={() => void handleCompose()}
            disabled={!canCompose}
          >
            {loading ? "Composing…" : "Add images & download"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!hasBase && !hasOverlays && !hasResult) || loading}
          >
            Start over
          </Button>
        </div>

        {hasResult ? (
          <div className="tool-actions">
            <Button onClick={handleDownloadAgain}>Download again</Button>
            <Button variant="ghost" onClick={handleEditAgain}>
              Edit overlays
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
          className={`tool-stage${hasResult || hasBase ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Composing image…"}
              </span>
              <span className="tool-loading__subtext">
                Your images stay on this device.
              </span>
            </div>
          ) : hasResult && resultUrl ? (
            <div className="add-images-to-image__result">
              <p className="add-images-to-image__result-meta">
                {result!.width}×{result!.height} px ·{" "}
                {formatFileSize(result!.blob.size)} · {result!.overlayCount}{" "}
                overlay{result!.overlayCount === 1 ? "" : "s"}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultUrl}
                alt="Image with overlays"
                className="preview-single__image"
              />
              <p className="tool-placeholder preview-single__hint">
                Your download should start automatically. Change overlays and
                compose again anytime.
              </p>
            </div>
          ) : hasBase ? (
            <div className="add-images-to-image__preview">
              <canvas
                ref={previewCanvasRef}
                className="add-images-to-image__canvas"
                aria-label="Live preview of images on image"
              />
              <p className="tool-placeholder preview-single__hint">
                {hasOverlays
                  ? "Live preview — click Add images & download when ready."
                  : "Add overlay images to place them on the base photo."}
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a base image and overlays to preview the result here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "Overlays are stamped in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
