"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import WebpToJpgDropzone from "@/components/tools/WebpToJpgDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  convertWebpToJpgFrames,
  downloadAllFramesZip,
  revokeConvertedFrames,
  type ConvertedFrame,
  type WebpJpgQuality,
} from "@/lib/webp-to-jpg";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const QUALITY_OPTIONS: { value: WebpJpgQuality; label: string; hint: string }[] =
  [
    { value: 0.7, label: "Smaller", hint: "Faster downloads" },
    { value: 0.85, label: "Balanced", hint: "Good default" },
    { value: 0.95, label: "High", hint: "Sharper detail" },
  ];

export default function WebpToJpg() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const qualityId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const framesRef = useRef<ConvertedFrame[]>([]);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [frames, setFrames] = useState<ConvertedFrame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState(1);
  const [quality, setQuality] = useState<WebpJpgQuality>(0.85);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [zipping, setZipping] = useState(false);

  const hasSource = Boolean(sourceFile);
  const hasFrames = frames.length > 0;
  const activeFrame =
    frames.find((frame) => frame.frameNumber === selectedFrame) ??
    frames[0] ??
    null;

  const {
    formatOpen,
    setFormatOpen,
    downloading: formatDownloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => activeFrame?.blob ?? null,
    getFilename: () =>
      sourceFile && activeFrame
        ? `${fileBaseName(sourceFile)}-frame-${String(activeFrame.frameNumber).padStart(3, "0")}`
        : null,
  });

  useEffect(() => {
    framesRef.current = frames;
  }, [frames]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokeConvertedFrames(framesRef.current);
    };
  }, []);

  function clearFrames() {
    setFrames((current) => {
      revokeConvertedFrames(current);
      return [];
    });
    setSelectedFrame(1);
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    clearFrames();
    setError("");
    setProgressText("");
    setSourceFile(file);
  }

  function handleReset() {
    abortRef.current?.abort();
    clearFrames();
    setSourceFile(null);
    setError("");
    setProgressText("");
    setLoading(false);
    setZipping(false);
  }

  async function handleConvert() {
    if (!sourceFile) {
      setError("Upload a WebP to get started.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Reading WebP…");
    clearFrames();

    try {
      const converted = await convertWebpToJpgFrames(sourceFile, {
        quality,
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Converting frame ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) {
        revokeConvertedFrames(converted);
        return;
      }

      setFrames(converted);
      setSelectedFrame(converted[0]?.frameNumber ?? 1);
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
          : "Could not convert this WebP. Try a smaller file or another browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  async function handleDownloadZip() {
    if (!sourceFile || !hasFrames) return;
    setZipping(true);
    setError("");
    try {
      await downloadAllFramesZip(frames, fileBaseName(sourceFile));
    } catch {
      setError(
        "Could not create the ZIP download. Try downloading frames one by one.",
      );
    } finally {
      setZipping(false);
    }
  }

  return (
    <>
      <ImageEditorShell
        className="pdf-to-jpg"
        hasSource={hasSource}
        stageReady={hasFrames}
        loading={loading}
        loadingText={progressText || "Converting WebP…"}
        loadingSubtext="Frames are decoded locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasFrames && activeFrame
            ? `Frame ${activeFrame.frameNumber} of ${frames.length} · ${activeFrame.width}×${activeFrame.height}px`
            : hasSource
              ? sourceFile?.name
              : "Upload a WebP to start"
        }
        previewHint={
          hasSource && !hasFrames ? "Click Convert to JPG" : undefined
        }
        privacyHint={
          hasFrames
            ? "Processed locally on your device"
            : "Animated WebP frames convert in your browser · files never upload to Focera"
        }
        sidebar={
          <>
            <WebpToJpgDropzone
              onFile={handleFile}
              onError={setError}
              disabled={loading}
            />

            {hasSource ? (
              <div className="upload-meta">
                <p className="upload-meta__name">{sourceFile?.name}</p>
                <p className="upload-meta__size">
                  {sourceFile ? formatFileSize(sourceFile.size) : ""}
                </p>
              </div>
            ) : null}

            <div className="pdf-to-jpg__options">
              <div className="ui-field">
                <span className="ui-label" id={qualityId}>
                  JPEG quality
                </span>
                <div
                  className="pdf-to-jpg__chips"
                  role="radiogroup"
                  aria-labelledby={qualityId}
                >
                  {QUALITY_OPTIONS.map((option) => {
                    const selected = quality === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "pdf-to-jpg__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => setQuality(option.value)}
                      >
                        <span className="pdf-to-jpg__chip-label">
                          {option.label}
                        </span>
                        <span className="pdf-to-jpg__chip-hint">
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
                {loading ? "Converting…" : "Convert to JPG"}
              </Button>
              {hasFrames ? (
                <Button
                  onClick={openDownload}
                  disabled={!activeFrame || formatDownloading || loading}
                >
                  Download
                </Button>
              ) : null}
              {hasFrames && frames.length > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => void handleDownloadZip()}
                  disabled={zipping || loading}
                >
                  {zipping ? "Preparing ZIP…" : "Download all as ZIP"}
                </Button>
              ) : null}
              <Button
                variant="ghost"
                onClick={handleReset}
                disabled={(!hasSource && !hasFrames) || loading}
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
        {hasFrames && activeFrame ? (
          <>
            <div className="image-editor-shell__result preview-single">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeFrame.url}
                alt={`Converted frame ${activeFrame.frameNumber}`}
                className="preview-single__image pdf-to-jpg__preview-image"
              />
              <p className="image-editor-shell__result-meta tool-placeholder preview-single__hint">
                Frame {activeFrame.frameNumber} of {frames.length} ·{" "}
                {activeFrame.width}×{activeFrame.height}px ·{" "}
                {formatFileSize(activeFrame.blob.size)}
              </p>
            </div>
            {frames.length > 1 ? (
              <div
                className="pdf-to-jpg__thumbs"
                role="list"
                aria-label="Converted frames"
              >
                {frames.map((frame) => {
                  const selected =
                    frame.frameNumber === activeFrame.frameNumber;
                  return (
                    <button
                      key={frame.frameNumber}
                      type="button"
                      role="listitem"
                      className={cn(
                        "pdf-to-jpg__thumb",
                        selected && "is-active",
                      )}
                      onClick={() => setSelectedFrame(frame.frameNumber)}
                      aria-pressed={selected}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={frame.url}
                        alt=""
                        className="pdf-to-jpg__thumb-image"
                      />
                      <span className="pdf-to-jpg__thumb-label">
                        Frame {frame.frameNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : hasSource ? (
          <p className="tool-placeholder">
            Upload a WebP and convert it to preview JPG frames here
          </p>
        ) : null}
      </ImageEditorShell>

      <ImageFormatDownloadDialog
        open={formatOpen}
        onOpenChange={setFormatOpen}
        onSelect={handleFormat}
        downloading={formatDownloading}
        error={downloadError}
      />
    </>
  );
}
