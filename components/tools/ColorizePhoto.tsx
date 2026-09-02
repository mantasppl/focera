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
  COLORIZE_PRESETS,
  colorizePhotoFile,
  describeColorizeResult,
  type ColorizePhotoResult,
  type ColorizeStrength,
} from "@/lib/colorize-photo";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function ColorizePhoto() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const strengthId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [strength, setStrength] = useState<ColorizeStrength>("natural");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ColorizePhotoResult | null>(null);
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
      sourceFile ? `${fileBaseName(sourceFile)}-colorized` : null,
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

  async function handleColorize() {
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
      const colorized = await colorizePhotoFile(sourceFile, {
        strength,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(colorized.blob);
      setResult(colorized);
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
          : "Could not colorize this photo. Try a smaller file or another browser.";
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
        className="colorize-photo"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={loading}
        loadingText={progressText || "Colorizing photo…"}
        loadingSubtext="AI colorization runs locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasResult
            ? `${describeColorizeResult(
                result!.width,
                result!.height,
                result!.strength,
              )} · ${formatFileSize(result!.blob.size)}`
            : hasSource
              ? sourceFile!.name
              : "Upload a photo to start"
        }
        previewHint={
          hasSource && !hasResult
            ? "Choose a strength and click Colorize photo"
            : undefined
        }
        privacyHint={
          hasResult
            ? "Processed locally on your device"
            : "AI colorization in your browser · files never upload to Focera"
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

            <div className="colorize-photo__options">
              <div className="ui-field">
                <span className="ui-label" id={strengthId}>
                  Color strength
                </span>
                <div
                  className="colorize-photo__chips"
                  role="radiogroup"
                  aria-labelledby={strengthId}
                >
                  {COLORIZE_PRESETS.map((preset) => {
                    const selected = strength === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "colorize-photo__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => setStrength(preset.id)}
                      >
                        <span className="colorize-photo__chip-label">
                          {preset.label}
                        </span>
                        <span className="colorize-photo__chip-hint">
                          {preset.hint}
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
                onClick={() => void handleColorize()}
                disabled={!hasSource || loading}
              >
                {loading ? "Colorizing…" : "Colorize photo"}
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
          <div className="image-editor-shell__result colorize-photo__result">
            <p className="image-editor-shell__result-meta colorize-photo__result-meta">
              {describeColorizeResult(
                result!.width,
                result!.height,
                result!.strength,
              )}
              {" · "}
              {formatFileSize(result!.blob.size)}
            </p>
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              beforeAlt="Original photo"
              afterAlt="Colorized photo"
              hint="Drag the slider to compare the original and colorized photo."
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
