"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import ImageSourceBar from "@/components/tools/ImageSourceBar";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  BRUSH_SIZE,
  removeObjectsFromImage,
  type RemoveObjectsResult,
} from "@/lib/remove-objects";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type BrushMode = "paint" | "erase";

export default function RemoveObjects() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const brushId = useId();
  const modeId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const hasMaskRef = useRef(false);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [brushSize, setBrushSize] = useState<number>(BRUSH_SIZE.default);
  const [brushMode, setBrushMode] = useState<BrushMode>("paint");
  const [hasMask, setHasMask] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<RemoveObjectsResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = Boolean(result && resultUrl);
  const canRemove = hasSource && hasMask && imageReady && !loading && !hasResult;

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
      sourceFile ? `${fileBaseName(sourceFile)}-objects-removed` : null,
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

  function clearMask() {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasMaskRef.current = false;
    setHasMask(false);
  }

  function syncMaskCanvasSize() {
    const image = imageRef.current;
    const canvas = maskCanvasRef.current;
    if (!image || !canvas) return;

    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (width < 1 || height < 1) return;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      hasMaskRef.current = false;
      setHasMask(false);
    }
    setOriginalWidth(width);
    setOriginalHeight(height);
    setImageReady(true);
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setError("");
    setProgressText("");
    setImageReady(false);
    setOriginalWidth(0);
    setOriginalHeight(0);
    hasMaskRef.current = false;
    setHasMask(false);
    setBrushMode("paint");
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));
  }

  function handleReset() {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setSourceFile(null);
    setOriginalUrl("");
    setError("");
    setProgressText("");
    setLoading(false);
    setImageReady(false);
    setOriginalWidth(0);
    setOriginalHeight(0);
    hasMaskRef.current = false;
    setHasMask(false);
  }

  function handleEditAgain() {
    clearResult();
    setError("");
    setProgressText("");
  }

  function canvasPoint(
    event: React.PointerEvent<HTMLCanvasElement>,
  ): { x: number; y: number } | null {
    const canvas = maskCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function drawStroke(
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
    if (brushMode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(220, 48, 48, 0.72)";
    }
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();

    if (brushMode === "paint") {
      hasMaskRef.current = true;
      setHasMask(true);
    } else {
      const sample = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let found = false;
      for (let i = 3; i < sample.data.length; i += 16) {
        if (sample.data[i]! > 24) {
          found = true;
          break;
        }
      }
      hasMaskRef.current = found;
      setHasMask(found);
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (loading || hasResult || !imageReady) return;
    const point = canvasPoint(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = point;
    drawStroke(point, point);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const point = canvasPoint(event);
    const last = lastPointRef.current;
    if (!point || !last) return;
    drawStroke(last, point);
    lastPointRef.current = point;
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer may already be released.
    }
  }

  async function handleRemove() {
    if (!sourceFile) {
      setError("Upload an image to get started.");
      return;
    }

    const canvas = maskCanvasRef.current;
    if (!canvas || !hasMaskRef.current) {
      setError("Paint over the object before removing it.");
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      setError("Canvas is not supported in this browser.");
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
      const mask = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const cleaned = await removeObjectsFromImage(sourceFile, {
        mask,
        radius: Math.max(4, Math.round(brushSize / 5)),
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(cleaned.blob);
      setResult(cleaned);
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
          : "Could not remove the object. Try a smaller brush area or another image.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <ImageEditorShell
        className="remove-objects"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={loading}
        loadingText={progressText || "Removing objects…"}
        loadingSubtext="Restoration runs locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasResult
            ? `${result!.width}×${result!.height} px`
            : hasSource && originalWidth
              ? `${originalWidth}×${originalHeight} px`
              : "Upload an image to start"
        }
        previewHint={
          hasSource && !hasResult
            ? "Paint over objects, then click Remove objects"
            : undefined
        }
        privacyHint={
          hasResult
            ? "Processed locally on your device"
            : "Paint and restore in your browser · files never upload to Focera"
        }
        sidebar={
          <>
            {!hasSource ? (
              <ImageDropzone
                onFile={handleFile}
                onError={setError}
                disabled={loading}
              />
            ) : (
              <ImageSourceBar
                file={sourceFile!}
                width={originalWidth || undefined}
                height={originalHeight || undefined}
                disabled={loading}
                onReplace={handleFile}
              />
            )}

            {hasSource && !hasResult ? (
              <div className="remove-objects__options">
                <div className="ui-field">
                  <span className="ui-label" id={modeId}>
                    Brush mode
                  </span>
                  <div
                    className="remove-objects__chips"
                    role="radiogroup"
                    aria-labelledby={modeId}
                  >
                    {(
                      [
                        { id: "paint", label: "Paint", hint: "Mark object" },
                        { id: "erase", label: "Erase", hint: "Fix mask" },
                      ] as const
                    ).map((mode) => {
                      const selected = brushMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          className={cn(
                            "remove-objects__chip",
                            selected && "is-active",
                          )}
                          disabled={loading}
                          onClick={() => setBrushMode(mode.id)}
                        >
                          <span className="remove-objects__chip-label">
                            {mode.label}
                          </span>
                          <span className="remove-objects__chip-hint">
                            {mode.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="export-slider">
                  <div className="export-slider__label">
                    <label htmlFor={brushId}>Brush size</label>
                    <span className="export-slider__value">{brushSize}px</span>
                  </div>
                  <input
                    id={brushId}
                    className="export-slider__input"
                    type="range"
                    min={BRUSH_SIZE.min}
                    max={BRUSH_SIZE.max}
                    step={1}
                    value={brushSize}
                    disabled={loading}
                    onChange={(event) =>
                      setBrushSize(Number(event.target.value))
                    }
                  />
                </div>
              </div>
            ) : null}
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              {hasResult ? (
                <>
                  <Button onClick={openDownload} disabled={loading}>
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleEditAgain}
                    disabled={loading}
                  >
                    Edit mask
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => void handleRemove()}
                    disabled={!canRemove}
                  >
                    {loading ? "Removing…" : "Remove objects"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={clearMask}
                    disabled={!hasSource || !hasMask || loading}
                  >
                    Clear mask
                  </Button>
                </>
              )}
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
        {hasResult && originalUrl && resultUrl ? (
          <div className="image-editor-shell__result remove-objects__result">
            <p className="image-editor-shell__result-meta remove-objects__result-meta">
              {result!.width}×{result!.height}
              {" · "}
              {formatFileSize(result!.blob.size)}
            </p>
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              beforeAlt="Original photo with object"
              afterAlt="Photo with object removed"
              hint="Drag the slider to compare the original and cleaned photo."
            />
          </div>
        ) : hasSource && originalUrl ? (
          <div className="remove-objects__paint">
            <div className="remove-objects__paint-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={originalUrl}
                alt="Uploaded photo — paint over the object to remove"
                className="remove-objects__image"
                draggable={false}
                onLoad={syncMaskCanvasSize}
              />
              <canvas
                ref={maskCanvasRef}
                className={cn(
                  "remove-objects__mask",
                  brushMode === "erase" && "is-erase",
                )}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
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
