"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { brandedDownloadFilename, formatFileSize } from "@/lib/image";
import {
  createPdfDocument,
  describePdfCreatorResult,
  downloadCreatedPdf,
  MAX_PDF_CREATOR_BLANK_PAGES,
  MAX_PDF_CREATOR_BODY_CHARS,
  MAX_PDF_CREATOR_TITLE_CHARS,
  orientationLabel,
  pageSizeLabel,
  pdfCreatorLimitsHint,
  revokePdfCreatorResult,
  sanitizePdfFilename,
  type PdfCreatorOrientation,
  type PdfCreatorPageSize,
  type PdfCreatorResult,
} from "@/lib/pdf-creator";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const PAGE_OPTIONS: {
  value: PdfCreatorPageSize;
  label: string;
  hint: string;
}[] = [
  { value: "a4", label: "A4", hint: "Standard international" },
  { value: "letter", label: "Letter", hint: "US letter size" },
];

const ORIENTATION_OPTIONS: {
  value: PdfCreatorOrientation;
  label: string;
  hint: string;
}[] = [
  { value: "portrait", label: "Portrait", hint: "Tall page" },
  { value: "landscape", label: "Landscape", hint: "Wide page" },
];

export default function PdfCreator() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const titleId = useId();
  const bodyId = useId();
  const filenameId = useId();
  const blankId = useId();
  const pageSizeId = useId();
  const orientationId = useId();
  const resultRef = useRef<PdfCreatorResult | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pageSize, setPageSize] = useState<PdfCreatorPageSize>("a4");
  const [orientation, setOrientation] =
    useState<PdfCreatorOrientation>("portrait");
  const [blankPages, setBlankPages] = useState(0);
  const [filename, setFilename] = useState("document");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PdfCreatorResult | null>(null);

  const hasText = Boolean(title.trim() || body.trim());
  const canCreate = hasText || blankPages >= 1;
  const hasResult = Boolean(result);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      revokePdfCreatorResult(resultRef.current);
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      revokePdfCreatorResult(current);
      return null;
    });
  }

  function handleReset() {
    clearResult();
    setTitle("");
    setBody("");
    setPageSize("a4");
    setOrientation("portrait");
    setBlankPages(0);
    setFilename("document");
    setError("");
    setLoading(false);
  }

  async function handleCreate() {
    setLoading(true);
    setError("");
    clearResult();

    try {
      const created = createPdfDocument({
        title,
        body,
        pageSize,
        orientation,
        blankPages,
        filename,
      });

      setResult(created);
      trackSuccess();
    } catch (err) {
      trackFailure();
      const message =
        err instanceof Error
          ? err.message
          : "Could not create the PDF. Try shorter text or fewer blank pages.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadAgain() {
    if (!result) return;
    downloadCreatedPdf(result);
  }

  return (
    <div className="tool-grid pdf-creator">
      <div className="tool-panel">
        <Input
          id={titleId}
          label="Title"
          value={title}
          maxLength={MAX_PDF_CREATOR_TITLE_CHARS}
          placeholder="Optional document title"
          disabled={loading}
          onChange={(e) => {
            setTitle(e.target.value);
            clearResult();
            setError("");
          }}
          hint={`${title.length}/${MAX_PDF_CREATOR_TITLE_CHARS}`}
        />

        <Input
          id={bodyId}
          as="textarea"
          label="Body text"
          value={body}
          maxLength={MAX_PDF_CREATOR_BODY_CHARS}
          rows={10}
          placeholder="Write your document here… Leave empty to create blank pages only."
          disabled={loading}
          onChange={(e) => {
            setBody(e.target.value);
            clearResult();
            setError("");
          }}
          hint={`${body.length.toLocaleString()}/${MAX_PDF_CREATOR_BODY_CHARS.toLocaleString()} · blank lines become paragraph breaks`}
        />

        <Input
          id={filenameId}
          label="Filename"
          value={filename}
          maxLength={80}
          placeholder="document"
          disabled={loading}
          onChange={(e) => {
            setFilename(e.target.value);
            clearResult();
            setError("");
          }}
          hint={`Downloads as ${brandedDownloadFilename(`${sanitizePdfFilename(filename)}.pdf`)}`}
        />

        <div className="pdf-creator__options">
          <div className="ui-field">
            <span className="ui-label" id={pageSizeId}>
              Page size
            </span>
            <div
              className="pdf-creator__chips pdf-creator__chips--two"
              role="radiogroup"
              aria-labelledby={pageSizeId}
            >
              {PAGE_OPTIONS.map((option) => {
                const selected = pageSize === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "pdf-creator__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => {
                      setPageSize(option.value);
                      clearResult();
                    }}
                  >
                    <span className="pdf-creator__chip-label">
                      {option.label}
                    </span>
                    <span className="pdf-creator__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={orientationId}>
              Orientation
            </span>
            <div
              className="pdf-creator__chips pdf-creator__chips--two"
              role="radiogroup"
              aria-labelledby={orientationId}
            >
              {ORIENTATION_OPTIONS.map((option) => {
                const selected = orientation === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "pdf-creator__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => {
                      setOrientation(option.value);
                      clearResult();
                    }}
                  >
                    <span className="pdf-creator__chip-label">
                      {option.label}
                    </span>
                    <span className="pdf-creator__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            id={blankId}
            label="Extra blank pages"
            type="number"
            min={0}
            max={MAX_PDF_CREATOR_BLANK_PAGES}
            step={1}
            value={String(blankPages)}
            disabled={loading}
            onChange={(e) => {
              const next = Number.parseInt(e.target.value, 10);
              setBlankPages(
                Number.isFinite(next)
                  ? Math.min(
                      MAX_PDF_CREATOR_BLANK_PAGES,
                      Math.max(0, next),
                    )
                  : 0,
              );
              clearResult();
              setError("");
            }}
            hint={
              hasText
                ? "Appended after your text pages"
                : "Set to 1 or more to create a blank PDF"
            }
          />
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleCreate()}
            disabled={!canCreate || loading}
          >
            {loading ? "Creating…" : "Create PDF"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={loading || (!canCreate && !hasResult && filename === "document")}
          >
            Start over
          </Button>
        </div>

        {hasResult ? (
          <div className="tool-actions">
            <Button onClick={handleDownloadAgain}>Download</Button>
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
          className={`tool-stage${hasResult ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">Building PDF…</span>
              <span className="tool-loading__subtext">
                Creation runs locally in your browser.
              </span>
            </div>
          ) : result ? (
            <div className="pdf-creator__success">
              <p className="pdf-creator__success-title">PDF ready</p>
              <p className="pdf-creator__success-meta">
                {describePdfCreatorResult(result)}
              </p>
              <ul className="pdf-creator__stats" aria-label="Creation summary">
                <li>
                  <span className="pdf-creator__stat-label">Pages</span>
                  <span className="pdf-creator__stat-value">
                    {result.pageCount}
                  </span>
                </li>
                <li>
                  <span className="pdf-creator__stat-label">Size</span>
                  <span className="pdf-creator__stat-value">
                    {formatFileSize(result.outputSize)}
                  </span>
                </li>
                <li>
                  <span className="pdf-creator__stat-label">Layout</span>
                  <span className="pdf-creator__stat-value">
                    {pageSizeLabel(result.pageSize)}{" "}
                    {orientationLabel(result.orientation)}
                  </span>
                </li>
              </ul>
              <p className="tool-placeholder preview-single__hint">
                Click Download when you want the file. Edit the text or
                options and create again anytime.
              </p>
            </div>
          ) : (
            <div className="pdf-creator__empty">
              <p className="tool-placeholder">
                {canCreate
                  ? `${pageSizeLabel(pageSize)} ${orientationLabel(orientation).toLowerCase()} · click Create PDF`
                  : "Add a title, body text, or blank pages to create a PDF"}
              </p>
              {canCreate ? (
                <ul className="pdf-creator__summary" aria-label="Document plan">
                  {title.trim() ? <li>Title: {title.trim()}</li> : null}
                  {body.trim() ? (
                    <li>
                      Body: {body.trim().length.toLocaleString()} characters
                    </li>
                  ) : null}
                  {blankPages > 0 ? (
                    <li>
                      {hasText
                        ? `${blankPages} extra blank page${blankPages === 1 ? "" : "s"}`
                        : `${blankPages} blank page${blankPages === 1 ? "" : "s"}`}
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </div>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download when you are ready · processed locally"
            : `PDF Creator runs in your browser · ${pdfCreatorLimitsHint()}`}
        </p>
      </div>
    </div>
  );
}
