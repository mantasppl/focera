"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import EnhancingPreview from "@/components/tools/EnhancingPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import ImageSourceBar from "@/components/tools/ImageSourceBar";
import TransparentCutoutOptions from "@/components/tools/TransparentCutoutOptions";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import {
  BACKGROUND_FIRST_RUN_HINT,
  hasPreparedBackgroundModel,
  preloadBackgroundRemoval,
  removeImageBackground,
} from "@/lib/background-removal";
import { useToolAnalytics } from "@/lib/analytics/client";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  applyTransparentCutoutOptions,
  hasVisualCutoutOptions,
  type CutoutFormat,
  type CutoutOutline,
  type CutoutShadow,
} from "@/lib/transparent-cutout";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

export default function MakeBackgroundTransparent() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const [exportUrl, setExportUrl] = useState("");
  const [crop, setCrop] = useState(false);
  const [padding, setPadding] = useState(0);
  const [shadow, setShadow] = useState<CutoutShadow>("none");
  const [outline, setOutline] = useState<CutoutOutline>("none");
  const [outlineColor, setOutlineColor] = useState("#ffffff");
  const [format, setFormat] = useState<CutoutFormat>("png");
  const [compositing, setCompositing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFirstRunHint, setShowFirstRunHint] = useState(false);

  const resultUrlRef = useRef("");
  const exportUrlRef = useRef("");
  const processIdRef = useRef(0);
  const debouncedOutlineColor = useDebouncedValue(outlineColor, 180);

  useEffect(() => {
    void preloadBackgroundRemoval();
  }, []);

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = Boolean(resultBlob && resultUrl);
  const canProcess = hasSource && !loading;
  const visualOptions = hasVisualCutoutOptions({
    crop,
    padding,
    shadow,
    outline,
    outlineColor: debouncedOutlineColor,
    format,
  });
  const needsExportPass = visualOptions || format === "webp";
  const downloadBlobReady = needsExportPass ? exportBlob : resultBlob;

  const {
    formatOpen,
    setFormatOpen,
    downloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => downloadBlobReady,
    getFilename: () =>
      sourceFile ? `${fileBaseName(sourceFile)}-transparent` : null,
  });

  useEffect(() => {
    resultUrlRef.current = resultUrl;
  }, [resultUrl]);

  useEffect(() => {
    exportUrlRef.current = exportUrl;
  }, [exportUrl]);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      if (exportUrlRef.current) URL.revokeObjectURL(exportUrlRef.current);
    };
  }, [originalUrl]);

  function clearExportState() {
    setExportBlob(null);
    setExportUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return "";
    });
    setCompositing(false);
  }

  function resetCutoutOptions() {
    setCrop(false);
    setPadding(0);
    setShadow("none");
    setOutline("none");
    setOutlineColor("#ffffff");
    setFormat("png");
    clearExportState();
  }

  function resetResult() {
    setResultBlob(null);
    setResultUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return "";
    });
    resetCutoutOptions();
  }

  function handleFile(file: File) {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    resetResult();
    setError("");
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    void makeTransparent(file);
  }

  async function makeTransparent(file?: File | null) {
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
      console.error("[make-background-transparent]", err);
      setError(
        "Could not make the background transparent. Try a smaller image or a different browser.",
      );
    } finally {
      if (processId === processIdRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    if (!resultBlob || !hasResult || !needsExportPass) {
      clearExportState();
      return;
    }

    let cancelled = false;

    async function buildExport() {
      setCompositing(true);

      try {
        const blob = await applyTransparentCutoutOptions(resultBlob!, {
          crop,
          padding,
          shadow,
          outline,
          outlineColor: debouncedOutlineColor,
          format,
        });

        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        setExportBlob(blob);
        setExportUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return url;
        });
      } catch {
        if (!cancelled) {
          setError("Could not apply cutout options. Try another setting.");
        }
      } finally {
        if (!cancelled) setCompositing(false);
      }
    }

    void buildExport();

    return () => {
      cancelled = true;
    };
  }, [
    resultBlob,
    hasResult,
    needsExportPass,
    crop,
    padding,
    shadow,
    outline,
    debouncedOutlineColor,
    format,
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

  const previewSrc = visualOptions && exportUrl ? exportUrl : resultUrl;

  const previewMeta = hasResult
    ? downloadBlobReady
      ? `Transparent cutout · ${formatFileSize(downloadBlobReady.size)}`
      : compositing
        ? "Applying cutout options…"
        : "Background removed"
    : hasSource
      ? sourceFile!.name
      : "Upload an image to start";

  return (
    <>
      <ImageEditorShell
        className="make-background-transparent"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={false}
        previewTitle="Preview"
        previewMeta={previewMeta}
        previewHint={
          hasSource && !hasResult && !loading
            ? "Click Make background transparent to start"
            : undefined
        }
        privacyHint={
          loading && showFirstRunHint
            ? BACKGROUND_FIRST_RUN_HINT
            : hasResult
              ? "Processed locally on your device"
              : "Transparent cutout in your browser · files never upload to Focera"
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
              <TransparentCutoutOptions
                crop={crop}
                onCropChange={setCrop}
                padding={padding}
                onPaddingChange={setPadding}
                shadow={shadow}
                onShadowChange={setShadow}
                outline={outline}
                onOutlineChange={setOutline}
                outlineColor={outlineColor}
                onOutlineColorChange={setOutlineColor}
                format={format}
                onFormatChange={setFormat}
                disabled={loading}
              />
            ) : null}
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button
                onClick={() => void makeTransparent()}
                disabled={!canProcess}
              >
                {loading ? "Processing…" : "Make background transparent"}
              </Button>
              {hasResult ? (
                <Button
                  onClick={openDownload}
                  disabled={loading || compositing || !downloadBlobReady}
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
        ) : hasResult && visualOptions && exportUrl ? (
          <div className="image-editor-shell__preview-content preview-checker">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="Transparent cutout preview"
              className="preview-checker__image"
            />
          </div>
        ) : hasResult && visualOptions ? (
          <div className="tool-loading" role="status" aria-live="polite">
            <span className="tool-loading__spinner" aria-hidden="true" />
            <span className="tool-loading__text">Applying cutout options…</span>
          </div>
        ) : hasResult && originalUrl ? (
          <div className="image-editor-shell__result make-background-transparent__result">
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              beforeAlt="Original image"
              afterAlt="Transparent cutout"
              hint="Drag the slider to compare the original and transparent cutout."
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
