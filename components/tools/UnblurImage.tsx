"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import EnhancingPreview from "@/components/tools/EnhancingPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { useMobilePreviewReveal } from "@/components/tools/useMobilePreviewReveal";
import { formatFileSize } from "@/lib/image";
import {
  UNBLUR_DOWNLOAD_FORMATS,
  downloadUnblurredImage,
  unblurImageFile,
  type UnblurDownloadFormat,
  type UnblurImageResult,
} from "@/lib/unblur-image";
import {
  UNBLUR_FIRST_RUN_HINT,
  hasPreparedUnblurModel,
} from "@/lib/unblur-ai";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

function FormatIcon({ format }: { format: UnblurDownloadFormat }) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (format === "jpg") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2.5" {...stroke} />
        <circle cx="8.5" cy="10" r="1.45" {...stroke} />
        <path d="M5.5 16.5 9 13l2.5 2.5L14.5 12l4.5 4.5" {...stroke} />
      </svg>
    );
  }

  if (format === "png") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2.5" {...stroke} />
        <path
          d="M3 12h6v7H5.5A2.5 2.5 0 0 1 3 16.5V12Zm6-7h6v7H9V5Zm6 7h6v5.5A2.5 2.5 0 0 1 18.5 20H15v-8Z"
          fill="currentColor"
          opacity="0.18"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M12 3.5 13.35 8.1 18 9.5 13.35 10.9 12 15.5 10.65 10.9 6 9.5l4.65-1.4L12 3.5Z"
        {...stroke}
      />
      <path
        d="M18.6 15.2 19.15 17 21 17.55 19.15 18.1 18.6 19.9 18.05 18.1 16.2 17.55 18.05 17Z"
        {...stroke}
      />
    </svg>
  );
}

function unblurHudProgress(text: string): number {
  const value = text.toLowerCase();
  if (value.includes("export")) return 90;
  if (value.includes("applying")) return 84;
  if (value.includes("enhancing")) {
    const parts = text.match(/(\d+)\s*\/\s*(\d+)/);
    if (parts) {
      const current = Number(parts[1]);
      const total = Number(parts[2]);
      if (total > 0) return Math.min(82, 40 + Math.round((current / total) * 40));
    }
    return 48;
  }
  if (value.includes("preparing ai") || value.includes("loading ai")) return 34;
  if (value.includes("download")) {
    const percent = Number(text.replace(/[^\d]/g, ""));
    if (Number.isFinite(percent) && percent > 0) {
      return Math.min(32, 8 + Math.round(percent * 0.24));
    }
    return 12;
  }
  if (value.includes("sharpen") || value.includes("unavailable")) return 42;
  if (value.includes("refin")) return 72;
  if (value.includes("prepar")) return 18;
  if (value.includes("load")) return 8;
  return 6;
}

export default function UnblurImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<UnblurImageResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [formatOpen, setFormatOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const formatDialogRef = useRef<HTMLDialogElement>(null);

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = Boolean(result && resultUrl);
  const showPreviewFirst = loading || hasResult || hasSource;
  const previewRef = useMobilePreviewReveal(loading);

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

  useEffect(() => {
    const node = formatDialogRef.current;
    if (!node) return;
    if (formatOpen) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [formatOpen]);

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
    setFormatOpen(false);
    void runUnblur(file);
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
    setFormatOpen(false);
    setDownloading(false);
  }

  async function runUnblur(file: File) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Preparing…");
    clearResult();

    try {
      const unblurred = await unblurImageFile(file, {
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(unblurred.blob);
      setResult(unblurred);
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
          : "Could not unblur this image. Try a smaller file or another browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleDownload() {
    if (!sourceFile || !result) return;
    setFormatOpen(true);
  }

  async function handleFormat(format: UnblurDownloadFormat) {
    if (!sourceFile || !result || downloading) return;
    setDownloading(true);
    setError("");
    try {
      await downloadUnblurredImage(result.blob, sourceFile, format);
      setFormatOpen(false);
    } catch {
      setError("Could not export this format. Try PNG instead.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
    <div className={cn("tool-grid unblur-image", showPreviewFirst && "is-preview-first")}>
      <div className="tool-panel">
        <ImageDropzone
          onFile={handleFile}
          onError={setError}
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
          {hasResult ? (
            <Button onClick={handleDownload}>Download</Button>
          ) : null}
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={!hasSource && !hasResult}
          >
            Start over
          </Button>
        </div>

        {error ? (
          <p className="tool-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="tool-panel tool-panel--preview" ref={previewRef}>
        <div
          className={`tool-stage${hasResult ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading && originalUrl ? (
            <EnhancingPreview
              key={originalUrl}
              src={originalUrl}
              alt="Uploaded photo being unblurred"
              label="Unblurring photo"
              reportedProgress={unblurHudProgress(progressText)}
            />
          ) : loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Unblurring image…"}
              </span>
            </div>
          ) : hasResult && originalUrl && resultUrl ? (
            <div className="unblur-image__result">
              <p className="unblur-image__result-meta">
                {result!.width}×{result!.height}
                {result!.engine === "ai" ? " · AI unblur" : " · unblur"}
                {" · "}
                {formatFileSize(result!.blob.size)}
              </p>
              <BeforeAfterPreview
                beforeSrc={originalUrl}
                afterSrc={resultUrl}
                beforeAlt="Original blurry image"
                afterAlt="Unblurred image"
                hint="Drag the slider to compare the original and unblurred image."
              />
            </div>
          ) : hasSource && originalUrl ? (
            <div className="preview-single">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Uploaded preview"
                className="preview-single__image"
              />
              <p className="tool-placeholder preview-single__hint">
                Upload another image to unblur a new file.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a blurry image to unblur it here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {loading
            ? progressText || "Unblurring your photo…"
            : hasResult
              ? result?.engine === "sharpen"
                ? "AI model unavailable — used a local sharpen pass · processed locally"
                : "Download when you are ready · AI ran locally in your browser"
              : hasPreparedUnblurModel()
                ? "AI unblur in your browser · files never upload to Focera"
                : UNBLUR_FIRST_RUN_HINT}
        </p>
      </div>
    </div>

    <dialog
      ref={formatDialogRef}
      className="unblur-download"
      aria-labelledby="unblur-download-title"
      aria-busy={downloading}
      onClose={() => {
        setFormatOpen(false);
        setDownloading(false);
      }}
      onClick={(event) => {
        if (event.target === formatDialogRef.current) {
          setFormatOpen(false);
        }
      }}
    >
      <h2 id="unblur-download-title" className="unblur-download__title">
        Select Download Format
      </h2>
      <div className="unblur-download__options">
        {UNBLUR_DOWNLOAD_FORMATS.map((option) => (
          <button
            key={option.value}
            type="button"
            className="unblur-download__option"
            disabled={downloading}
            onClick={() => void handleFormat(option.value)}
          >
            <span className="unblur-download__option-icon" aria-hidden="true">
              <FormatIcon format={option.value} />
            </span>
            <span className="unblur-download__option-copy">
              <span className="unblur-download__option-label">
                {option.label}
              </span>
              <span className="unblur-download__option-hint">
                {option.hint}
              </span>
            </span>
          </button>
        ))}
      </div>
      {error && formatOpen ? (
        <p className="tool-error unblur-download__error" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        variant="ghost"
        className="unblur-download__cancel"
        onClick={() => setFormatOpen(false)}
        disabled={downloading}
      >
        Cancel
      </Button>
    </dialog>
    </>
  );
}
