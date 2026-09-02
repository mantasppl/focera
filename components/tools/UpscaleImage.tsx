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
  UPSCALE_PRESETS,
  describeDimensions,
  upscaleImageFile,
  type UpscaleFactor,
  type UpscaleImageResult,
} from "@/lib/upscale-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function UpscaleImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const scaleId = useId();
  const enhanceId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [factor, setFactor] = useState<UpscaleFactor>(2);
  const [enhance, setEnhance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<UpscaleImageResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = Boolean(result && resultUrl);

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
        ? `${fileBaseName(sourceFile)}-upscaled-${result.factor}x`
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

  function handleFile(file: File) {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setError("");
    setProgressText("");
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
  }

  async function handleUpscale() {
    if (!sourceFile) {
      setError("Upload an image to get started.");
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
      const upscaled = await upscaleImageFile(sourceFile, {
        factor,
        enhance,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(upscaled.blob);
      setResult(upscaled);
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
          : "Could not upscale this image. Try a smaller file or another browser.";
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
        className="upscale-image"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={loading}
        loadingText={progressText || "Upscaling image…"}
        loadingSubtext="Resolution increase runs locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasResult
            ? `${describeDimensions(
                result!.originalWidth,
                result!.originalHeight,
                result!.width,
                result!.height,
              )} · ${formatFileSize(result!.blob.size)}${result!.enhanced ? " · enhanced" : ""}`
            : hasSource
              ? sourceFile!.name
              : "Upload an image to start"
        }
        previewHint={
          hasSource && !hasResult
            ? "Choose a scale and click Upscale image"
            : undefined
        }
        privacyHint={
          hasResult
            ? "Processed locally on your device"
            : "High-quality upscaling in your browser · files never upload to Focera"
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
                disabled={loading}
                onReplace={handleFile}
              />
            )}

            <div className="upscale-image__options">
              <div className="ui-field">
                <span className="ui-label" id={scaleId}>
                  Scale factor
                </span>
                <div
                  className="upscale-image__chips"
                  role="radiogroup"
                  aria-labelledby={scaleId}
                >
                  {UPSCALE_PRESETS.map((preset) => {
                    const selected = factor === preset.factor;
                    return (
                      <button
                        key={preset.factor}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "upscale-image__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => setFactor(preset.factor)}
                      >
                        <span className="upscale-image__chip-label">
                          {preset.label}
                        </span>
                        <span className="upscale-image__chip-hint">
                          {preset.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="upscale-image__enhance" htmlFor={enhanceId}>
                <input
                  id={enhanceId}
                  type="checkbox"
                  checked={enhance}
                  disabled={loading}
                  onChange={(event) => setEnhance(event.target.checked)}
                />
                <span>
                  <span className="upscale-image__enhance-title">
                    Enhance details
                  </span>
                  <span className="upscale-image__enhance-hint">
                    Sharpens edges after upscaling for a crisper look
                  </span>
                </span>
              </label>
            </div>
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button
                onClick={() => void handleUpscale()}
                disabled={!hasSource || loading}
              >
                {loading ? "Upscaling…" : "Upscale image"}
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
        {hasResult && originalUrl && resultUrl ? (
          <div className="image-editor-shell__result upscale-image__result">
            <p className="image-editor-shell__result-meta upscale-image__result-meta">
              {describeDimensions(
                result!.originalWidth,
                result!.originalHeight,
                result!.width,
                result!.height,
              )}
              {" · "}
              {formatFileSize(result!.blob.size)}
              {result!.enhanced ? " · enhanced" : ""}
            </p>
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              beforeAlt="Original image"
              afterAlt="Upscaled image"
              hint="Drag the slider to compare the original and upscaled image."
            />
          </div>
        ) : hasSource && originalUrl ? (
          <div className="image-editor-shell__preview-content preview-single">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalUrl}
              alt="Uploaded preview"
              className="preview-single__image"
            />
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
