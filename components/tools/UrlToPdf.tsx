"use client";

import { useEffect, useId, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {
  downloadUrlPdf,
  formatBytes,
  URL_TO_PDF_PAGE_FORMATS,
  validatePageUrl,
  type UrlToPdfPageFormat,
} from "@/lib/url-to-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const EXAMPLE_URLS = [
  {
    label: "example.com",
    url: "https://example.com",
  },
  {
    label: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/PDF",
  },
];

type PdfResult = {
  blob: Blob;
  title: string;
  finalUrl: string;
  pageMode: string;
  bytes: number;
};

export default function UrlToPdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const urlId = useId();
  const formatId = useId();

  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<UrlToPdfPageFormat>("full");
  const [result, setResult] = useState<PdfResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hasResult = result !== null;
  const canConvert = url.trim().length > 0 && !loading;

  useEffect(() => {
    if (!result) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(result.blob);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [result]);

  async function convertToPdf() {
    const urlError = validatePageUrl(url);
    if (urlError) {
      setError(urlError);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/url-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          format,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          data?.error || "Could not convert this webpage to PDF.",
        );
      }

      const blob = await response.blob();
      if (blob.size < 100) {
        throw new Error("Could not convert this webpage to PDF.");
      }

      const titleHeader = response.headers.get("X-Page-Title");
      const finalUrlHeader = response.headers.get("X-Final-Url");
      const pageMode = response.headers.get("X-Page-Mode") || "full";

      let title = "Webpage";
      let finalUrl = url.trim();
      try {
        if (titleHeader) title = decodeURIComponent(titleHeader);
        if (finalUrlHeader) finalUrl = decodeURIComponent(finalUrlHeader);
      } catch {
        // keep defaults
      }

      setResult({
        blob,
        title,
        finalUrl,
        pageMode,
        bytes: blob.size,
      });
      trackSuccess();
    } catch (err) {
      trackFailure();
      setError(
        err instanceof Error
          ? err.message
          : "Could not convert this webpage to PDF.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result) return;
    downloadUrlPdf(result.blob, result.finalUrl);
    setError("");
  }

  function handleReset() {
    setUrl("");
    setResult(null);
    setError("");
    setFormat("full");
  }

  return (
    <div className="tool-grid url-to-pdf">
      <div className="tool-panel">
        <Input
          id={urlId}
          label="Webpage URL"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            if (error) setError("");
          }}
          placeholder="https://example.com/article"
          hint="Paste any public HTTPS link — the full page length is captured as PDF"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          disabled={loading}
        />

        <div className="url-to-pdf__examples" aria-label="Example pages">
          {EXAMPLE_URLS.map((example) => (
            <button
              key={example.url}
              type="button"
              className="url-to-pdf__example"
              disabled={loading}
              onClick={() => {
                setUrl(example.url);
                if (error) setError("");
              }}
            >
              Try {example.label}
            </button>
          ))}
        </div>

        <div className="url-to-pdf__options">
          <div className="ui-field">
            <span className="ui-label" id={formatId}>
              PDF layout
            </span>
            <div
              className="url-to-pdf__chips"
              role="radiogroup"
              aria-labelledby={formatId}
            >
              {URL_TO_PDF_PAGE_FORMATS.map((option) => {
                const selected = format === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "url-to-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setFormat(option.id)}
                  >
                    <span className="url-to-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="url-to-pdf__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="tool-actions">
          <Button onClick={() => void convertToPdf()} disabled={!canConvert}>
            {loading ? "Converting…" : "Convert to PDF"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={loading || (!url && !hasResult)}
          >
            Start over
          </Button>
        </div>

        {hasResult ? (
          <div className="tool-actions">
            <Button onClick={handleDownload}>Download PDF</Button>
          </div>
        ) : null}

        {error ? (
          <p className="tool-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="tool-panel tool-panel--preview">
        <div
          className={cn(
            "tool-stage url-to-pdf__stage",
            hasResult && "is-ready",
            loading && "is-loading",
          )}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                Rendering webpage to PDF…
              </span>
              <span className="tool-loading__subtext">
                Loading the full page, including scrolled content. This can take
                up to a minute on heavy sites.
              </span>
            </div>
          ) : hasResult && previewUrl ? (
            <div className="url-to-pdf__result">
              <div className="url-to-pdf__meta">
                <p className="url-to-pdf__title">{result.title}</p>
                <p className="url-to-pdf__result-meta">
                  {formatBytes(result.bytes)}
                  {result.pageMode === "paginated"
                    ? " · paginated print layout"
                    : " · full-length page"}
                </p>
                <a
                  className="url-to-pdf__link"
                  href={result.finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open original page
                </a>
              </div>
              <iframe
                className="url-to-pdf__preview"
                title="PDF preview"
                src={previewUrl}
              />
            </div>
          ) : (
            <p className="tool-placeholder">
              Paste a URL to convert the full webpage into a PDF
            </p>
          )}
        </div>
        <p className="tool-hint">
          {hasResult
            ? "Preview above · download anytime · public HTTPS pages only"
            : "URL to PDF · full page length · free, no account"}
        </p>
      </div>
    </div>
  );
}
