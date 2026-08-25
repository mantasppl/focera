"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useSearchParams } from "next/navigation";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useToolAnalytics } from "@/lib/analytics/client";
import { brandedDownloadFilename, downloadBlob } from "@/lib/image";
import {
  decodeQrFromImageFile,
  decodeQrFromVideoFrame,
} from "@/lib/qr-decode";
import {
  DEFAULT_QR_CONTENT,
  DEFAULT_QR_DESIGN,
  QR_CONTENT_TYPES,
  QR_DESIGN_TEMPLATES,
  QR_ECC_LEVELS,
  QR_EYE_STYLES,
  QR_FRAME_STYLES,
  QR_LOGO_SHAPES,
  QR_MODULE_STYLES,
  QR_PREVIEW_BACKGROUNDS,
  QR_SIZE_PRESETS,
  applyDesignTemplate,
  assessQrContrast,
  buildQrPayload,
  clearQrHistory,
  contentFromDecodedPayload,
  createHistoryId,
  effectiveEcc,
  isValidQrPayload,
  loadDesignPreset,
  loadQrHistory,
  parseBatchLines,
  printSizeHint,
  printSizeMm,
  pushQrHistory,
  qrDownloadBasename,
  saveDesignPreset,
  type QrContentState,
  type QrContentType,
  type QrDesignSettings,
  type QrEccLevel,
  type QrEyeStyle,
  type QrFrameStyle,
  type QrHistoryItem,
  type QrLogoShape,
  type QrModuleStyle,
  type QrPreviewBackground,
} from "@/lib/qr-generator";
import { dataUrlToBlob, renderQr } from "@/lib/qr-render";
import { cn, copyText } from "@/lib/utils";

type WorkspaceMode = "single" | "batch";
type OptionsTab = "content" | "style" | "export";

const OPTIONS_TABS: Array<{ id: OptionsTab; label: string; hint: string }> = [
  { id: "content", label: "Content", hint: "What it opens" },
  { id: "style", label: "Style", hint: "Look & logo" },
  { id: "export", label: "Save", hint: "Download & more" },
];

export default function QRGenerator() {
  return (
    <Suspense
      fallback={
        <div className="qr-tool">
          <div className="qr-tool__preview-dock tool-panel">
            <div className="tool-stage">
              <p className="tool-placeholder">Your QR code will appear here</p>
            </div>
          </div>
          <div className="tool-panel">
            <p className="tool-hint">Loading QR generator…</p>
          </div>
        </div>
      }
    >
      <QRGeneratorInner />
    </Suspense>
  );
}

function QRGeneratorInner() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const searchParams = useSearchParams();
  const ids = {
    url: useId(),
    text: useId(),
    wifiSsid: useId(),
    wifiPass: useId(),
    wifiEnc: useId(),
    vFirst: useId(),
    vLast: useId(),
    vOrg: useId(),
    vPhone: useId(),
    vEmail: useId(),
    vUrl: useId(),
    email: useId(),
    emailSubject: useId(),
    emailBody: useId(),
    phone: useId(),
    smsPhone: useId(),
    smsMessage: useId(),
    calTitle: useId(),
    calLoc: useId(),
    calDesc: useId(),
    calStart: useId(),
    calEnd: useId(),
    geoLat: useId(),
    geoLng: useId(),
    geoLabel: useId(),
    appPlatform: useId(),
    appIos: useId(),
    appAndroid: useId(),
    appCustom: useId(),
    dark: useId(),
    light: useId(),
    eye: useId(),
    gradient: useId(),
    size: useId(),
    margin: useId(),
    logoSize: useId(),
    frameLabel: useId(),
    logo: useId(),
    import: useId(),
    batch: useId(),
  };

  const [mode, setMode] = useState<WorkspaceMode>("single");
  const [optionsTab, setOptionsTab] = useState<OptionsTab>("content");
  const [content, setContent] = useState<QrContentState>(DEFAULT_QR_CONTENT);
  const [design, setDesign] = useState<QrDesignSettings>(DEFAULT_QR_DESIGN);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoName, setLogoName] = useState("");
  const [pngDataUrl, setPngDataUrl] = useState("");
  const [svgText, setSvgText] = useState("");
  const [payload, setPayload] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<"payload" | "image" | "">("");
  const [history, setHistory] = useState<QrHistoryItem[]>([]);
  const [batchText, setBatchText] = useState("");
  const [batchBusy, setBatchBusy] = useState(false);
  const [presetSaved, setPresetSaved] = useState(false);
  const [previewBg, setPreviewBg] =
    useState<QrPreviewBackground>("stage");
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanRafRef = useRef<number | null>(null);
  const trackedPayload = useRef("");

  const contrast = assessQrContrast(
    design.darkColor,
    design.lightColor,
    design.transparentBackground,
  );
  const hasQr = Boolean(pngDataUrl);
  const eccInUse = effectiveEcc(design, Boolean(logoDataUrl));
  const canShare =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function";

  useEffect(() => {
    const preset = loadDesignPreset();
    if (preset) setDesign(preset);
    setHistory(loadQrHistory());

    const fromQuery = searchParams.get("url")?.trim();
    if (fromQuery) {
      setContent((current) => ({
        ...current,
        type: "url",
        url: fromQuery,
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode !== "single") return;

    const nextPayload = buildQrPayload(content);
    const valid = isValidQrPayload(content, nextPayload);
    if (!valid) {
      setPayload("");
      setPngDataUrl("");
      setSvgText("");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const result = await renderQr({
            payload: nextPayload,
            design,
            logoDataUrl,
          });
          if (cancelled) return;
          setPayload(nextPayload);
          setPngDataUrl(result.pngDataUrl);
          setSvgText(result.svgText);
          if (trackedPayload.current !== nextPayload) {
            trackedPayload.current = nextPayload;
            trackSuccess();
            setHistory(
              pushQrHistory({
                id: createHistoryId(),
                createdAt: Date.now(),
                type: content.type,
                payload: nextPayload,
                label: qrDownloadBasename(content, nextPayload),
                design,
                content,
              }),
            );
          }
        } catch {
          if (cancelled) return;
          trackFailure();
          setError("Could not encode this content. Try shorter values.");
          setPngDataUrl("");
          setSvgText("");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [content, design, logoDataUrl, mode, trackFailure, trackSuccess]);

  function updateDesign<K extends keyof QrDesignSettings>(
    key: K,
    value: QrDesignSettings[K],
  ) {
    setDesign((current) => {
      const next = { ...current, [key]: value };
      if (key === "darkColor" && current.eyeColor === current.darkColor) {
        next.eyeColor = value as string;
      }
      return next;
    });
    setPresetSaved(false);
  }

  function setContentType(type: QrContentType) {
    setContent((current) => ({ ...current, type }));
  }

  function applyTemplate(templateId: string) {
    const template = QR_DESIGN_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;
    const applied = applyDesignTemplate(template, content);
    setDesign(applied.design);
    setContent(applied.content);
    setMode("single");
    setStatus(`Applied “${template.label}” template.`);
    window.setTimeout(() => setStatus(""), 1800);
  }

  function handleLogoFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Logo must be an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        setError("Could not read logo file.");
        return;
      }
      setLogoDataUrl(result);
      setLogoName(file.name);
      setDesign((current) =>
        current.ecc === "H" ? current : { ...current, ecc: "H" },
      );
      setError("");
    };
    reader.onerror = () => setError("Could not read logo file.");
    reader.readAsDataURL(file);
  }

  function clearLogo() {
    setLogoDataUrl(null);
    setLogoName("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  function downloadPng() {
    if (!pngDataUrl) return;
    downloadBlob(
      dataUrlToBlob(pngDataUrl),
      `${qrDownloadBasename(content, payload)}.png`,
    );
  }

  function downloadSvg() {
    if (!svgText) return;
    downloadBlob(
      new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }),
      `${qrDownloadBasename(content, payload)}.svg`,
    );
  }

  async function downloadPdf() {
    if (!pngDataUrl) return;
    try {
      const mm = printSizeMm(design.size, 300);
      const doc = new jsPDF({
        orientation: mm > 180 ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const size = Math.min(mm, pageW - 20, pageH - 30);
      const x = (pageW - size) / 2;
      const y = (pageH - size) / 2 - 4;
      doc.addImage(pngDataUrl, "PNG", x, y, size, size);
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(
        `${size.toFixed(1)} mm @ 300 DPI · ${payload.slice(0, 80)}`,
        pageW / 2,
        y + size + 10,
        { align: "center", maxWidth: pageW - 20 },
      );
      doc.save(
        brandedDownloadFilename(`${qrDownloadBasename(content, payload)}.pdf`),
      );
      trackSuccess();
    } catch {
      setError("Could not create PDF. Try downloading PNG instead.");
    }
  }

  async function copyPayload() {
    if (!payload) return;
    const ok = await copyText(payload);
    if (ok) {
      setCopied("payload");
      window.setTimeout(() => setCopied(""), 1600);
      return;
    }
    setError("Could not copy to clipboard.");
  }

  async function copyImage() {
    if (!pngDataUrl) return;
    try {
      if (!("clipboard" in navigator) || !window.ClipboardItem) {
        throw new Error("unsupported");
      }
      const blob = dataUrlToBlob(pngDataUrl);
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied("image");
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setError("Could not copy image. Try downloading the PNG instead.");
    }
  }

  async function shareQr() {
    if (!pngDataUrl) return;
    try {
      const file = new File(
        [dataUrlToBlob(pngDataUrl)],
        brandedDownloadFilename(`${qrDownloadBasename(content, payload)}.png`),
        { type: "image/png" },
      );
      if (canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "QR code",
          text: payload,
        });
        return;
      }
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "QR code", text: payload });
        return;
      }
      setError("Sharing is not supported in this browser.");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Could not share this QR code.");
    }
  }

  function handleSavePreset() {
    saveDesignPreset(design);
    setPresetSaved(true);
    window.setTimeout(() => setPresetSaved(false), 1600);
  }

  function handleLoadPreset() {
    const preset = loadDesignPreset();
    if (!preset) {
      setError("No saved design preset yet. Save one first.");
      return;
    }
    setDesign(preset);
    setError("");
  }

  function restoreHistory(item: QrHistoryItem) {
    setMode("single");
    setContent(
      item.content ?? {
        ...DEFAULT_QR_CONTENT,
        type: item.type,
        url: item.type === "url" ? item.payload : DEFAULT_QR_CONTENT.url,
        text: item.type === "text" ? item.payload : DEFAULT_QR_CONTENT.text,
      },
    );
    setDesign({ ...DEFAULT_QR_DESIGN, ...item.design });
  }

  async function importQrImage(file: File | null) {
    if (!file) return;
    try {
      const decoded = await decodeQrFromImageFile(file);
      setContent(contentFromDecodedPayload(decoded));
      setMode("single");
      setStatus("Imported QR payload from image.");
      window.setTimeout(() => setStatus(""), 1800);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not decode that image.",
      );
    } finally {
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  function stopScanner() {
    if (scanRafRef.current != null) {
      window.cancelAnimationFrame(scanRafRef.current);
      scanRafRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  }

  async function startScanner() {
    if (!payload) {
      setError("Generate a QR code before starting a scan check.");
      return;
    }
    setError("");
    setScanMessage("Point your camera at the QR code…");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setScanning(true);
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
      const video = videoRef.current;
      if (!video) {
        stopScanner();
        setError("Camera preview is not available.");
        return;
      }
      video.srcObject = stream;
      await video.play();

      const tick = () => {
        const decoded = decodeQrFromVideoFrame(video);
        if (decoded) {
          if (decoded === payload) {
            setScanMessage("Scan check passed — payload matches.");
          } else {
            setScanMessage(
              `Scanned different payload: ${decoded.slice(0, 80)}`,
            );
          }
          stopScanner();
          return;
        }
        scanRafRef.current = window.requestAnimationFrame(tick);
      };
      scanRafRef.current = window.requestAnimationFrame(tick);
    } catch {
      stopScanner();
      setError(
        "Could not access the camera. You can still import a QR image to decode.",
      );
    }
  }

  async function downloadBatchZip() {
    const lines = parseBatchLines(batchText);
    if (lines.length === 0) {
      setError("Add one URL or text value per line for batch export.");
      return;
    }
    if (lines.length > 50) {
      setError("Batch export supports up to 50 lines at a time.");
      return;
    }

    setBatchBusy(true);
    setError("");
    try {
      const zip = new JSZip();
      for (let i = 0; i < lines.length; i += 1) {
        const value = lines[i];
        const result = await renderQr({
          payload: value,
          design,
          logoDataUrl,
        });
        const safe = value
          .toLowerCase()
          .replace(/^https?:\/\//, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 40);
        zip.file(
          `${String(i + 1).padStart(2, "0")}-${safe || "qr"}.png`,
          dataUrlToBlob(result.pngDataUrl),
        );
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, `qr-batch-${lines.length}.zip`);
      trackSuccess();
    } catch {
      trackFailure();
      setError("Could not build the batch ZIP. Try fewer lines.");
    } finally {
      setBatchBusy(false);
    }
  }

  const utmHref =
    content.type === "url" &&
    content.url.trim() &&
    content.url.trim() !== "https://"
      ? `/utm-builder?url=${encodeURIComponent(content.url.trim())}`
      : "/utm-builder";

  return (
    <div className="qr-tool">
      <section className="qr-tool__preview-dock" aria-label="QR preview">
        <div
          className={cn(
            "tool-stage qr-tool__stage",
            `qr-tool__stage--${previewBg}`,
            hasQr && "is-ready",
            (loading || batchBusy) && "is-loading",
          )}
        >
          {loading || batchBusy ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {batchBusy ? "Building batch ZIP…" : "Updating…"}
              </span>
            </div>
          ) : hasQr && mode === "single" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pngDataUrl}
              alt="Generated QR code"
              className="tool-qr-image"
            />
          ) : (
            <p className="tool-placeholder">
              {mode === "batch" ? "Open Save for ZIP" : "Add content below"}
            </p>
          )}
        </div>

        <div className="qr-tool__quick-actions">
          {mode === "single" ? (
            <>
              <Button onClick={downloadPng} disabled={!hasQr || loading}>
                PNG
              </Button>
              <Button
                variant="ghost"
                onClick={() => void shareQr()}
                disabled={!hasQr || loading}
              >
                Share
              </Button>
              <Button
                variant="ghost"
                onClick={() => setOptionsTab("style")}
              >
                Style
              </Button>
            </>
          ) : (
            <Button onClick={() => void downloadBatchZip()} disabled={batchBusy}>
              {batchBusy ? "…" : "ZIP"}
            </Button>
          )}
        </div>
      </section>

      <section className="tool-panel qr-tool__controls">
        <div
          className="qr-tool__tabs"
          role="tablist"
          aria-label="QR options"
        >
          {OPTIONS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={optionsTab === tab.id}
              className={cn(
                "qr-tool__tab",
                optionsTab === tab.id && "is-active",
              )}
              onClick={() => setOptionsTab(tab.id)}
            >
              <span className="qr-tool__tab-label">{tab.label}</span>
              <span className="qr-tool__tab-hint">{tab.hint}</span>
            </button>
          ))}
        </div>

        {optionsTab === "content" ? (
          <div className="qr-tool__pane" role="tabpanel">
            <div className="qr-tool__mode" role="tablist" aria-label="QR mode">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "single"}
                className={cn(
                  "qr-tool__mode-btn",
                  mode === "single" && "is-active",
                )}
                onClick={() => setMode("single")}
              >
                One code
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "batch"}
                className={cn(
                  "qr-tool__mode-btn",
                  mode === "batch" && "is-active",
                )}
                onClick={() => setMode("batch")}
              >
                Batch
              </button>
            </div>

            {mode === "single" ? (
              <>
                <div className="qr-tool__section">
                  <p className="ui-label">Type</p>
                  <div
                    className="qr-tool__chips qr-tool__chips--scroll"
                    role="tablist"
                    aria-label="Content type"
                  >
                    {QR_CONTENT_TYPES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={content.type === item.id}
                        className={cn(
                          "qr-tool__chip qr-tool__chip--compact",
                          content.type === item.id && "is-active",
                        )}
                        onClick={() => setContentType(item.id)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <ContentFields
                  ids={ids}
                  content={content}
                  setContent={setContent}
                  utmHref={utmHref}
                />
              </>
            ) : (
              <Input
                id={ids.batch}
                as="textarea"
                label="Batch values"
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder={
                  "https://example.com/a\nhttps://example.com/b"
                }
                hint="One value per line. Uses your current Style settings."
              />
            )}
          </div>
        ) : null}

        {optionsTab === "style" ? (
          <div className="qr-tool__pane" role="tabpanel">
            <div className="qr-tool__section">
              <p className="ui-label">Quick templates</p>
              <div className="qr-tool__chips qr-tool__chips--scroll">
                {QR_DESIGN_TEMPLATES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="qr-tool__chip qr-tool__chip--compact"
                    onClick={() => applyTemplate(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="qr-tool__section">
              <p className="ui-label">Colors</p>
              <div className="qr-tool__colors qr-tool__colors--3">
                <label className="qr-tool__color" htmlFor={ids.dark}>
                  <span>Dots</span>
                  <input
                    id={ids.dark}
                    type="color"
                    value={design.darkColor}
                    onChange={(e) => updateDesign("darkColor", e.target.value)}
                  />
                </label>
                <label className="qr-tool__color" htmlFor={ids.eye}>
                  <span>Corners</span>
                  <input
                    id={ids.eye}
                    type="color"
                    value={design.eyeColor}
                    onChange={(e) => updateDesign("eyeColor", e.target.value)}
                  />
                </label>
                <label className="qr-tool__color" htmlFor={ids.light}>
                  <span>Background</span>
                  <input
                    id={ids.light}
                    type="color"
                    value={design.lightColor}
                    disabled={design.transparentBackground}
                    onChange={(e) => updateDesign("lightColor", e.target.value)}
                  />
                </label>
              </div>
              <div className="qr-tool__toggle-row">
                <label className="qr-tool__check">
                  <input
                    type="checkbox"
                    checked={design.transparentBackground}
                    onChange={(e) =>
                      updateDesign("transparentBackground", e.target.checked)
                    }
                  />
                  <span>Transparent</span>
                </label>
                <label className="qr-tool__check">
                  <input
                    type="checkbox"
                    checked={design.gradientEnabled}
                    onChange={(e) =>
                      updateDesign("gradientEnabled", e.target.checked)
                    }
                  />
                  <span>Gradient</span>
                </label>
              </div>
              {design.gradientEnabled ? (
                <label className="qr-tool__color" htmlFor={ids.gradient}>
                  <span>Gradient end</span>
                  <input
                    id={ids.gradient}
                    type="color"
                    value={design.gradientColor}
                    onChange={(e) =>
                      updateDesign("gradientColor", e.target.value)
                    }
                  />
                </label>
              ) : null}
              {contrast ? (
                <p
                  className={cn(
                    "qr-tool__contrast",
                    !contrast.passesAaLarge && "is-warn",
                  )}
                >
                  Contrast {contrast.ratio.toFixed(1)}:1 · {contrast.label}
                  {!contrast.passesAaLarge ? " — may be hard to scan." : ""}
                </p>
              ) : null}
            </div>

            <div className="qr-tool__section">
              <div className="qr-tool__row-head">
                <label className="ui-label" htmlFor={ids.size}>
                  Size
                </label>
                <span className="qr-tool__value">{design.size}px</span>
              </div>
              <div className="qr-tool__chips qr-tool__chips--sizes">
                {QR_SIZE_PRESETS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={cn(
                      "qr-tool__chip",
                      design.size === size && "is-active",
                    )}
                    onClick={() => updateDesign("size", size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <input
                id={ids.size}
                className="pw-range"
                type="range"
                min={128}
                max={2048}
                step={16}
                value={design.size}
                onChange={(e) => updateDesign("size", Number(e.target.value))}
              />
              <p className="tool-hint">{printSizeHint(design.size)}</p>
            </div>

            <div className="qr-tool__section">
              <div className="qr-tool__row-head">
                <label className="ui-label" htmlFor={ids.margin}>
                  Margin
                </label>
                <span className="qr-tool__value">{design.margin}</span>
              </div>
              <input
                id={ids.margin}
                className="pw-range"
                type="range"
                min={0}
                max={8}
                step={1}
                value={design.margin}
                onChange={(e) => updateDesign("margin", Number(e.target.value))}
              />
            </div>

            <div className="qr-tool__section">
              <p className="ui-label">Durability</p>
              <div className="qr-tool__chips qr-tool__chips--ecc">
                {QR_ECC_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={cn(
                      "qr-tool__chip",
                      design.ecc === level && "is-active",
                    )}
                    onClick={() => updateDesign("ecc", level as QrEccLevel)}
                    disabled={Boolean(logoDataUrl) && level !== "H"}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="tool-hint">
                Using {eccInUse}
                {logoDataUrl ? " (H with logo)" : ""}.
              </p>
            </div>

            <div className="qr-tool__section">
              <p className="ui-label">Dot shape</p>
              <div className="qr-tool__chips">
                {QR_MODULE_STYLES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "qr-tool__chip",
                      design.moduleStyle === item.id && "is-active",
                    )}
                    onClick={() =>
                      updateDesign("moduleStyle", item.id as QrModuleStyle)
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="qr-tool__section">
              <p className="ui-label">Corner style</p>
              <div className="qr-tool__chips">
                {QR_EYE_STYLES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "qr-tool__chip",
                      design.eyeStyle === item.id && "is-active",
                    )}
                    onClick={() =>
                      updateDesign("eyeStyle", item.id as QrEyeStyle)
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="qr-tool__section">
              <p className="ui-label">Frame & Text</p>
              <div className="qr-tool__chips">
                {QR_FRAME_STYLES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "qr-tool__chip",
                      design.frameStyle === item.id && "is-active",
                    )}
                    onClick={() =>
                      updateDesign("frameStyle", item.id as QrFrameStyle)
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {design.frameStyle !== "none" ? (
                <Input
                  id={ids.frameLabel}
                  label="Label"
                  value={design.frameLabel}
                  onChange={(e) =>
                    updateDesign("frameLabel", e.target.value.slice(0, 32))
                  }
                  placeholder="Scan me"
                />
              ) : null}
            </div>

            <div className="qr-tool__section">
              <p className="ui-label">Logo</p>
              <input
                ref={logoInputRef}
                id={ids.logo}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="qr-tool__file"
                onChange={(e) => handleLogoFile(e.target.files?.[0] ?? null)}
              />
              <div className="tool-actions">
                <Button
                  variant="ghost"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoDataUrl ? "Replace" : "Add logo"}
                </Button>
                {logoDataUrl ? (
                  <Button variant="ghost" onClick={clearLogo}>
                    Remove
                  </Button>
                ) : null}
              </div>
              {logoName ? <p className="tool-hint">{logoName}</p> : null}
              {logoDataUrl ? (
                <>
                  <div className="qr-tool__chips">
                    {QR_LOGO_SHAPES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={cn(
                          "qr-tool__chip",
                          design.logoShape === item.id && "is-active",
                        )}
                        onClick={() =>
                          updateDesign("logoShape", item.id as QrLogoShape)
                        }
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="qr-tool__row-head">
                    <label className="ui-label" htmlFor={ids.logoSize}>
                      Logo size
                    </label>
                    <span className="qr-tool__value">
                      {design.logoSizePercent}%
                    </span>
                  </div>
                  <input
                    id={ids.logoSize}
                    className="pw-range"
                    type="range"
                    min={12}
                    max={30}
                    step={1}
                    value={design.logoSizePercent}
                    onChange={(e) =>
                      updateDesign("logoSizePercent", Number(e.target.value))
                    }
                  />
                  <label className="qr-tool__check">
                    <input
                      type="checkbox"
                      checked={design.logoPad}
                      onChange={(e) =>
                        updateDesign("logoPad", e.target.checked)
                      }
                    />
                    <span>White pad behind logo</span>
                  </label>
                </>
              ) : null}
            </div>

            <div className="qr-tool__section">
              <p className="ui-label">Test background</p>
              <div className="qr-tool__chips qr-tool__chips--scroll">
                {QR_PREVIEW_BACKGROUNDS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "qr-tool__chip qr-tool__chip--compact",
                      previewBg === item.id && "is-active",
                    )}
                    onClick={() => setPreviewBg(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {optionsTab === "export" ? (
          <div className="qr-tool__pane" role="tabpanel">
            <div className="qr-tool__section">
              <p className="ui-label">Download</p>
              <div className="qr-tool__action-grid">
                {mode === "single" ? (
                  <>
                    <Button onClick={downloadPng} disabled={!hasQr || loading}>
                      PNG
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={downloadSvg}
                      disabled={!hasQr || loading}
                    >
                      SVG
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => void downloadPdf()}
                      disabled={!hasQr || loading}
                    >
                      PDF
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => void copyImage()}
                      disabled={!hasQr || loading}
                    >
                      {copied === "image" ? "Copied" : "Copy image"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => void copyPayload()}
                      disabled={!payload || loading}
                    >
                      {copied === "payload" ? "Copied" : "Copy text"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => void shareQr()}
                      disabled={!hasQr || loading}
                    >
                      Share
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => void downloadBatchZip()}
                    disabled={batchBusy}
                  >
                    {batchBusy ? "Building…" : "ZIP"}
                  </Button>
                )}
              </div>
            </div>

            <div className="qr-tool__section">
              <p className="ui-label">Design preset</p>
              <div className="tool-actions">
                <Button variant="ghost" onClick={handleSavePreset}>
                  {presetSaved ? "Saved" : "Save style"}
                </Button>
                <Button variant="ghost" onClick={handleLoadPreset}>
                  Load style
                </Button>
              </div>
            </div>

            {mode === "single" ? (
              <div className="qr-tool__section">
                <p className="ui-label">Check / import</p>
                <input
                  ref={importInputRef}
                  id={ids.import}
                  type="file"
                  accept="image/*"
                  className="qr-tool__file"
                  onChange={(e) =>
                    void importQrImage(e.target.files?.[0] ?? null)
                  }
                />
                <div className="tool-actions">
                  <Button
                    variant="ghost"
                    onClick={() => importInputRef.current?.click()}
                  >
                    Decode image
                  </Button>
                  {scanning ? (
                    <Button variant="ghost" onClick={stopScanner}>
                      Stop camera
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => void startScanner()}
                      disabled={!payload}
                    >
                      Scan check
                    </Button>
                  )}
                </div>
                {scanMessage ? <p className="tool-hint">{scanMessage}</p> : null}
                {scanning ? (
                  <video
                    ref={videoRef}
                    className="qr-tool__camera"
                    muted
                    playsInline
                  />
                ) : null}
              </div>
            ) : null}

            {history.length > 0 && mode === "single" ? (
              <div className="qr-tool__section">
                <div className="qr-tool__row-head">
                  <p className="ui-label">Recent</p>
                  <button
                    type="button"
                    className="qr-tool__text-btn"
                    onClick={() => {
                      clearQrHistory();
                      setHistory([]);
                    }}
                  >
                    Clear
                  </button>
                </div>
                <ul className="qr-tool__history">
                  {history.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="qr-tool__history-item"
                        onClick={() => {
                          restoreHistory(item);
                          setOptionsTab("content");
                        }}
                      >
                        <span className="qr-tool__history-type">
                          {item.type}
                        </span>
                        <span className="qr-tool__history-label">
                          {item.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {status ? <p className="tool-hint">{status}</p> : null}
        {error ? (
          <p className="tool-error" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    </div>
  );
}

type ContentFieldsProps = {
  ids: Record<string, string>;
  content: QrContentState;
  setContent: Dispatch<SetStateAction<QrContentState>>;
  utmHref: string;
};

function ContentFields({
  ids,
  content,
  setContent,
  utmHref,
}: ContentFieldsProps) {
  switch (content.type) {
    case "url":
      return (
        <>
          <Input
            id={ids.url}
            label="URL"
            type="url"
            value={content.url}
            onChange={(e) =>
              setContent((current) => ({ ...current, url: e.target.value }))
            }
            placeholder="https://example.com"
            spellCheck={false}
            hint="Paste a full link. Add campaign tags with the UTM builder."
          />
          <p className="tool-hint">
            <Link href={utmHref}>Add UTM tracking</Link>
          </p>
        </>
      );
    case "text":
      return (
        <Input
          id={ids.text}
          as="textarea"
          label="Text"
          value={content.text}
          onChange={(e) =>
            setContent((current) => ({ ...current, text: e.target.value }))
          }
          placeholder="Any plain text to encode"
        />
      );
    case "wifi":
      return (
        <>
          <Input
            id={ids.wifiSsid}
            label="Network name (SSID)"
            value={content.wifi.ssid}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                wifi: { ...current.wifi, ssid: e.target.value },
              }))
            }
            placeholder="Cafe Guest"
          />
          <div className="ui-field">
            <label className="ui-label" htmlFor={ids.wifiEnc}>
              Encryption
            </label>
            <select
              id={ids.wifiEnc}
              className="ui-input"
              value={content.wifi.encryption}
              onChange={(e) =>
                setContent((current) => ({
                  ...current,
                  wifi: {
                    ...current.wifi,
                    encryption: e.target.value as "WPA" | "WEP" | "nopass",
                  },
                }))
              }
            >
              <option value="WPA">WPA / WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No password</option>
            </select>
          </div>
          {content.wifi.encryption !== "nopass" ? (
            <Input
              id={ids.wifiPass}
              label="Password"
              type="text"
              value={content.wifi.password}
              onChange={(e) =>
                setContent((current) => ({
                  ...current,
                  wifi: { ...current.wifi, password: e.target.value },
                }))
              }
              placeholder="Network password"
              spellCheck={false}
            />
          ) : null}
          <label className="qr-tool__check">
            <input
              type="checkbox"
              checked={content.wifi.hidden}
              onChange={(e) =>
                setContent((current) => ({
                  ...current,
                  wifi: { ...current.wifi, hidden: e.target.checked },
                }))
              }
            />
            <span>Hidden network</span>
          </label>
        </>
      );
    case "vcard":
      return (
        <>
          <div className="qr-tool__pair">
            <Input
              id={ids.vFirst}
              label="First name"
              value={content.vcard.firstName}
              onChange={(e) =>
                setContent((current) => ({
                  ...current,
                  vcard: { ...current.vcard, firstName: e.target.value },
                }))
              }
            />
            <Input
              id={ids.vLast}
              label="Last name"
              value={content.vcard.lastName}
              onChange={(e) =>
                setContent((current) => ({
                  ...current,
                  vcard: { ...current.vcard, lastName: e.target.value },
                }))
              }
            />
          </div>
          <Input
            id={ids.vOrg}
            label="Organization"
            value={content.vcard.organization}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                vcard: { ...current.vcard, organization: e.target.value },
              }))
            }
          />
          <Input
            id={ids.vPhone}
            label="Phone"
            value={content.vcard.phone}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                vcard: { ...current.vcard, phone: e.target.value },
              }))
            }
            placeholder="+1 555 0100"
          />
          <Input
            id={ids.vEmail}
            label="Email"
            type="email"
            value={content.vcard.email}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                vcard: { ...current.vcard, email: e.target.value },
              }))
            }
          />
          <Input
            id={ids.vUrl}
            label="Website"
            value={content.vcard.url}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                vcard: { ...current.vcard, url: e.target.value },
              }))
            }
            placeholder="https://"
          />
        </>
      );
    case "email":
      return (
        <>
          <Input
            id={ids.email}
            label="Email address"
            type="email"
            value={content.email.address}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                email: { ...current.email, address: e.target.value },
              }))
            }
            placeholder="hello@example.com"
          />
          <Input
            id={ids.emailSubject}
            label="Subject"
            value={content.email.subject}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                email: { ...current.email, subject: e.target.value },
              }))
            }
          />
          <Input
            id={ids.emailBody}
            as="textarea"
            label="Body"
            value={content.email.body}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                email: { ...current.email, body: e.target.value },
              }))
            }
          />
        </>
      );
    case "phone":
      return (
        <Input
          id={ids.phone}
          label="Phone number"
          value={content.phone}
          onChange={(e) =>
            setContent((current) => ({ ...current, phone: e.target.value }))
          }
          placeholder="+1 555 0100"
        />
      );
    case "sms":
      return (
        <>
          <Input
            id={ids.smsPhone}
            label="Phone number"
            value={content.sms.phone}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                sms: { ...current.sms, phone: e.target.value },
              }))
            }
            placeholder="+1 555 0100"
          />
          <Input
            id={ids.smsMessage}
            as="textarea"
            label="Message"
            value={content.sms.message}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                sms: { ...current.sms, message: e.target.value },
              }))
            }
            placeholder="Optional pre-filled text"
          />
        </>
      );
    case "calendar":
      return (
        <>
          <Input
            id={ids.calTitle}
            label="Event title"
            value={content.calendar.title}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                calendar: { ...current.calendar, title: e.target.value },
              }))
            }
            placeholder="Product launch"
          />
          <div className="qr-tool__pair">
            <Input
              id={ids.calStart}
              label="Starts"
              type="datetime-local"
              value={content.calendar.start}
              onChange={(e) =>
                setContent((current) => ({
                  ...current,
                  calendar: { ...current.calendar, start: e.target.value },
                }))
              }
            />
            <Input
              id={ids.calEnd}
              label="Ends"
              type="datetime-local"
              value={content.calendar.end}
              onChange={(e) =>
                setContent((current) => ({
                  ...current,
                  calendar: { ...current.calendar, end: e.target.value },
                }))
              }
            />
          </div>
          <Input
            id={ids.calLoc}
            label="Location"
            value={content.calendar.location}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                calendar: { ...current.calendar, location: e.target.value },
              }))
            }
          />
          <Input
            id={ids.calDesc}
            as="textarea"
            label="Description"
            value={content.calendar.description}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                calendar: { ...current.calendar, description: e.target.value },
              }))
            }
          />
        </>
      );
    case "geo":
      return (
        <>
          <div className="qr-tool__pair">
            <Input
              id={ids.geoLat}
              label="Latitude"
              value={content.geo.latitude}
              onChange={(e) =>
                setContent((current) => ({
                  ...current,
                  geo: { ...current.geo, latitude: e.target.value },
                }))
              }
              placeholder="37.7749"
            />
            <Input
              id={ids.geoLng}
              label="Longitude"
              value={content.geo.longitude}
              onChange={(e) =>
                setContent((current) => ({
                  ...current,
                  geo: { ...current.geo, longitude: e.target.value },
                }))
              }
              placeholder="-122.4194"
            />
          </div>
          <Input
            id={ids.geoLabel}
            label="Label (optional)"
            value={content.geo.label}
            onChange={(e) =>
              setContent((current) => ({
                ...current,
                geo: { ...current.geo, label: e.target.value },
              }))
            }
            placeholder="Cafe entrance"
          />
        </>
      );
    case "app":
      return (
        <>
          <div className="ui-field">
            <label className="ui-label" htmlFor={ids.appPlatform}>
              Store link
            </label>
            <select
              id={ids.appPlatform}
              className="ui-input"
              value={content.app.platform}
              onChange={(e) =>
                setContent((current) => ({
                  ...current,
                  app: {
                    ...current.app,
                    platform: e.target.value as "ios" | "android" | "custom",
                  },
                }))
              }
            >
              <option value="ios">App Store (iOS)</option>
              <option value="android">Play Store (Android)</option>
              <option value="custom">Custom URL</option>
            </select>
          </div>
          {content.app.platform === "ios" ? (
            <Input
              id={ids.appIos}
              label="App Store URL"
              value={content.app.iosUrl}
              onChange={(e) =>
                setContent((current) => ({
                  ...current,
                  app: { ...current.app, iosUrl: e.target.value },
                }))
              }
              placeholder="https://apps.apple.com/app/id…"
              spellCheck={false}
            />
          ) : null}
          {content.app.platform === "android" ? (
            <Input
              id={ids.appAndroid}
              label="Play Store URL"
              value={content.app.androidUrl}
              onChange={(e) =>
                setContent((current) => ({
                  ...current,
                  app: { ...current.app, androidUrl: e.target.value },
                }))
              }
              placeholder="https://play.google.com/store/apps/details?id=…"
              spellCheck={false}
            />
          ) : null}
          {content.app.platform === "custom" ? (
            <Input
              id={ids.appCustom}
              label="App URL"
              value={content.app.customUrl}
              onChange={(e) =>
                setContent((current) => ({
                  ...current,
                  app: { ...current.app, customUrl: e.target.value },
                }))
              }
              placeholder="https://"
              spellCheck={false}
            />
          ) : null}
          <p className="tool-hint">
            Static codes encode one destination. For iOS + Android auto-routing
            you need a dynamic short link later.
          </p>
        </>
      );
    default:
      return null;
  }
}
