"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { removeImageBackground } from "@/lib/background-removal";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
} from "@/lib/image";

export default function BackgroundRemover() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = Boolean(resultBlob && resultUrl);
  const canProcess = hasSource && !loading;

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  function resetResult() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultBlob(null);
    setResultUrl("");
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
    } catch {
      setError(
        "Could not remove the background. Try a smaller image or a different browser.",
      );
      setProgressText("");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!resultBlob || !sourceFile) return;
    downloadBlob(resultBlob, `${fileBaseName(sourceFile)}-no-bg.png`);
  }

  function handleReset() {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    resetResult();
    setSourceFile(null);
    setOriginalUrl("");
    setError("");
    setProgressText("");
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
          <Button onClick={() => void removeBackground()} disabled={!canProcess}>
            {loading ? "Removing…" : "Remove background"}
          </Button>
          <Button onClick={handleDownload} disabled={!hasResult || loading}>
            Download PNG
          </Button>
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
          ) : hasResult && originalUrl ? (
            <BeforeAfterPreview beforeSrc={originalUrl} afterSrc={resultUrl} />
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
          Transparent PNG output · processed locally in your browser · no upload
          to our servers
        </p>
      </div>
    </div>
  );
}
