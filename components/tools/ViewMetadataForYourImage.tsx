"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { formatFileSize } from "@/lib/image";
import {
  describeMetadata,
  downloadMetadataJson,
  gpsMapUrl,
  metadataToJson,
  readImageMetadata,
  type ImageMetadataResult,
} from "@/lib/view-image-metadata";
import { useToolAnalytics } from "@/lib/analytics/client";
import { copyText } from "@/lib/utils";

export default function ViewMetadataForYourImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImageMetadataResult | null>(null);
  const [copied, setCopied] = useState(false);

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = result !== null;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  function clearResult() {
    setResult(null);
    setCopied(false);
  }

  async function readFile(file: File) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Preparing…");
    clearResult();

    try {
      const metadata = await readImageMetadata(file, {
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      setResult(metadata);
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
          : "Could not read metadata from this image. Try another file.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setError("");
    setProgressText("");
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    void readFile(file);
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
  }

  async function handleCopy() {
    if (!result) {
      setError("Nothing to copy yet.");
      return;
    }
    const ok = await copyText(metadataToJson(result));
    if (ok) {
      setCopied(true);
      setError("");
      setTimeout(() => setCopied(false), 1600);
      return;
    }
    setError("Could not copy to clipboard. Try downloading the JSON instead.");
  }

  function handleDownload() {
    if (!sourceFile || !result) {
      setError("Nothing to download yet.");
      return;
    }
    downloadMetadataJson(result, sourceFile);
    setError("");
  }

  return (
    <div className="tool-grid view-image-metadata">
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
              {result ? ` · ${result.width}×${result.height} px` : ""}
            </p>
          </div>
        ) : null}

        <div className="tool-actions">
          <Button
            onClick={() => void handleCopy()}
            disabled={!hasResult || loading}
          >
            {copied ? "Copied" : "Copy JSON"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleDownload}
            disabled={!hasResult || loading}
          >
            Download JSON
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
                {progressText || "Reading metadata…"}
              </span>
              <span className="tool-loading__subtext">
                EXIF and tags are read locally in your browser.
              </span>
            </div>
          ) : hasResult && result ? (
            <div className="view-image-metadata__result">
              {originalUrl ? (
                <div className="view-image-metadata__preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalUrl}
                    alt="Uploaded preview"
                    className="preview-single__image"
                  />
                </div>
              ) : null}
              <p className="view-image-metadata__result-meta">
                {describeMetadata(result)}
              </p>
              {result.gps ? (
                <p className="view-image-metadata__gps">
                  <a
                    href={gpsMapUrl(result.gps)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open GPS on OpenStreetMap
                  </a>
                </p>
              ) : null}
              {result.sections.map((section) => (
                <section
                  key={section.id}
                  className="view-image-metadata__section"
                  aria-labelledby={`meta-${section.id}`}
                >
                  <h3
                    id={`meta-${section.id}`}
                    className="view-image-metadata__section-title"
                  >
                    {section.title}
                  </h3>
                  <dl className="view-image-metadata__fields">
                    {section.fields.map((field) => (
                      <div
                        key={`${section.id}-${field.key}`}
                        className="view-image-metadata__field"
                      >
                        <dt>{field.label}</dt>
                        <dd>{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload an image to view its metadata here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Copy or download JSON anytime · processed locally"
            : "Read EXIF, camera, and GPS tags in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
