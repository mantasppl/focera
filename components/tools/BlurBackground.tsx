"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import EnhancingPreview from "@/components/tools/EnhancingPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { removeImageBackground, preloadBackgroundRemoval, BACKGROUND_FIRST_RUN_HINT, hasPreparedBackgroundModel } from "@/lib/background-removal";
import { compositeWithBlur, BLUR_RADIUS } from "@/lib/composite-image";
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

export default function BlurBackground() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const blurInputId = useId();

  useEffect(() => {
    void preloadBackgroundRemoval();
  }, []);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [blurRadius, setBlurRadius] = useState<number>(BLUR_RADIUS.default);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [compositing, setCompositing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFirstRunHint, setShowFirstRunHint] = useState(false);

  const resultUrlRef = useRef("");
  const processIdRef = useRef(0);
  const debouncedBlurRadius = useDebouncedValue(blurRadius, 120);

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasCutout = Boolean(cutoutBlob);
  const hasResult = Boolean(resultBlob && resultUrl);
  const canProcess = hasSource && !loading;

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

  function resetCutout() {
    setCutoutBlob(null);
    setBlurRadius(BLUR_RADIUS.default);
    clearResultState();
  }

  function handleFile(file: File) {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    resetCutout();
    setError("");
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    void blurBackground(file);
  }

  async function blurBackground(file?: File | null) {
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
      console.error("[blur-background]", err);
      setError(
        "Could not blur the background. Try a smaller image or a different browser.",
      );
    } finally {
      if (processId === processIdRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    if (!cutoutBlob || !sourceFile) {
      clearResultState();
      return;
    }

    let cancelled = false;

    async function buildComposite() {
      setCompositing(true);

      try {
        const blob = await compositeWithBlur(
          sourceFile!,
          cutoutBlob!,
          debouncedBlurRadius,
        );

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
          setError("Could not apply background blur. Try another image.");
        }
      } finally {
        if (!cancelled) setCompositing(false);
      }
    }

    void buildComposite();

    return () => {
      cancelled = true;
    };
  }, [cutoutBlob, debouncedBlurRadius, sourceFile]);

  function handleDownload() {
    if (!sourceFile || !resultBlob) return;
    downloadBlob(resultBlob, `${fileBaseName(sourceFile)}-blur-bg.png`);
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
          <Button onClick={() => void blurBackground()} disabled={!canProcess}>
            Blur background
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
          <section
            className="export-options"
            aria-labelledby="blur-bg-options-heading"
          >
            <h2 id="blur-bg-options-heading" className="export-options__heading">
              Blur intensity
            </h2>
            <p className="export-options__lede">
              Keep your subject sharp while softly blurring the original scene.
            </p>

            <div className="export-option__panel">
              <div className="export-slider">
                <label className="export-slider__label" htmlFor={blurInputId}>
                  Softness
                  <span className="export-slider__value">{blurRadius}px</span>
                </label>
                <input
                  id={blurInputId}
                  type="range"
                  min={BLUR_RADIUS.min}
                  max={BLUR_RADIUS.max}
                  step={BLUR_RADIUS.step}
                  value={blurRadius}
                  disabled={loading}
                  className="export-slider__input"
                  onChange={(event) =>
                    setBlurRadius(Number.parseInt(event.target.value, 10))
                  }
                />
                <p className="ui-hint">
                  Portrait-style depth effect — drag to fine-tune the background
                  softness.
                </p>
              </div>
            </div>

            <div className="export-options__actions">
              <Button
                onClick={handleDownload}
                disabled={compositing || !hasResult || loading}
              >
                {compositing ? "Preparing…" : "Download PNG"}
              </Button>
            </div>
          </section>
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
          ) : hasResult && originalUrl ? (
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              hint="Preview with portrait-style background blur."
            />
          ) : hasCutout && compositing ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">Applying blur…</span>
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
                Upload another image to blur a new background.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload an image to preview and blur its background
            </p>
          )}
        </div>
        <p className="tool-hint">
          {loading && showFirstRunHint
            ? BACKGROUND_FIRST_RUN_HINT
            : hasCutout
              ? "Adjust blur intensity · processed locally"
              : "AI cutout + portrait blur · processed locally in your browser · no upload to our servers"}
        </p>
      </div>
    </div>
  );
}
