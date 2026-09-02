"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import ImageSourceBar from "@/components/tools/ImageSourceBar";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName } from "@/lib/image";
import {
  BORDER_COLORS,
  BORDER_WIDTH_PRESETS,
  addBorderToImage,
  describeBorderResult,
  type AddBorderToImageResult,
  type BorderColorId,
  type BorderWidthId,
} from "@/lib/add-border-to-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function AddBorderToImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const widthId = useId();
  const colorId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [borderWidth, setBorderWidth] = useState<BorderWidthId>("medium");
  const [borderColor, setBorderColor] = useState<BorderColorId>("white");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AddBorderToImageResult | null>(null);
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
      sourceFile ? `${fileBaseName(sourceFile) || "photo"}-border` : null,
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

  async function handleConvert() {
    if (!sourceFile) {
      setError("Upload a photo to get started.");
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
      const bordered = await addBorderToImage(sourceFile, {
        widthId: borderWidth,
        colorId: borderColor,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(bordered.blob);
      setResult(bordered);
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
          : "Could not add a border to this photo. Try a smaller file or another browser.";
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
        className="add-border-to-image"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={loading}
        loadingText={progressText || "Adding border…"}
        loadingSubtext="Processing runs locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasResult
            ? describeBorderResult(
                result!.width,
                result!.height,
                result!.borderPx,
                result!.colorId,
                result!.widthId,
                result!.blob.size,
              )
            : hasSource
              ? sourceFile!.name
              : "Upload a photo to start"
        }
        previewHint={
          hasSource && !hasResult
            ? "Choose width and color, then click Add border"
            : undefined
        }
        privacyHint={
          hasResult
            ? "Processed locally on your device"
            : "Add a photo border in your browser · files never upload to Focera"
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

            <div className="add-border-to-image__options">
              <div className="ui-field">
                <span className="ui-label" id={widthId}>
                  Border width
                </span>
                <div
                  className="add-border-to-image__chips"
                  role="radiogroup"
                  aria-labelledby={widthId}
                >
                  {BORDER_WIDTH_PRESETS.map((preset) => {
                    const selected = borderWidth === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "add-border-to-image__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => setBorderWidth(preset.id)}
                      >
                        <span className="add-border-to-image__chip-label">
                          {preset.label}
                        </span>
                        <span className="add-border-to-image__chip-hint">
                          {preset.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="ui-field">
                <span className="ui-label" id={colorId}>
                  Border color
                </span>
                <div
                  className="add-border-to-image__chips add-border-to-image__chips--colors"
                  role="radiogroup"
                  aria-labelledby={colorId}
                >
                  {BORDER_COLORS.map((option) => {
                    const selected = borderColor === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "add-border-to-image__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => setBorderColor(option.value)}
                      >
                        <span className="add-border-to-image__chip-label">
                          {option.label}
                        </span>
                        <span className="add-border-to-image__chip-hint">
                          {option.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button
                onClick={() => void handleConvert()}
                disabled={!hasSource || loading}
              >
                {loading ? "Adding border…" : "Add border"}
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
          <div className="image-editor-shell__result add-border-to-image__result">
            <p className="image-editor-shell__result-meta add-border-to-image__result-meta">
              {describeBorderResult(
                result!.width,
                result!.height,
                result!.borderPx,
                result!.colorId,
                result!.widthId,
                result!.blob.size,
              )}
            </p>
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              beforeAlt="Original photo"
              afterAlt="Photo with border"
              hint="Drag the slider to compare the original and bordered photo."
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
