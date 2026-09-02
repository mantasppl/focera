"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import EnhancingPreview from "@/components/tools/EnhancingPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import ImageSourceBar from "@/components/tools/ImageSourceBar";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  createUnblurPreviewUrl,
  unblurImageFile,
  type UnblurImageResult,
} from "@/lib/unblur-image";
import {
  UNBLUR_FIRST_RUN_HINT,
  hasPreparedUnblurModel,
  preloadUnblurModel,
} from "@/lib/unblur-ai";
import { useToolAnalytics } from "@/lib/analytics/client";

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
      sourceFile ? `${fileBaseName(sourceFile)}-unblurred` : null,
  });

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    void preloadUnblurModel();
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
    const loadingUrl = URL.createObjectURL(file);
    setOriginalUrl(loadingUrl);
    setFormatOpen(false);
    void runUnblur(file, loadingUrl);
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
  }

  async function runUnblur(file: File, loadingUrl: string) {
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

      const beforePreview = await createUnblurPreviewUrl(file);
      if (controller.signal.aborted) {
        URL.revokeObjectURL(beforePreview);
        return;
      }

      const afterUrl = URL.createObjectURL(unblurred.blob);
      if (controller.signal.aborted) {
        URL.revokeObjectURL(beforePreview);
        URL.revokeObjectURL(afterUrl);
        return;
      }

      URL.revokeObjectURL(loadingUrl);
      setOriginalUrl(beforePreview);
      setResult(unblurred);
      setResultUrl(afterUrl);
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

  return (
    <>
      <ImageEditorShell
        className="unblur-image"
        hasSource={hasSource}
        stageReady={hasResult || loading}
        loading={loading && !originalUrl}
        loadingText={progressText || "Unblurring image…"}
        previewTitle="Preview"
        previewMeta={
          hasResult
            ? `${result!.width}×${result!.height} · ${result!.engine === "ai" ? "AI unblur" : "Sharpen"}`
            : hasSource
              ? sourceFile?.name
              : "Upload a blurry image to start"
        }
        privacyHint={
          loading
            ? progressText || "Unblurring your photo…"
            : hasResult
              ? result?.engine === "sharpen"
                ? "AI model unavailable — used a local sharpen pass · processed locally"
                : "Processed locally on your device"
              : hasPreparedUnblurModel()
                ? "AI unblur in your browser · files never upload to Focera"
                : UNBLUR_FIRST_RUN_HINT
        }
        sidebar={
          <>
            {!hasSource ? (
              <ImageDropzone onFile={handleFile} onError={setError} />
            ) : (
              <ImageSourceBar
                file={sourceFile!}
                disabled={loading}
                onReplace={handleFile}
              />
            )}
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              {hasResult ? (
                <Button onClick={openDownload} disabled={loading}>
                  Download
                </Button>
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
          </>
        }
      >
        {loading && originalUrl ? (
          <EnhancingPreview
            key={originalUrl}
            src={originalUrl}
            alt="Uploaded photo being unblurred"
            label="Unblurring photo"
            reportedProgress={unblurHudProgress(progressText)}
          />
        ) : hasResult && originalUrl && resultUrl ? (
          <div className="image-editor-shell__result unblur-image__result">
            <p className="image-editor-shell__result-meta unblur-image__result-meta">
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
