"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import ChangeBackgroundOptions, {
  type BackgroundMode,
} from "@/components/tools/ChangeBackgroundOptions";
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

  const {
    formatOpen,
    setFormatOpen,
    downloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => resultBlob,
    getFilename: () => {
      if (!sourceFile) return null;
      const baseName = fileBaseName(sourceFile);
      const suffix =
        bgMode === "color"
          ? "bg-color"
          : bgMode === "blur"
            ? "blur-bg"
            : "new-bg";
      return `${baseName}-${suffix}`;
    },
  });

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
    trackFailure,
  ]);

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

  const previewMeta = hasResult
    ? resultBlob
      ? `${bgMode === "color" ? "Solid color" : bgMode === "blur" ? "Blurred background" : "Custom background"} · ${formatFileSize(resultBlob.size)}`
      : "Applying background…"
    : hasCutout
      ? "Cutout ready — choose a background"
      : hasSource
        ? sourceFile!.name
        : "Upload an image to start";

  return (
    <>
      <ImageEditorShell
        className="change-background"
        hasSource={hasSource}
        stageReady={hasResult || hasCutout}
        loading={false}
        previewTitle="Preview"
        previewMeta={previewMeta}
        previewHint={
          hasSource && !hasCutout && !loading
            ? "Click Change background to start"
            : undefined
        }
        privacyHint={
          loading && showFirstRunHint
            ? BACKGROUND_FIRST_RUN_HINT
            : hasCutout
              ? "Processed locally on your device"
              : "AI cutout + new background in your browser · files never upload to Focera"
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
                disabled={loading}
              />
            ) : null}
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button
                onClick={() => void changeBackground()}
                disabled={!canProcess}
              >
                {loading ? "Processing…" : "Change background"}
              </Button>
              {hasCutout ? (
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
                disabled={(!hasSource && !hasCutout) || loading}
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
        ) : hasResult && originalUrl ? (
          <div className="image-editor-shell__result change-background__result">
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              beforeAlt="Original image"
              afterAlt="New background"
              hint={previewHint}
            />
          </div>
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
