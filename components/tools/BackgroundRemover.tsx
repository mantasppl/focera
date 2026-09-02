"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import BackgroundExportOptions, {
  type ExportMode,
} from "@/components/tools/BackgroundExportOptions";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import EnhancingPreview from "@/components/tools/EnhancingPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import ImageSourceBar from "@/components/tools/ImageSourceBar";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import {
  BACKGROUND_FIRST_RUN_HINT,
  hasPreparedBackgroundModel,
  preloadBackgroundRemoval,
  removeImageBackground,
} from "@/lib/background-removal";
import {
  BLUR_RADIUS,
  compositeOnColor,
  compositeOnImage,
  compositeWithBlur,
} from "@/lib/composite-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { fileBaseName, formatFileSize } from "@/lib/image";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

export default function BackgroundRemover() {
  const { trackSuccess, trackFailure } = useToolAnalytics();

  useEffect(() => {
    void preloadBackgroundRemoval();
  }, []);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [exportMode, setExportMode] = useState<ExportMode>("transparent");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [blurRadius, setBlurRadius] = useState<number>(BLUR_RADIUS.default);
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [compositeBlob, setCompositeBlob] = useState<Blob | null>(null);
  const [compositeUrl, setCompositeUrl] = useState("");
  const [compositing, setCompositing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFirstRunHint, setShowFirstRunHint] = useState(false);

  const compositeUrlRef = useRef("");
  const processIdRef = useRef(0);
  const debouncedBgColor = useDebouncedValue(bgColor, 180);
  const debouncedBlurRadius = useDebouncedValue(blurRadius, 120);

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = Boolean(resultBlob && resultUrl);
  const canProcess = hasSource && !loading;
  const canDownloadComposite =
    exportMode === "color" ||
    exportMode === "blur" ||
    (exportMode === "image" && Boolean(bgImageFile && compositeBlob));
  const canDownload =
    exportMode === "transparent" ? Boolean(resultBlob) : canDownloadComposite;

  const handleBgColorChange = useCallback((color: string) => {
    const normalized = color.toLowerCase();
    setBgColor((current) => (current === normalized ? current : normalized));
  }, []);

  const {
    formatOpen,
    setFormatOpen,
    downloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => {
      if (!sourceFile) return null;
      if (exportMode === "transparent") return resultBlob;
      return compositeBlob;
    },
    getFilename: () => {
      if (!sourceFile) return null;
      const baseName = fileBaseName(sourceFile);
      if (exportMode === "transparent") return `${baseName}-no-bg`;
      const suffix =
        exportMode === "color"
          ? "bg-color"
          : exportMode === "blur"
            ? "blur-bg"
            : "with-bg";
      return `${baseName}-${suffix}`;
    },
  });

  useEffect(() => {
    compositeUrlRef.current = compositeUrl;
  }, [compositeUrl]);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      if (compositeUrlRef.current) URL.revokeObjectURL(compositeUrlRef.current);
    };
  }, [originalUrl, resultUrl]);

  function clearCompositeState() {
    setCompositeBlob((current) => (current ? null : current));
    setCompositeUrl((previous) => {
      if (!previous) return previous;
      URL.revokeObjectURL(previous);
      return "";
    });
    setCompositing((current) => (current ? false : current));
  }

  function resetExportOptions() {
    setExportMode("transparent");
    setBgColor("#ffffff");
    setBlurRadius(BLUR_RADIUS.default);
    setBgImageFile(null);
    clearCompositeState();
  }

  function resetResult() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultBlob(null);
    setResultUrl("");
    resetExportOptions();
  }

  function handleFile(file: File) {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    resetResult();
    setError("");
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    void removeBackground(file);
  }

  async function removeBackground(file?: File | null) {
    const source = file ?? sourceFile;
    if (!source) {
      setError("Upload an image to get started.");
      return;
    }

    const processId = ++processIdRef.current;
    setShowFirstRunHint(!hasPreparedBackgroundModel());
    setLoading(true);
    setError("");
    resetResult();

    try {
      const blob = await removeImageBackground(source);
      if (processId !== processIdRef.current) return;

      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
      trackSuccess();
    } catch (err) {
      if (processId !== processIdRef.current) return;
      trackFailure();
      console.error("[background-remover]", err);
      setError(
        "Could not remove the background. Try a smaller image or a different browser.",
      );
    } finally {
      if (processId === processIdRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    if (!resultBlob || !hasResult || exportMode === "transparent") {
      clearCompositeState();
      return;
    }

    if (exportMode === "image" && !bgImageFile) {
      clearCompositeState();
      return;
    }

    if (exportMode === "blur" && !sourceFile) {
      clearCompositeState();
      return;
    }

    let cancelled = false;

    async function buildComposite() {
      setCompositing(true);

      try {
        let blob: Blob;

        if (exportMode === "color") {
          blob = await compositeOnColor(resultBlob!, debouncedBgColor);
        } else if (exportMode === "blur") {
          blob = await compositeWithBlur(
            sourceFile!,
            resultBlob!,
            debouncedBlurRadius,
          );
        } else {
          blob = await compositeOnImage(resultBlob!, bgImageFile!);
        }

        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        setCompositeBlob(blob);
        setCompositeUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return url;
        });
      } catch {
        if (!cancelled) {
          trackFailure();
          setError("Could not apply the selected background. Try another option.");
        }
      } finally {
        if (!cancelled) setCompositing(false);
      }
    }

    void buildComposite();

    return () => {
      cancelled = true;
    };
  }, [
    resultBlob,
    hasResult,
    exportMode,
    debouncedBgColor,
    debouncedBlurRadius,
    bgImageFile,
    sourceFile,
    trackFailure,
  ]);

  function handleReset() {
    processIdRef.current += 1;
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    resetResult();
    setSourceFile(null);
    setOriginalUrl("");
    setError("");
    setLoading(false);
    setShowFirstRunHint(false);
  }

  const previewHint =
    exportMode === "transparent"
      ? "Drag the slider to compare the original and transparent PNG."
      : exportMode === "color"
        ? "Preview with your selected background color."
        : exportMode === "blur"
          ? "Preview with portrait-style background blur."
          : "Preview with your uploaded background image.";

  const previewMeta = hasResult
    ? exportMode === "transparent" && resultBlob
      ? `Transparent cutout · ${formatFileSize(resultBlob.size)}`
      : compositeBlob
        ? `Export preview · ${formatFileSize(compositeBlob.size)}`
        : compositing
          ? "Applying background…"
          : "Background removed"
    : hasSource
      ? sourceFile!.name
      : "Upload an image to start";

  return (
    <>
      <ImageEditorShell
        className="background-remover"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={false}
        previewTitle="Preview"
        previewMeta={previewMeta}
        previewHint={
          hasSource && !hasResult && !loading
            ? "Click Remove background to start"
            : undefined
        }
        privacyHint={
          loading && showFirstRunHint
            ? BACKGROUND_FIRST_RUN_HINT
            : hasResult
              ? "Processed locally on your device"
              : "AI background removal in your browser · files never upload to Focera"
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

            {hasResult ? (
              <BackgroundExportOptions
                mode={exportMode}
                onModeChange={setExportMode}
                bgColor={bgColor}
                onBgColorChange={handleBgColorChange}
                blurRadius={blurRadius}
                onBlurRadiusChange={setBlurRadius}
                bgImageName={bgImageFile?.name}
                onBgImageSelect={setBgImageFile}
                onBgImageError={setError}
                disabled={loading}
              />
            ) : null}
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button
                onClick={() => void removeBackground()}
                disabled={!canProcess}
              >
                {loading ? "Removing…" : "Remove background"}
              </Button>
              {hasResult ? (
                <Button
                  onClick={openDownload}
                  disabled={loading || compositing || !canDownload}
                >
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
        {loading && originalUrl ? (
          <EnhancingPreview src={originalUrl} />
        ) : hasResult && exportMode === "transparent" && originalUrl ? (
          <div className="image-editor-shell__result background-remover__result">
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              beforeAlt="Original image"
              afterAlt="Background removed"
              hint={previewHint}
            />
          </div>
        ) : hasResult && compositeUrl ? (
          <div className="image-editor-shell__preview-content preview-single">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={compositeUrl}
              alt="Export preview"
              className="preview-single__image"
            />
          </div>
        ) : hasResult && exportMode === "image" && !bgImageFile ? (
          <p className="tool-placeholder">
            Choose a background image to preview the composite export.
          </p>
        ) : hasResult && compositing ? (
          <div className="tool-loading" role="status" aria-live="polite">
            <span className="tool-loading__spinner" aria-hidden="true" />
            <span className="tool-loading__text">Applying background…</span>
          </div>
        ) : hasResult && originalUrl ? (
          <div className="image-editor-shell__result background-remover__result">
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              beforeAlt="Original image"
              afterAlt="Background removed"
              hint={previewHint}
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
