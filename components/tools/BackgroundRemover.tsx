"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import BackgroundExportOptions, {
  type ExportMode,
} from "@/components/tools/BackgroundExportOptions";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { removeImageBackground } from "@/lib/background-removal";
import { compositeOnColor, compositeOnImage, compositeWithBlur, BLUR_RADIUS } from "@/lib/composite-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
} from "@/lib/image";

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
  const [progressText, setProgressText] = useState("");

  const compositeUrlRef = useRef("");
  const debouncedBgColor = useDebouncedValue(bgColor, 180);
  const debouncedBlurRadius = useDebouncedValue(blurRadius, 120);

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = Boolean(resultBlob && resultUrl);
  const canProcess = hasSource && !loading;
  const canDownloadComposite =
    exportMode === "color" ||
    exportMode === "blur" ||
    (exportMode === "image" && Boolean(bgImageFile && compositeBlob));

  const handleBgColorChange = useCallback((color: string) => {
    const normalized = color.toLowerCase();
    setBgColor((current) => (current === normalized ? current : normalized));
  }, []);

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
  }

  async function removeBackground() {
    if (!sourceFile) {
      setError("Upload an image to get started.");
      return;
    }

    setLoading(true);
    setError("");
    setProgressText("Preparing AI model…");
    resetResult();

    try {
      const blob = await removeImageBackground(sourceFile, {
        onProgress: ({ key, current, total }) => {
          if (total > 0) {
            const percent = Math.round((current / total) * 100);
            setProgressText(`Loading ${key}… ${percent}%`);
            return;
          }
          setProgressText(`Processing ${key}…`);
        },
      });

      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
      setProgressText("");
      trackSuccess();
    } catch {
      trackFailure();
      setError(
        "Could not remove the background. Try a smaller image or a different browser.",
      );
      setProgressText("");
    } finally {
      setLoading(false);
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
  }, [resultBlob, hasResult, exportMode, debouncedBgColor, debouncedBlurRadius, bgImageFile, sourceFile]);

  function handleDownload() {
    if (!sourceFile) return;

    const baseName = fileBaseName(sourceFile);

    if (exportMode === "transparent") {
      if (!resultBlob) return;
      downloadBlob(resultBlob, `${baseName}-no-bg.png`);
      return;
    }

    if (!compositeBlob) return;

    const suffix =
      exportMode === "color"
        ? "bg-color"
        : exportMode === "blur"
          ? "blur-bg"
          : "with-bg";
    downloadBlob(compositeBlob, `${baseName}-${suffix}.png`);
  }

  function handleReset() {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    resetResult();
    setSourceFile(null);
    setOriginalUrl("");
    setError("");
    setProgressText("");
  }

  const previewHint =
    exportMode === "transparent"
      ? "Drag the slider to compare the original and transparent PNG."
      : exportMode === "color"
        ? "Preview with your selected background color."
        : exportMode === "blur"
          ? "Preview with portrait-style background blur."
          : "Preview with your uploaded background image.";

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
          <Button onClick={() => void removeBackground()} disabled={!canProcess}>
            {loading ? "Removing…" : "Remove background"}
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
            onDownload={handleDownload}
            downloadDisabled={
              compositing ||
              (exportMode === "transparent" ? !resultBlob : !canDownloadComposite)
            }
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
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Removing background…"}
              </span>
              <span className="tool-loading__subtext">
                First run downloads the AI model — this may take a moment.
              </span>
            </div>
          ) : hasResult && exportMode === "transparent" && originalUrl ? (
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              hint={previewHint}
            />
          ) : hasResult && compositeUrl ? (
            <div className="preview-single">
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
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              hint={previewHint}
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
                Click Remove background to process this image.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload an image to preview and remove its background
            </p>
          )}
        </div>
        <p className="tool-hint">
          {hasResult
            ? "Export as transparent PNG, blurred background, solid color, or custom photo · processed locally"
            : "Transparent PNG output · processed locally in your browser · no upload to our servers"}
        </p>
      </div>
    </div>
  );
}
