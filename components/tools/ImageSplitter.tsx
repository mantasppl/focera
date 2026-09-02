"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Button from "@/components/Button";
import ImageDropzone from "@/components/tools/ImageDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import ImageSourceBar from "@/components/tools/ImageSourceBar";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  MAX_GRID,
  MIN_GRID,
  SPLIT_GRID_PRESETS,
  clampGridValue,
  describeSplit,
  downloadAllPiecesZip,
  pieceCount,
  readImageDimensions,
  revokePieces,
  splitImageFile,
  type ImagePiece,
  type SplitImageResult,
} from "@/lib/image-splitter";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function ImageSplitter() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const gridId = useId();
  const rowsId = useId();
  const colsId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [customMode, setCustomMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<SplitImageResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasSource = Boolean(sourceFile && originalUrl && originalWidth);
  const hasPieces = Boolean(result && result.pieces.length > 0);
  const activePiece: ImagePiece | null =
    result?.pieces.find((piece) => piece.index === selectedIndex) ??
    result?.pieces[0] ??
    null;
  const gridValid =
    rows >= MIN_GRID &&
    cols >= MIN_GRID &&
    rows <= MAX_GRID &&
    cols <= MAX_GRID &&
    !(rows === 1 && cols === 1);
  const activePresetId = customMode
    ? "custom"
    : (SPLIT_GRID_PRESETS.find(
        (preset) => preset.rows === rows && preset.cols === cols,
      )?.id ?? "custom");

  const {
    formatOpen,
    setFormatOpen,
    downloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => activePiece?.blob ?? null,
    getFilename: () => {
      if (!sourceFile || !result || !activePiece) return null;
      const padded = String(activePiece.index + 1).padStart(2, "0");
      return `${fileBaseName(sourceFile)}-piece-${padded}-r${activePiece.row + 1}c${activePiece.col + 1}-${result.rows}x${result.cols}`;
    },
  });

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  useEffect(() => {
    return () => {
      if (result) revokePieces(result.pieces);
    };
  }, [result]);

  function clearResult() {
    setResult(null);
    setSelectedIndex(0);
  }

  async function handleFile(file: File) {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setError("");
    setProgressText("");
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));

    try {
      const dims = await readImageDimensions(file);
      setOriginalWidth(dims.width);
      setOriginalHeight(dims.height);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not read image dimensions.";
      setError(message);
      setOriginalWidth(0);
      setOriginalHeight(0);
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setSourceFile(null);
    setOriginalUrl("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setRows(2);
    setCols(2);
    setCustomMode(false);
    setError("");
    setProgressText("");
    setLoading(false);
    setZipping(false);
  }

  function handlePreset(presetId: string) {
    if (presetId === "custom") {
      setCustomMode(true);
      return;
    }
    const preset = SPLIT_GRID_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setCustomMode(false);
    setRows(preset.rows);
    setCols(preset.cols);
    clearResult();
  }

  async function handleSplit() {
    if (!sourceFile) {
      setError("Upload an image to get started.");
      return;
    }
    if (!gridValid) {
      setError(
        `Choose rows and columns from ${MIN_GRID}–${MAX_GRID}, with more than one piece.`,
      );
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Preparing…");
    clearResult();

    try {
      const split = await splitImageFile(sourceFile, {
        rows: clampGridValue(rows),
        cols: clampGridValue(cols),
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) {
        revokePieces(split.pieces);
        return;
      }

      setResult(split);
      setSelectedIndex(0);
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
          : "Could not split this image. Try a smaller file or another browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleDownloadPiece() {
    openDownload();
  }

  async function handleDownloadAll() {
    if (!sourceFile || !result) return;
    if (result.pieces.length === 1) {
      openDownload();
      return;
    }
    setZipping(true);
    setError("");
    try {
      await downloadAllPiecesZip(
        result.pieces,
        sourceFile,
        result.rows,
        result.cols,
      );
    } catch {
      setError(
        "Could not create the ZIP download. Try downloading pieces one by one.",
      );
    } finally {
      setZipping(false);
    }
  }

  return (
    <>
      <ImageEditorShell
        className="image-splitter"
        hasSource={hasSource}
        stageReady={hasPieces}
        loading={loading}
        loadingText={progressText || "Splitting image…"}
        loadingSubtext="Pieces are cut locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasPieces && activePiece
            ? `Piece ${activePiece.index + 1} of ${result!.pieces.length} · ${activePiece.width}×${activePiece.height} px`
            : hasSource
              ? describeSplit(originalWidth, originalHeight, rows, cols)
              : "Upload an image to start"
        }
        previewHint={
          hasSource && !hasPieces
            ? "Click Split image to cut pieces"
            : undefined
        }
        privacyHint={
          hasPieces
            ? "Processed locally on your device"
            : "Cut into a grid in your browser · files never upload to Focera"
        }
        sidebar={
          <>
            {!hasSource ? (
              <ImageDropzone
                onFile={(file) => void handleFile(file)}
                onError={setError}
                disabled={loading}
              />
            ) : (
              <ImageSourceBar
                file={sourceFile!}
                width={originalWidth}
                height={originalHeight}
                disabled={loading}
                onReplace={(file) => void handleFile(file)}
              />
            )}

            <div className="image-splitter__options">
              <div className="ui-field">
                <span className="ui-label" id={gridId}>
                  Split grid
                </span>
                <div
                  className="image-splitter__chips"
                  role="group"
                  aria-labelledby={gridId}
                >
                  {SPLIT_GRID_PRESETS.map((preset) => {
                    const selected = activePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={cn(
                          "image-splitter__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => handlePreset(preset.id)}
                      >
                        <span className="image-splitter__chip-label">
                          {preset.label}
                        </span>
                        <span className="image-splitter__chip-hint">
                          {preset.hint}
                        </span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className={cn(
                      "image-splitter__chip",
                      activePresetId === "custom" && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => handlePreset("custom")}
                  >
                    <span className="image-splitter__chip-label">Custom</span>
                    <span className="image-splitter__chip-hint">
                      Set rows & cols
                    </span>
                  </button>
                </div>
                <p className="ui-hint">
                  Cuts into {pieceCount(rows, cols)} PNG pieces (max {MAX_GRID}×
                  {MAX_GRID}).
                </p>
              </div>

              {customMode || activePresetId === "custom" ? (
                <div className="image-splitter__dims">
                  <div className="ui-field">
                    <label className="ui-label" htmlFor={rowsId}>
                      Rows
                    </label>
                    <input
                      id={rowsId}
                      className="ui-input"
                      type="number"
                      min={MIN_GRID}
                      max={MAX_GRID}
                      step={1}
                      inputMode="numeric"
                      value={rows}
                      disabled={loading}
                      onChange={(event) => {
                        setCustomMode(true);
                        setRows(clampGridValue(Number(event.target.value)));
                        clearResult();
                      }}
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label" htmlFor={colsId}>
                      Columns
                    </label>
                    <input
                      id={colsId}
                      className="ui-input"
                      type="number"
                      min={MIN_GRID}
                      max={MAX_GRID}
                      step={1}
                      inputMode="numeric"
                      value={cols}
                      disabled={loading}
                      onChange={(event) => {
                        setCustomMode(true);
                        setCols(clampGridValue(Number(event.target.value)));
                        clearResult();
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button
                onClick={() => void handleSplit()}
                disabled={!hasSource || loading || !gridValid}
              >
                {loading ? "Splitting…" : "Split image"}
              </Button>
              {hasPieces ? (
                <>
                  <Button
                    onClick={handleDownloadPiece}
                    disabled={!activePiece || zipping || downloading}
                  >
                    Download piece
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => void handleDownloadAll()}
                    disabled={zipping || downloading}
                  >
                    {zipping
                      ? "Preparing ZIP…"
                      : result!.pieces.length === 1
                        ? "Download"
                        : "Download all (ZIP)"}
                  </Button>
                </>
              ) : null}
              <Button
                variant="ghost"
                onClick={handleReset}
                disabled={(!hasSource && !hasPieces) || loading}
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
        {activePiece ? (
          <div className="image-splitter__result image-editor-shell__preview-content">
            <div className="preview-single">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePiece.url}
                alt={`Piece ${activePiece.index + 1}`}
                className="preview-single__image image-splitter__preview-image"
              />
              <p className="image-editor-shell__result-meta image-splitter__piece-meta">
                Piece {activePiece.index + 1} of {result!.pieces.length} · row{" "}
                {activePiece.row + 1}, col {activePiece.col + 1} ·{" "}
                {activePiece.width}×{activePiece.height}px ·{" "}
                {formatFileSize(activePiece.blob.size)}
              </p>
            </div>
            <div
              className="image-splitter__thumbs"
              role="list"
              aria-label="Image pieces"
            >
              {result!.pieces.map((piece) => {
                const selected = piece.index === activePiece?.index;
                return (
                  <button
                    key={piece.index}
                    type="button"
                    role="listitem"
                    className={cn(
                      "image-splitter__thumb",
                      selected && "is-active",
                    )}
                    onClick={() => setSelectedIndex(piece.index)}
                    aria-pressed={selected}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={piece.url}
                      alt=""
                      className="image-splitter__thumb-image"
                    />
                    <span className="image-splitter__thumb-label">
                      {piece.index + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : hasSource && originalUrl ? (
          <div className="image-splitter__preview image-editor-shell__preview-content">
            <div
              className="image-splitter__stage"
              style={
                {
                  "--split-rows": rows,
                  "--split-cols": cols,
                } as CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Uploaded preview"
                className="image-splitter__image"
              />
              <div className="image-splitter__overlay" aria-hidden="true">
                {Array.from({ length: rows * cols }, (_, index) => (
                  <span key={index} className="image-splitter__cell" />
                ))}
              </div>
            </div>
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
