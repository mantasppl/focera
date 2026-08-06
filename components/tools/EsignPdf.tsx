"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Button from "@/components/Button";
import ImageDropzone from "@/components/tools/ImageDropzone";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  DEFAULT_OPACITY,
  DEFAULT_SCALE,
  MAX_SCALE,
  MIN_SCALE,
  SIGNATURE_FONTS,
  SIGNATURE_FONTS_STYLESHEET,
  SIGNATURE_PAGE_TARGETS,
  SIGNATURE_POSITIONS,
  describeSignedResult,
  downloadSignedPdf,
  ensureSignatureFontsLoaded,
  esignPdfLimitsHint,
  getSignatureFont,
  imageFileToPngBytes,
  renderDrawnSignaturePng,
  renderTypedSignaturePng,
  signPdf,
  type EsignPdfResult,
  type SignatureFontId,
  type SignaturePageTarget,
  type SignaturePosition,
} from "@/lib/esign-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type SignatureMode = "type" | "draw" | "upload";
type BusyMode = "idle" | "signing";

const DRAW_WIDTH = 560;
const DRAW_HEIGHT = 200;

export default function EsignPdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const modeId = useId();
  const nameId = useId();
  const fontId = useId();
  const positionId = useId();
  const pagesId = useId();
  const scaleId = useId();
  const opacityId = useId();

  const abortRef = useRef<AbortController | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const uploadPreviewRef = useRef<string | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [mode, setMode] = useState<SignatureMode>("type");
  const [typedName, setTypedName] = useState("");
  const [fontIdValue, setFontIdValue] = useState<SignatureFontId>("great-vibes");
  const [fontsReady, setFontsReady] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [position, setPosition] = useState<SignaturePosition>("bottom-right");
  const [pageTarget, setPageTarget] = useState<SignaturePageTarget>("last");
  const [scalePercent, setScalePercent] = useState(
    Math.round(DEFAULT_SCALE * 100),
  );
  const [opacityPercent, setOpacityPercent] = useState(
    Math.round(DEFAULT_OPACITY * 100),
  );
  const [busy, setBusy] = useState<BusyMode>("idle");
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<EsignPdfResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isBusy = busy !== "idle";
  const hasResult = Boolean(result);
  const selectedFont = getSignatureFont(fontIdValue);
  const canSign =
    Boolean(pdfFile) &&
    ((mode === "type" && typedName.trim().length > 0) ||
      (mode === "draw" && hasDrawing) ||
      (mode === "upload" && Boolean(uploadFile)));

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = SIGNATURE_FONTS_STYLESHEET;
    document.head.appendChild(link);

    let cancelled = false;
    void ensureSignatureFontsLoaded()
      .then(() => {
        if (!cancelled) setFontsReady(true);
      })
      .catch(() => {
        if (!cancelled) setFontsReady(true);
      });

    return () => {
      cancelled = true;
      link.remove();
      abortRef.current?.abort();
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      if (uploadPreviewRef.current) URL.revokeObjectURL(uploadPreviewRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas || mode !== "draw") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2.4;
  }, [mode]);

  function clearResult() {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
    setPreviewUrl(null);
  }

  function clearDrawing() {
    const canvas = drawCanvasRef.current;
    if (!canvas) {
      setHasDrawing(false);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  }

  function handlePdfFile(file: File) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    setPdfFile(file);
  }

  function handleUploadFile(file: File) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    setUploadFile(file);

    if (uploadPreviewRef.current) {
      URL.revokeObjectURL(uploadPreviewRef.current);
    }
    const url = URL.createObjectURL(file);
    uploadPreviewRef.current = url;
    setUploadPreview(url);
  }

  function handleReset() {
    abortRef.current?.abort();
    clearResult();
    setPdfFile(null);
    setTypedName("");
    setUploadFile(null);
    if (uploadPreviewRef.current) {
      URL.revokeObjectURL(uploadPreviewRef.current);
      uploadPreviewRef.current = null;
    }
    setUploadPreview(null);
    clearDrawing();
    setError("");
    setProgressText("");
    setBusy("idle");
  }

  function canvasPoint(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ): { x: number; y: number } {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (isBusy) return;
    const canvas = event.currentTarget;
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = canvasPoint(event);
    setHasDrawing(true);
    clearResult();
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || isBusy) return;
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d");
    const last = lastPointRef.current;
    if (!ctx || !last) return;

    const point = canvasPoint(event);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // ignore if already released
    }
  }

  async function buildSignaturePng(): Promise<Uint8Array> {
    if (mode === "type") {
      return renderTypedSignaturePng(typedName, selectedFont.family);
    }
    if (mode === "draw") {
      const canvas = drawCanvasRef.current;
      if (!canvas) {
        throw new Error("Draw your signature before applying it.");
      }
      return renderDrawnSignaturePng(canvas);
    }
    if (!uploadFile) {
      throw new Error("Upload a signature image to get started.");
    }
    return imageFileToPngBytes(uploadFile);
  }

  async function handleSign() {
    if (!pdfFile) {
      setError("Upload a PDF to get started.");
      return;
    }
    if (!canSign) {
      setError("Create a typed, drawn, or uploaded signature first.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setBusy("signing");
    setError("");
    setProgressText("Preparing signature…");
    clearResult();

    try {
      const signaturePng = await buildSignaturePng();
      if (controller.signal.aborted) return;

      const signed = await signPdf(pdfFile, signaturePng, {
        position,
        pageTarget,
        scale: scalePercent / 100,
        opacity: opacityPercent / 100,
        signal: controller.signal,
        onProgress: (current, total) => {
          if (current === 0) {
            setProgressText("Preparing signature…");
            return;
          }
          setProgressText(`Signing page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(signed.blob);
      resultUrlRef.current = url;
      setPreviewUrl(url);
      setResult(signed);
      downloadSignedPdf(signed.blob, pdfFile);
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
          : "Could not sign this PDF. Try another file or browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setBusy("idle");
      }
    }
  }

  function handleDownloadAgain() {
    if (!pdfFile || !result) return;
    downloadSignedPdf(result.blob, pdfFile);
  }

  return (
    <div className="tool-grid esign-pdf">
      <div className="tool-panel">
        <div className="ui-field">
          <span className="ui-label">PDF document</span>
          <PdfDropzone
            onFile={handlePdfFile}
            onError={setError}
            disabled={isBusy}
          />
        </div>

        {pdfFile ? (
          <div className="upload-meta">
            <p className="upload-meta__name">{pdfFile.name}</p>
            <p className="upload-meta__size">
              {formatFileSize(pdfFile.size)} · {esignPdfLimitsHint()}
            </p>
          </div>
        ) : null}

        <div className="ui-field">
          <span className="ui-label" id={modeId}>
            Signature
          </span>
          <div
            className="esign-pdf__modes"
            role="tablist"
            aria-labelledby={modeId}
          >
            {(
              [
                ["type", "Type"],
                ["draw", "Draw"],
                ["upload", "Upload"],
              ] as const
            ).map(([value, label]) => {
              const selected = mode === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={cn("esign-pdf__mode", selected && "is-active")}
                  disabled={isBusy}
                  onClick={() => {
                    setMode(value);
                    setError("");
                    clearResult();
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {mode === "type" ? (
          <div className="esign-pdf__type">
            <div className="ui-field">
              <label className="ui-label" htmlFor={nameId}>
                Your name
              </label>
              <input
                id={nameId}
                className="ui-input"
                type="text"
                value={typedName}
                maxLength={80}
                placeholder="Jane Doe"
                disabled={isBusy}
                onChange={(event) => {
                  setTypedName(event.target.value);
                  clearResult();
                }}
              />
            </div>

            <div className="ui-field">
              <span className="ui-label" id={fontId}>
                Signature font
              </span>
              <div
                className="esign-pdf__fonts"
                role="radiogroup"
                aria-labelledby={fontId}
              >
                {SIGNATURE_FONTS.map((font) => {
                  const selected = fontIdValue === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={cn(
                        "esign-pdf__font",
                        selected && "is-active",
                      )}
                      style={{ fontFamily: `"${font.family}", cursive` }}
                      disabled={isBusy}
                      onClick={() => {
                        setFontIdValue(font.id);
                        clearResult();
                      }}
                    >
                      {font.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="esign-pdf__typed-preview"
              aria-live="polite"
            >
              {typedName.trim() ? (
                <span
                  className="esign-pdf__typed-sample"
                  style={{
                    fontFamily: `"${selectedFont.family}", cursive`,
                    opacity: fontsReady ? 1 : 0.55,
                  }}
                >
                  {typedName.trim()}
                </span>
              ) : (
                <span className="esign-pdf__typed-placeholder">
                  Typed signature preview
                </span>
              )}
            </div>
          </div>
        ) : null}

        {mode === "draw" ? (
          <div className="esign-pdf__draw">
            <div className="esign-pdf__pad-wrap">
              <canvas
                ref={drawCanvasRef}
                className="esign-pdf__pad"
                width={DRAW_WIDTH}
                height={DRAW_HEIGHT}
                aria-label="Draw your signature"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              />
              {!hasDrawing ? (
                <p className="esign-pdf__pad-hint">Draw your signature here</p>
              ) : null}
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                clearDrawing();
                clearResult();
              }}
              disabled={isBusy || !hasDrawing}
            >
              Clear drawing
            </Button>
          </div>
        ) : null}

        {mode === "upload" ? (
          <div className="esign-pdf__upload">
            <div className="ui-field">
              <span className="ui-label">Signature image</span>
              <ImageDropzone
                onFile={handleUploadFile}
                onError={setError}
                disabled={isBusy}
              />
            </div>
            {uploadFile ? (
              <div className="esign-pdf__upload-meta">
                {uploadPreview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={uploadPreview}
                    alt="Signature preview"
                    className="esign-pdf__upload-thumb"
                  />
                ) : null}
                <div className="upload-meta">
                  <p className="upload-meta__name">{uploadFile.name}</p>
                  <p className="upload-meta__size">
                    {formatFileSize(uploadFile.size)}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="esign-pdf__options">
          <div className="ui-field">
            <span className="ui-label" id={positionId}>
              Position
            </span>
            <div
              className="esign-pdf__chips esign-pdf__chips--positions"
              role="radiogroup"
              aria-labelledby={positionId}
            >
              {SIGNATURE_POSITIONS.map((option) => {
                const selected = position === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn("esign-pdf__chip", selected && "is-active")}
                    disabled={isBusy}
                    onClick={() => setPosition(option.value)}
                  >
                    <span className="esign-pdf__chip-label">{option.label}</span>
                    <span className="esign-pdf__chip-hint">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={pagesId}>
              Pages
            </span>
            <div
              className="esign-pdf__chips esign-pdf__chips--pages"
              role="radiogroup"
              aria-labelledby={pagesId}
            >
              {SIGNATURE_PAGE_TARGETS.map((option) => {
                const selected = pageTarget === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn("esign-pdf__chip", selected && "is-active")}
                    disabled={isBusy}
                    onClick={() => setPageTarget(option.value)}
                  >
                    <span className="esign-pdf__chip-label">{option.label}</span>
                    <span className="esign-pdf__chip-hint">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="export-slider">
            <div className="export-slider__label">
              <label htmlFor={scaleId}>Size</label>
              <span className="export-slider__value">{scalePercent}%</span>
            </div>
            <input
              id={scaleId}
              className="export-slider__input"
              type="range"
              min={Math.round(MIN_SCALE * 100)}
              max={Math.round(MAX_SCALE * 100)}
              step={1}
              value={scalePercent}
              disabled={isBusy}
              onChange={(event) => setScalePercent(Number(event.target.value))}
            />
          </div>

          <div className="export-slider">
            <div className="export-slider__label">
              <label htmlFor={opacityId}>Opacity</label>
              <span className="export-slider__value">{opacityPercent}%</span>
            </div>
            <input
              id={opacityId}
              className="export-slider__input"
              type="range"
              min={15}
              max={100}
              step={1}
              value={opacityPercent}
              disabled={isBusy}
              onChange={(event) =>
                setOpacityPercent(Number(event.target.value))
              }
            />
          </div>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleSign()}
            disabled={!canSign || isBusy}
          >
            {isBusy ? "Signing…" : "Sign PDF"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!pdfFile && !hasResult && !typedName && !hasDrawing && !uploadFile) || isBusy}
          >
            Start over
          </Button>
        </div>

        {hasResult ? (
          <div className="tool-actions">
            <Button onClick={handleDownloadAgain}>Download again</Button>
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
          className={`tool-stage${hasResult ? " is-ready" : ""}${isBusy ? " is-loading" : ""}`}
        >
          {isBusy ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Signing PDF…"}
              </span>
              <span className="tool-loading__subtext">
                Your PDF and signature stay on this device.
              </span>
            </div>
          ) : result ? (
            <div className="esign-pdf__success">
              <p className="esign-pdf__success-title">Signed PDF ready</p>
              <p className="esign-pdf__success-meta">
                {describeSignedResult(
                  result.signedPageCount,
                  result.pageCount,
                  result.outputSize,
                )}
              </p>
              {previewUrl ? (
                <iframe
                  title="Signed PDF preview"
                  src={previewUrl}
                  className="esign-pdf__preview"
                />
              ) : null}
              <p className="tool-placeholder preview-single__hint">
                Your download should start automatically. Adjust the signature
                and sign again anytime.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF, create a typed or drawn signature, then sign and
              preview the result here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "Type, draw, or upload a signature · files never leave your browser"}
        </p>
      </div>
    </div>
  );
}
