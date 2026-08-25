"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import EnhancingPreview from "@/components/tools/EnhancingPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import TransparentCutoutOptions from "@/components/tools/TransparentCutoutOptions";
import {
  BACKGROUND_FIRST_RUN_HINT,
  hasPreparedBackgroundModel,
  preloadBackgroundRemoval,
  removeImageBackground,
} from "@/lib/background-removal";
import { useToolAnalytics } from "@/lib/analytics/client";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
} from "@/lib/image";
import {
  applyTransparentCutoutOptions,
  cutoutExtension,
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

  function handleDownload() {
    if (!sourceFile || !downloadBlobReady) return;
    const ext = cutoutExtension(format, downloadBlobReady.type);
    downloadBlob(
      downloadBlobReady,
      `${fileBaseName(sourceFile)}-transparent.${ext}`,
    );
  }

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

  return (
    <div className="tool-grid">
      <div className="tool-panel">
        <ImageDropzone
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
          <Button onClick={() => void makeTransparent()} disabled={!canProcess}>
            Make background transparent
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!hasSource && !hasResult) || loading}
          >
            Start over
          </Button>
        </div>

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
            onDownload={handleDownload}
            downloadDisabled={compositing || !downloadBlobReady}
            compositing={compositing}
            disabled={loading}
          />
        ) : null}

        {error ? (
          <p className="tool-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="tool-panel tool-panel--preview">
        <div
          className={`tool-stage${hasResult ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading && originalUrl ? (
            <EnhancingPreview src={originalUrl} />
          ) : hasResult && visualOptions && exportUrl ? (
            <div className="preview-checker">
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
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              hint="Drag the slider to compare the original and transparent cutout."
            />
          ) : hasSource && originalUrl ? (
            <div className="preview-single">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Uploaded preview"
                className="preview-single__image"
              />
              <p className="tool-placeholder preview-single__hint">
                Upload another image to make a new transparent cutout.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload an image to preview and make its background transparent
            </p>
          )}
        </div>
        <p className="tool-hint">
          {loading && showFirstRunHint
            ? BACKGROUND_FIRST_RUN_HINT
            : hasResult
              ? "Crop, padding, shadow, and sticker outline stay transparent · processed locally"
              : "Transparent PNG or WebP · processed locally in your browser · no upload to our servers"}
        </p>
      </div>
    </div>
  );
}
