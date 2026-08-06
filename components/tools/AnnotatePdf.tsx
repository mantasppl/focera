"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  ANNOTATE_COLORS,
  ANNOTATE_TOOLS,
  DEFAULT_FONT_SIZE,
  DEFAULT_STROKE_WIDTH,
  MAX_FONT_SIZE,
  MAX_STROKE_WIDTH,
  MAX_TEXT_LENGTH,
  MIN_FONT_SIZE,
  MIN_STROKE_WIDTH,
  annotateLimitsHint,
  bakeAnnotationsIntoPdf,
  countAnnotationsOnPage,
  createHighlightAnnotation,
  createPenAnnotation,
  createRectAnnotation,
  createTextAnnotation,
  describeAnnotateResult,
  downloadAnnotatedPdf,
  getAnnotateColor,
  loadPdfForAnnotate,
  pdfToScreenPoint,
  renderAnnotatePagePreview,
  screenToPdfPoint,
  type AnnotateColorId,
  type AnnotatePage,
  type AnnotatePdfResult,
  type AnnotateTool,
  type PdfAnnotation,
  type Point,
} from "@/lib/annotate-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type BusyMode = "idle" | "loading" | "exporting";

type DragState =
  | {
      kind: "highlight" | "rect";
      start: Point;
      current: Point;
    }
  | {
      kind: "pen";
      points: Point[];
    }
  | null;

export default function AnnotatePdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const toolId = useId();
  const colorId = useId();
  const textId = useId();
  const fontSizeId = useId();
  const strokeId = useId();

  const abortRef = useRef<AbortController | null>(null);
  const sourceBytesRef = useRef<Uint8Array | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [pages, setPages] = useState<AnnotatePage[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [annotations, setAnnotations] = useState<PdfAnnotation[]>([]);
  const [tool, setTool] = useState<AnnotateTool>("highlight");
  const [color, setColor] = useState<AnnotateColorId>("yellow");
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [strokeWidth, setStrokeWidth] = useState(DEFAULT_STROKE_WIDTH);
  const [busy, setBusy] = useState<BusyMode>("idle");
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [displaySize, setDisplaySize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [result, setResult] = useState<AnnotatePdfResult | null>(null);
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<DragState>(null);

  const isBusy = busy !== "idle";
  const hasSource = Boolean(sourceFile) && pages.length > 0;
  const currentPage = pages[pageIndex] ?? null;
  const pageMarks = currentPage
    ? countAnnotationsOnPage(annotations, currentPage.pageIndex)
    : 0;
  const canExport = hasSource && annotations.length > 0 && !isBusy;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      if (previewUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasSource || !sourceBytesRef.current || !currentPage) return;

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    let cancelled = false;
    setProgressText(`Rendering page ${currentPage.pageNumber}…`);
    setBusy("loading");
    setError("");

    void renderAnnotatePagePreview(
      sourceBytesRef.current,
      currentPage.pageNumber,
      { signal: controller.signal },
    )
      .then((preview) => {
        if (cancelled || controller.signal.aborted) return;
        previewUrlRef.current = preview.url;
        setPreviewUrl(preview.url);
        setPreviewSize({ width: preview.width, height: preview.height });
        setBusy("idle");
        setProgressText("");
      })
      .catch((err) => {
        if (cancelled || controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof Error
            ? err.message
            : "Could not render this page. Try another file.",
        );
        setBusy("idle");
        setProgressText("");
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [hasSource, currentPage, pageIndex]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !previewSize) return;

    function measure() {
      if (!stage || !previewSize) return;
      const maxWidth = stage.clientWidth;
      const ratio = previewSize.height / previewSize.width;
      const width = Math.min(maxWidth, previewSize.width);
      const height = width * ratio;
      setDisplaySize({ width, height });
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [previewSize]);

  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas || !displaySize || !currentPage) return;

    canvas.width = Math.round(displaySize.width);
    canvas.height = Math.round(displaySize.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pageAnnotations = annotations.filter(
      (item) => item.pageIndex === currentPage.pageIndex,
    );

    for (const annotation of pageAnnotations) {
      drawAnnotationPreview(ctx, annotation, displaySize, currentPage);
    }

    if (dragPreview) {
      drawDragPreview(ctx, dragPreview, displaySize, currentPage, color, strokeWidth);
    }
  }, [
    annotations,
    displaySize,
    currentPage,
    dragPreview,
    color,
    strokeWidth,
  ]);

  function clearResult() {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
    setResultPreviewUrl(null);
  }

  function handleReset() {
    abortRef.current?.abort();
    clearResult();
    sourceBytesRef.current = null;
    setSourceFile(null);
    setPages([]);
    setPageIndex(0);
    setAnnotations([]);
    setPreviewUrl(null);
    setPreviewSize(null);
    setDisplaySize(null);
    setText("");
    setError("");
    setProgressText("");
    setBusy("idle");
    setDragPreview(null);
    dragRef.current = null;
  }

  async function handleFile(file: File) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    clearResult();
    setSourceFile(file);
    setPages([]);
    setPageIndex(0);
    setAnnotations([]);
    setPreviewUrl(null);
    setPreviewSize(null);
    setDisplaySize(null);
    setError("");
    setProgressText("Reading PDF…");
    setBusy("loading");

    try {
      const loaded = await loadPdfForAnnotate(file, {
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Loading page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      sourceBytesRef.current = loaded.bytes;
      setPages(loaded.pages);
      setPageIndex(0);
      setBusy("idle");
      setProgressText("");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setSourceFile(null);
      sourceBytesRef.current = null;
      setPages([]);
      setError(
        err instanceof Error
          ? err.message
          : "Could not open this PDF. Try another file.",
      );
      setBusy("idle");
      setProgressText("");
    }
  }

  function pointerToPdf(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ): Point | null {
    if (!displaySize || !currentPage) return null;
    const rect = event.currentTarget.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    return screenToPdfPoint(
      screenX,
      screenY,
      displaySize.width,
      displaySize.height,
      currentPage.width,
      currentPage.height,
    );
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!currentPage || isBusy || result) return;
    const point = pointerToPdf(event);
    if (!point) return;

    if (tool === "text") {
      // Click is the visual top-left; PDF text uses a baseline below that.
      const next = createTextAnnotation(
        currentPage.pageIndex,
        point.x,
        point.y - fontSize,
        text,
        color === "yellow" ? "black" : color,
        fontSize,
      );
      if (!next) {
        setError("Enter some text first, then click the page to place it.");
        return;
      }
      setError("");
      setAnnotations((current) => [...current, next]);
      clearResult();
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    if (tool === "pen") {
      const drag: DragState = { kind: "pen", points: [point] };
      dragRef.current = drag;
      setDragPreview(drag);
      return;
    }

    const drag: DragState = {
      kind: tool === "highlight" ? "highlight" : "rect",
      start: point,
      current: point,
    };
    dragRef.current = drag;
    setDragPreview(drag);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const point = pointerToPdf(event);
    if (!point) return;

    if (drag.kind === "pen") {
      const next: DragState = {
        kind: "pen",
        points: [...drag.points, point],
      };
      dragRef.current = next;
      setDragPreview(next);
      return;
    }

    const next: DragState = {
      ...drag,
      current: point,
    };
    dragRef.current = next;
    setDragPreview(next);
  }

  function handlePointerUp() {
    const drag = dragRef.current;
    if (!drag || !currentPage) {
      dragRef.current = null;
      setDragPreview(null);
      return;
    }

    let next: PdfAnnotation | null = null;

    if (drag.kind === "pen") {
      next = createPenAnnotation(
        currentPage.pageIndex,
        drag.points,
        color,
        strokeWidth,
      );
    } else if (drag.kind === "highlight") {
      next = createHighlightAnnotation(
        currentPage.pageIndex,
        drag.start.x,
        drag.start.y,
        drag.current.x,
        drag.current.y,
        color,
      );
    } else {
      next = createRectAnnotation(
        currentPage.pageIndex,
        drag.start.x,
        drag.start.y,
        drag.current.x,
        drag.current.y,
        color,
        strokeWidth,
      );
    }

    dragRef.current = null;
    setDragPreview(null);

    if (next) {
      setAnnotations((current) => [...current, next]);
      clearResult();
      setError("");
    }
  }

  function handleUndo() {
    setAnnotations((current) => current.slice(0, -1));
    clearResult();
  }

  function handleClearPage() {
    if (!currentPage) return;
    setAnnotations((current) =>
      current.filter((item) => item.pageIndex !== currentPage.pageIndex),
    );
    clearResult();
  }

  function handleClearAll() {
    setAnnotations([]);
    clearResult();
  }

  async function handleExport() {
    if (!sourceFile || !sourceBytesRef.current) {
      setError("Upload a PDF to get started.");
      return;
    }
    if (!annotations.length) {
      setError("Add at least one annotation before downloading.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setBusy("exporting");
    setError("");
    setProgressText("Baking annotations…");
    clearResult();

    try {
      const baked = await bakeAnnotationsIntoPdf(sourceBytesRef.current, {
        annotations,
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Applying mark ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(baked.blob);
      resultUrlRef.current = url;
      setResultPreviewUrl(url);
      setResult(baked);
      downloadAnnotatedPdf(baked.blob, sourceFile);
      setProgressText("");
      trackSuccess();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      trackFailure();
      setError(
        err instanceof Error
          ? err.message
          : "Could not export the annotated PDF. Try again.",
      );
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setBusy("idle");
      }
    }
  }

  function handleDownloadAgain() {
    if (!sourceFile || !result) return;
    downloadAnnotatedPdf(result.blob, sourceFile);
  }

  if (!hasSource) {
    return (
      <div className="tool-grid annotate-pdf annotate-pdf--empty">
        <div className="tool-panel">
          <PdfDropzone
            onFile={(file) => void handleFile(file)}
            onError={setError}
            disabled={isBusy}
          />
          <p className="tool-hint">{annotateLimitsHint()}</p>
          {error ? (
            <p className="tool-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="tool-panel tool-panel--preview">
          <div
            className={`tool-stage${busy === "loading" ? " is-loading" : ""}`}
          >
            {busy === "loading" ? (
              <div className="tool-loading" role="status" aria-live="polite">
                <span className="tool-loading__spinner" aria-hidden="true" />
                <span className="tool-loading__text">
                  {progressText || "Loading PDF…"}
                </span>
                <span className="tool-loading__subtext">
                  Your PDF stays on this device.
                </span>
              </div>
            ) : (
              <div className="annotate-pdf__empty">
                <p className="tool-placeholder">
                  Upload a PDF to highlight, draw, box, or add text notes
                </p>
                <ul className="annotate-pdf__feature-list">
                  <li>Highlight passages with a drag</li>
                  <li>Draw freehand marks with the pen</li>
                  <li>Place text notes with a click</li>
                  <li>Outline regions with boxes</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="annotate-pdf">
      <div className="annotate-pdf__toolbar">
        <div
          className="annotate-pdf__tools"
          role="radiogroup"
          aria-labelledby={toolId}
        >
          <span className="ui-label" id={toolId}>
            Tool
          </span>
          {ANNOTATE_TOOLS.map((option) => {
            const selected = tool === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={cn(
                  "annotate-pdf__chip",
                  selected && "is-active",
                )}
                disabled={isBusy}
                onClick={() => setTool(option.value)}
              >
                <span className="annotate-pdf__chip-label">{option.label}</span>
                <span className="annotate-pdf__chip-hint">{option.hint}</span>
              </button>
            );
          })}
        </div>

        <div
          className="annotate-pdf__colors"
          role="radiogroup"
          aria-labelledby={colorId}
        >
          <span className="ui-label" id={colorId}>
            Color
          </span>
          {ANNOTATE_COLORS.map((option) => {
            const selected = color === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={cn(
                  "annotate-pdf__swatch",
                  selected && "is-active",
                )}
                style={{ background: option.hex }}
                disabled={isBusy}
                aria-label={option.label}
                title={option.label}
                onClick={() => setColor(option.value)}
              />
            );
          })}
        </div>

        <div className="annotate-pdf__toolbar-actions">
          <Button
            variant="ghost"
            onClick={handleUndo}
            disabled={!annotations.length || isBusy}
          >
            Undo
          </Button>
          <Button
            variant="ghost"
            onClick={handleClearPage}
            disabled={pageMarks === 0 || isBusy}
          >
            Clear page
          </Button>
          <Button
            variant="ghost"
            onClick={handleClearAll}
            disabled={!annotations.length || isBusy}
          >
            Clear all
          </Button>
        </div>
      </div>

      {tool === "text" ? (
        <div className="annotate-pdf__text-row">
          <div className="ui-field annotate-pdf__text-field">
            <label className="ui-label" htmlFor={textId}>
              Text note
            </label>
            <textarea
              id={textId}
              className="ui-input ui-input--textarea"
              rows={2}
              maxLength={MAX_TEXT_LENGTH}
              placeholder="Type a note, then click the page to place it…"
              value={text}
              disabled={isBusy}
              onChange={(event) => setText(event.target.value)}
            />
          </div>
          <div className="export-slider annotate-pdf__slider">
            <div className="export-slider__label">
              <label htmlFor={fontSizeId}>Font size</label>
              <span className="export-slider__value">{fontSize} pt</span>
            </div>
            <input
              id={fontSizeId}
              className="export-slider__input"
              type="range"
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              step={1}
              value={fontSize}
              disabled={isBusy}
              onChange={(event) => setFontSize(Number(event.target.value))}
            />
          </div>
        </div>
      ) : null}

      {tool === "pen" || tool === "rect" ? (
        <div className="export-slider annotate-pdf__slider annotate-pdf__slider--stroke">
          <div className="export-slider__label">
            <label htmlFor={strokeId}>Stroke width</label>
            <span className="export-slider__value">{strokeWidth} pt</span>
          </div>
          <input
            id={strokeId}
            className="export-slider__input"
            type="range"
            min={MIN_STROKE_WIDTH}
            max={MAX_STROKE_WIDTH}
            step={0.5}
            value={strokeWidth}
            disabled={isBusy}
            onChange={(event) => setStrokeWidth(Number(event.target.value))}
          />
        </div>
      ) : null}

      <div className="annotate-pdf__meta">
        <p className="annotate-pdf__meta-title">{sourceFile?.name}</p>
        <p className="annotate-pdf__meta-stats">
          {sourceFile ? formatFileSize(sourceFile.size) : ""} · page{" "}
          {pageIndex + 1} of {pages.length} · {annotations.length}{" "}
          {annotations.length === 1 ? "mark" : "marks"}
          {pageMarks > 0 ? ` (${pageMarks} on this page)` : ""}
        </p>
      </div>

      <div className="annotate-pdf__workspace">
        <aside className="annotate-pdf__thumbs" aria-label="Pages">
          <ul className="annotate-pdf__thumb-list">
            {pages.map((page, index) => {
              const marks = countAnnotationsOnPage(annotations, page.pageIndex);
              return (
                <li key={page.id}>
                  <button
                    type="button"
                    className={cn(
                      "annotate-pdf__thumb",
                      index === pageIndex && "is-active",
                    )}
                    disabled={isBusy}
                    onClick={() => setPageIndex(index)}
                  >
                    <span className="annotate-pdf__thumb-badge">
                      {page.pageNumber}
                    </span>
                    {marks > 0 ? (
                      <span className="annotate-pdf__thumb-marks">
                        {marks}
                      </span>
                    ) : null}
                    {page.thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.thumbUrl}
                        alt={`Page ${page.pageNumber}`}
                        className="annotate-pdf__thumb-image"
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="annotate-pdf__stage-wrap" ref={stageRef}>
          <div
            className={cn(
              "annotate-pdf__stage",
              busy === "loading" && "is-loading",
              busy === "exporting" && "is-loading",
            )}
          >
            {busy !== "idle" ? (
              <div className="tool-loading" role="status" aria-live="polite">
                <span className="tool-loading__spinner" aria-hidden="true" />
                <span className="tool-loading__text">
                  {progressText ||
                    (busy === "exporting" ? "Exporting…" : "Loading…")}
                </span>
                <span className="tool-loading__subtext">
                  Your PDF stays on this device.
                </span>
              </div>
            ) : previewUrl && displaySize ? (
              <div
                className="annotate-pdf__page"
                style={{
                  width: displaySize.width,
                  height: displaySize.height,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={`Page ${currentPage?.pageNumber ?? ""}`}
                  className="annotate-pdf__page-image"
                  draggable={false}
                />
                <canvas
                  ref={overlayRef}
                  className={cn(
                    "annotate-pdf__overlay",
                    `annotate-pdf__overlay--${tool}`,
                  )}
                  style={{
                    width: displaySize.width,
                    height: displaySize.height,
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                />
              </div>
            ) : (
              <p className="tool-placeholder">Preparing page preview…</p>
            )}
          </div>
        </div>
      </div>

      <div className="tool-actions annotate-pdf__actions">
        <Button onClick={() => void handleExport()} disabled={!canExport}>
          {busy === "exporting" ? "Downloading…" : "Download annotated PDF"}
        </Button>
        {result ? (
          <Button onClick={handleDownloadAgain} variant="ghost">
            Download again
          </Button>
        ) : null}
        <Button variant="ghost" onClick={handleReset} disabled={isBusy}>
          Start over
        </Button>
      </div>

      {result ? (
        <div className="annotate-pdf__success">
          <p className="annotate-pdf__success-title">Annotated PDF ready</p>
          <p className="annotate-pdf__success-meta">
            {describeAnnotateResult(
              result.annotationCount,
              result.annotatedPageCount,
              result.pageCount,
              result.outputSize,
            )}
          </p>
          {resultPreviewUrl ? (
            <iframe
              title="Annotated PDF preview"
              src={resultPreviewUrl}
              className="annotate-pdf__preview"
            />
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="tool-error" role="alert">
          {error}
        </p>
      ) : null}

      <p className="tool-hint">
        {tool === "text"
          ? "Enter text, then click the page to place a note · processed locally"
          : tool === "highlight"
            ? "Drag across the page to highlight · files never upload to Focera"
            : tool === "pen"
              ? "Draw freehand on the page · files never upload to Focera"
              : "Drag to draw a box outline · files never upload to Focera"}
      </p>
    </div>
  );
}

function drawAnnotationPreview(
  ctx: CanvasRenderingContext2D,
  annotation: PdfAnnotation,
  displaySize: { width: number; height: number },
  page: AnnotatePage,
) {
  const color = getAnnotateColor(annotation.colorId).hex;

  if (annotation.type === "text") {
    const screen = pdfToScreenPoint(
      annotation.x,
      annotation.y,
      displaySize.width,
      displaySize.height,
      page.width,
      page.height,
    );
    const size =
      (annotation.fontSize / page.height) * displaySize.height;
    ctx.fillStyle = color;
    ctx.font = `${Math.max(10, size)}px Helvetica, Arial, sans-serif`;
    ctx.textBaseline = "alphabetic";
    const lines = annotation.text.split("\n");
    const lineHeight = size * 1.25;
    lines.forEach((line, index) => {
      ctx.fillText(line, screen.x, screen.y + index * lineHeight);
    });
    return;
  }

  if (annotation.type === "pen") {
    if (annotation.points.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth =
      (annotation.strokeWidth / page.width) * displaySize.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    annotation.points.forEach((point, index) => {
      const screen = pdfToScreenPoint(
        point.x,
        point.y,
        displaySize.width,
        displaySize.height,
        page.width,
        page.height,
      );
      if (index === 0) ctx.moveTo(screen.x, screen.y);
      else ctx.lineTo(screen.x, screen.y);
    });
    ctx.stroke();
    return;
  }

  const topLeft = pdfToScreenPoint(
    annotation.x,
    annotation.y + annotation.height,
    displaySize.width,
    displaySize.height,
    page.width,
    page.height,
  );
  const width = (annotation.width / page.width) * displaySize.width;
  const height = (annotation.height / page.height) * displaySize.height;

  if (annotation.type === "highlight") {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(topLeft.x, topLeft.y, width, height);
    ctx.globalAlpha = 1;
    return;
  }

  ctx.strokeStyle = color;
  ctx.lineWidth =
    (annotation.strokeWidth / page.width) * displaySize.width;
  ctx.strokeRect(topLeft.x, topLeft.y, width, height);
}

function drawDragPreview(
  ctx: CanvasRenderingContext2D,
  drag: NonNullable<DragState>,
  displaySize: { width: number; height: number },
  page: AnnotatePage,
  colorId: AnnotateColorId,
  strokeWidth: number,
) {
  const color = getAnnotateColor(colorId).hex;

  if (drag.kind === "pen") {
    if (drag.points.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = (strokeWidth / page.width) * displaySize.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    drag.points.forEach((point, index) => {
      const screen = pdfToScreenPoint(
        point.x,
        point.y,
        displaySize.width,
        displaySize.height,
        page.width,
        page.height,
      );
      if (index === 0) ctx.moveTo(screen.x, screen.y);
      else ctx.lineTo(screen.x, screen.y);
    });
    ctx.stroke();
    return;
  }

  const x = Math.min(drag.start.x, drag.current.x);
  const y = Math.min(drag.start.y, drag.current.y);
  const width = Math.abs(drag.current.x - drag.start.x);
  const height = Math.abs(drag.current.y - drag.start.y);
  const topLeft = pdfToScreenPoint(
    x,
    y + height,
    displaySize.width,
    displaySize.height,
    page.width,
    page.height,
  );
  const screenW = (width / page.width) * displaySize.width;
  const screenH = (height / page.height) * displaySize.height;

  if (drag.kind === "highlight") {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(topLeft.x, topLeft.y, screenW, screenH);
    ctx.globalAlpha = 1;
    return;
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = (strokeWidth / page.width) * displaySize.width;
  ctx.strokeRect(topLeft.x, topLeft.y, screenW, screenH);
}
