"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import WebpToPngDropzone from "@/components/tools/WebpToPngDropzone";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  convertWebpToPngFrames,
  downloadAllFramesZip,
  downloadFramePng,
  revokeConvertedFrames,
  type ConvertedFrame,
} from "@/lib/webp-to-png";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function WebpToPng() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const abortRef = useRef<AbortController | null>(null);
  const framesRef = useRef<ConvertedFrame[]>([]);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [frames, setFrames] = useState<ConvertedFrame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState(1);
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
      const converted = await convertWebpToPngFrames(sourceFile, {
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

  function handleDownloadFrame() {
    if (!sourceFile || !activeFrame) return;
    downloadFramePng(activeFrame, fileBaseName(sourceFile));
  }

  async function handleDownloadAll() {
    if (!sourceFile || !hasFrames) return;
    setZipping(true);
    setError("");
    try {
      if (frames.length === 1) {
        downloadFramePng(frames[0], fileBaseName(sourceFile));
      } else {
        await downloadAllFramesZip(frames, fileBaseName(sourceFile));
      }
    } catch {
      setError(
        "Could not create the ZIP download. Try downloading frames one by one.",
      );
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="tool-grid pdf-to-jpg">
      <div className="tool-panel">
        <WebpToPngDropzone
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

        <div className="tool-actions">
          <Button onClick={() => void handleConvert()} disabled={!hasSource || loading}>
            {loading ? "Converting…" : "Convert to PNG"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!hasSource && !hasFrames) || loading}
          >
            Start over
          </Button>
        </div>

        {hasFrames ? (
          <div className="tool-actions">
            <Button onClick={handleDownloadFrame} disabled={!activeFrame || zipping}>
              Download frame
            </Button>
            <Button
              variant="ghost"
              onClick={() => void handleDownloadAll()}
              disabled={zipping}
            >
              {zipping
                ? "Preparing ZIP…"
                : frames.length === 1
                  ? "Download PNG"
                  : "Download all (ZIP)"}
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
          className={`tool-stage${hasFrames ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Converting WebP…"}
              </span>
              <span className="tool-loading__subtext">
                Frames are decoded locally in your browser.
              </span>
            </div>
          ) : activeFrame ? (
            <div className="preview-single">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeFrame.url}
                alt={`Converted frame ${activeFrame.frameNumber}`}
                className="preview-single__image pdf-to-jpg__preview-image"
              />
              <p className="tool-placeholder preview-single__hint">
                Frame {activeFrame.frameNumber} of {frames.length} ·{" "}
                {activeFrame.width}×{activeFrame.height}px ·{" "}
                {formatFileSize(activeFrame.blob.size)}
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a WebP and convert it to preview PNG frames here
            </p>
          )}
        </div>

        {hasFrames ? (
          <div className="pdf-to-jpg__thumbs" role="list" aria-label="Converted frames">
            {frames.map((frame) => {
              const selected = frame.frameNumber === activeFrame?.frameNumber;
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

        <p className="tool-hint">
          {hasFrames
            ? frames.length === 1
              ? "Download the PNG · transparency preserved · processed locally"
              : "Download one frame or a ZIP of every PNG · transparency preserved · processed locally"
            : "Animated WebP frames convert in your browser · transparency kept · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
