"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import ChangeBackgroundOptions, {
  type BackgroundMode,
} from "@/components/tools/ChangeBackgroundOptions";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import EnhancingPreview from "@/components/tools/EnhancingPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { useMobilePreviewReveal } from "@/components/tools/useMobilePreviewReveal";
import { removeImageBackground, preloadBackgroundRemoval, BACKGROUND_FIRST_RUN_HINT, hasPreparedBackgroundModel } from "@/lib/background-removal";
import {
  compositeOnColor,
  compositeOnImage,
  compositeWithBlur,
  BLUR_RADIUS,
} from "@/lib/composite-image";
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

export default function ChangeBackground() {
  const { trackSuccess, trackFailure } = useToolAnalytics();

  useEffect(() => {
    void preloadBackgroundRemoval();
  }, []);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [bgMode, setBgMode] = useState<BackgroundMode>("color");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [blurRadius, setBlurRadius] = useState<number>(BLUR_RADIUS.default);
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [compositing, setCompositing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFirstRunHint, setShowFirstRunHint] = useState(false);

  const resultUrlRef = useRef("");
  const processIdRef = useRef(0);
  const debouncedBgColor = useDebouncedValue(bgColor, 180);
  const debouncedBlurRadius = useDebouncedValue(blurRadius, 120);

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasCutout = Boolean(cutoutBlob);
  const hasResult = Boolean(resultBlob && resultUrl);
  const canProcess = hasSource && !loading;
  const canDownload =
    bgMode === "color" ||
    bgMode === "blur" ||
    (bgMode === "image" && Boolean(bgImageFile && resultBlob));

  const handleBgColorChange = useCallback((color: string) => {
    const normalized = color.toLowerCase();
    setBgColor((current) => (current === normalized ? current : normalized));
  }, []);

  useEffect(() => {
    resultUrlRef.current = resultUrl;
  }, [resultUrl]);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, [originalUrl]);

  function clearResultState() {
    setResultBlob((current) => (current ? null : current));
    setResultUrl((previous) => {
      if (!previous) return previous;
      URL.revokeObjectURL(previous);
      return "";
    });
    setCompositing((current) => (current ? false : current));
  }

  function resetBackgroundOptions() {
    setBgMode("color");
    setBgColor("#ffffff");
    setBlurRadius(BLUR_RADIUS.default);
    setBgImageFile(null);
    clearResultState();
  }

  function resetCutout() {
    setCutoutBlob(null);
    resetBackgroundOptions();
  }

  function handleFile(file: File) {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    resetCutout();
    setError("");
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    void changeBackground(file);
  }

  async function changeBackground(file?: File | null) {
    const source = file ?? sourceFile;
    if (!source) {
      setError("Upload an image to get started.");
      return;
    }

    const processId = ++processIdRef.current;
    setShowFirstRunHint(!hasPreparedBackgroundModel());
    setLoading(true);
    setError("");
    resetCutout();

    try {
      const blob = await removeImageBackground(source);
      if (processId !== processIdRef.current) return;
      setCutoutBlob(blob);
      trackSuccess();
    } catch (err) {
      if (processId !== processIdRef.current) return;
      trackFailure();
      console.error("[change-background]", err);
      setError(
        "Could not change the background. Try a smaller image or a different browser.",
      );
    } finally {
      if (processId === processIdRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    if (!cutoutBlob || !hasCutout) {
      clearResultState();
      return;
    }

    if (bgMode === "image" && !bgImageFile) {
      clearResultState();
      return;
    }

    if (bgMode === "blur" && !sourceFile) {
      clearResultState();
      return;
    }

    let cancelled = false;

    async function buildComposite() {
      setCompositing(true);

      try {
        let blob: Blob;

        if (bgMode === "color") {
          blob = await compositeOnColor(cutoutBlob!, debouncedBgColor);
        } else if (bgMode === "blur") {
          blob = await compositeWithBlur(
            sourceFile!,
            cutoutBlob!,
            debouncedBlurRadius,
          );
        } else {
          blob = await compositeOnImage(cutoutBlob!, bgImageFile!);
        }

        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl((previous) => {
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
    cutoutBlob,
    hasCutout,
    bgMode,
    debouncedBgColor,
    debouncedBlurRadius,
    bgImageFile,
    sourceFile,
  ]);

  function handleDownload() {
    if (!sourceFile || !resultBlob) return;

    const baseName = fileBaseName(sourceFile);
    const suffix =
      bgMode === "color"
        ? "bg-color"
        : bgMode === "blur"
          ? "blur-bg"
          : "new-bg";
    downloadBlob(resultBlob, `${baseName}-${suffix}.png`);
  }

  function handleReset() {
    processIdRef.current += 1;
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    resetCutout();
    setSourceFile(null);
    setOriginalUrl("");
    setError("");
    setLoading(false);
    setShowFirstRunHint(false);
  }

  const previewHint =
    bgMode === "color"
      ? "Preview with your selected background color."
      : bgMode === "blur"
        ? "Preview with portrait-style background blur."
        : "Preview with your uploaded background image.";

  const previewRef = useMobilePreviewReveal(loading || hasResult || compositing);

  return (
    <div className={`tool-grid${loading || hasResult || compositing ? " is-preview-first" : ""}`}>
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
          <Button onClick={() => void changeBackground()} disabled={!canProcess}>
            Change background
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!hasSource && !hasCutout) || loading}
          >
            Start over
          </Button>
        </div>

        {hasCutout ? (
          <ChangeBackgroundOptions
            mode={bgMode}
            onModeChange={setBgMode}
            bgColor={bgColor}
            onBgColorChange={handleBgColorChange}
            blurRadius={blurRadius}
            onBlurRadiusChange={setBlurRadius}
            bgImageName={bgImageFile?.name}
            onBgImageSelect={setBgImageFile}
            onBgImageError={setError}
            onDownload={handleDownload}
            downloadDisabled={compositing || !canDownload}
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

      <div className="tool-panel tool-panel--preview" ref={previewRef}>
        <div
          className={`tool-stage${hasResult ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading && originalUrl ? (
            <EnhancingPreview src={originalUrl} />
          ) : hasResult && originalUrl ? (
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              hint={previewHint}
            />
          ) : hasCutout && bgMode === "image" && !bgImageFile ? (
            <p className="tool-placeholder">
              Choose a background image to preview the new scene.
            </p>
          ) : hasCutout && compositing ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">Applying background…</span>
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
                Upload another image to change a new background.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload an image to preview and change its background
            </p>
          )}
        </div>
        <p className="tool-hint">
          {loading && showFirstRunHint
            ? BACKGROUND_FIRST_RUN_HINT
            : hasCutout
              ? "Solid color, blurred background, or custom photo · processed locally"
              : "AI cutout + new background · processed locally in your browser · no upload to our servers"}
        </p>
      </div>
    </div>
  );
}
