"use client";

import { useEffect, useId, useState } from "react";
import Button from "@/components/Button";
import {
  EXPORT_FORMATS,
  assessContrast,
  createRandomPalette,
  exportPalette,
  formatContrastRatio,
  formatRgb,
  regeneratePalette,
  textColorForBackground,
  togglePaletteLock,
  updatePaletteColor,
  type ExportFormat,
  type PaletteColor,
} from "@/lib/color-palette";
import { cn, copyText } from "@/lib/utils";

export default function ColorPaletteGenerator() {
  const fgId = useId();
  const bgId = useId();
  const exportId = useId();

  const [colors, setColors] = useState<PaletteColor[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("css");
  const [copiedKey, setCopiedKey] = useState("");
  const [error, setError] = useState("");
  const [fgIndex, setFgIndex] = useState(0);
  const [bgIndex, setBgIndex] = useState(4);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setColors(createRandomPalette());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const exportText = colors.length ? exportPalette(colors, exportFormat) : "";
  const fg = colors[fgIndex]?.hex ?? "#0b1f1c";
  const bg = colors[bgIndex]?.hex ?? "#f7faf8";
  const contrast = assessContrast(fg, bg);
  const lockedCount = colors.filter((color) => color.locked).length;

  function flashCopied(key: string) {
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? "" : current));
    }, 1600);
  }

  async function copyValue(key: string, value: string) {
    if (!value) return;
    const ok = await copyText(value);
    if (ok) {
      setError("");
      flashCopied(key);
      return;
    }
    setError("Could not copy to clipboard. Try selecting the text manually.");
  }

  function handleGenerate() {
    setColors((current) =>
      current.length === 0 ? createRandomPalette() : regeneratePalette(current),
    );
    setCopiedKey("");
    setError("");
  }

  function handleLock(id: string) {
    setColors((current) => togglePaletteLock(current, id));
  }

  function handleHexChange(id: string, value: string) {
    setColors((current) => updatePaletteColor(current, id, value));
  }

  if (colors.length === 0) {
    return (
      <div className="palette palette--loading" aria-busy="true">
        <p className="tool-hint">Preparing a fresh palette…</p>
      </div>
    );
  }

  return (
    <div className="palette">
      <div className="palette__strip" role="list" aria-label="Color palette">
        {colors.map((color, index) => {
          const ink = textColorForBackground(color.hex);
          const copyKey = `swatch-${color.id}`;
          return (
            <div
              key={color.id}
              role="listitem"
              className={cn(
                "palette__swatch",
                color.locked && "palette__swatch--locked",
              )}
              style={{ backgroundColor: color.hex, color: ink }}
            >
              <div className="palette__swatch-top">
                <span className="palette__index">0{index + 1}</span>
                <button
                  type="button"
                  className="palette__lock"
                  onClick={() => handleLock(color.id)}
                  aria-pressed={color.locked}
                  aria-label={
                    color.locked
                      ? `Unlock color ${color.hex}`
                      : `Lock color ${color.hex}`
                  }
                  title={color.locked ? "Unlock" : "Lock"}
                >
                  {color.locked ? (
                    <LockIcon locked />
                  ) : (
                    <LockIcon locked={false} />
                  )}
                </button>
              </div>

              <div className="palette__swatch-body">
                <button
                  type="button"
                  className="palette__hex-btn"
                  onClick={() => void copyValue(copyKey, color.hex)}
                  aria-label={`Copy ${color.hex}`}
                >
                  <span className="palette__hex">
                    {copiedKey === copyKey ? "Copied" : color.hex}
                  </span>
                  <span className="palette__rgb">{formatRgb(color.hex)}</span>
                </button>

                <label className="palette__picker">
                  <span className="sr-only">Edit color {index + 1}</span>
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => handleHexChange(color.id, e.target.value)}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="palette__toolbar">
        <div className="palette__toolbar-main">
          <Button
            onClick={handleGenerate}
            disabled={lockedCount === colors.length}
          >
            {lockedCount === colors.length
              ? "Unlock a color to regenerate"
              : lockedCount > 0
                ? "Regenerate unlocked"
                : "Generate random palette"}
          </Button>
          <p className="palette__toolbar-hint">
            {lockedCount > 0
              ? `${lockedCount} locked · unlocked colors refresh on generate`
              : "Lock any swatch to keep it while the rest reshuffle"}
          </p>
        </div>
      </div>

      <div className="palette__panels">
        <section className="palette__panel" aria-labelledby="palette-export">
          <div className="palette__panel-head">
            <h2 id="palette-export" className="palette__panel-title">
              Export palette
            </h2>
            <p className="palette__panel-lede">
              Copy CSS variables, Tailwind theme keys, HEX, or RGB in one click.
            </p>
          </div>

          <div
            className="palette__export-tabs"
            role="tablist"
            aria-label="Export format"
          >
            {EXPORT_FORMATS.map((item) => {
              const selected = item.id === exportFormat;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={cn(
                    "palette__export-tab",
                    selected && "is-active",
                  )}
                  onClick={() => setExportFormat(item.id)}
                >
                  <span className="palette__export-tab-label">{item.label}</span>
                  <span className="palette__export-tab-hint">{item.hint}</span>
                </button>
              );
            })}
          </div>

          <div className="palette__export-row">
            <textarea
              id={exportId}
              className="ui-input ui-input--textarea palette__export-output"
              value={exportText}
              readOnly
              spellCheck={false}
              aria-label={`${exportFormat} export`}
            />
            <Button
              variant="ghost"
              onClick={() => void copyValue("export", exportText)}
              disabled={!exportText}
            >
              {copiedKey === "export" ? "Copied" : "Copy export"}
            </Button>
          </div>
        </section>

        <section className="palette__panel" aria-labelledby="palette-contrast">
          <div className="palette__panel-head">
            <h2 id="palette-contrast" className="palette__panel-title">
              Contrast checker
            </h2>
            <p className="palette__panel-lede">
              Check WCAG contrast between any two colors in the palette.
            </p>
          </div>

          <div className="palette__contrast-controls">
            <div className="ui-field">
              <label className="ui-label" htmlFor={fgId}>
                Text color
              </label>
              <select
                id={fgId}
                className="ui-input ui-input--select"
                value={fgIndex}
                onChange={(e) => setFgIndex(Number(e.target.value))}
              >
                {colors.map((color, index) => (
                  <option key={color.id} value={index}>
                    {`Color ${index + 1} · ${color.hex}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor={bgId}>
                Background
              </label>
              <select
                id={bgId}
                className="ui-input ui-input--select"
                value={bgIndex}
                onChange={(e) => setBgIndex(Number(e.target.value))}
              >
                {colors.map((color, index) => (
                  <option key={color.id} value={index}>
                    {`Color ${index + 1} · ${color.hex}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className="palette__contrast-preview"
            style={{ backgroundColor: bg, color: fg }}
            aria-hidden="true"
          >
            <p className="palette__contrast-sample palette__contrast-sample--lg">
              Large text preview
            </p>
            <p className="palette__contrast-sample">
              Body text should stay readable on this background.
            </p>
          </div>

          <div
            className="palette__contrast-result"
            role="status"
            aria-label={`Contrast ${formatContrastRatio(contrast.ratio)}, ${contrast.label}`}
          >
            <div className="palette__contrast-score">
              <span className="ui-label">Contrast ratio</span>
              <strong className="palette__contrast-ratio">
                {formatContrastRatio(contrast.ratio)}
              </strong>
              <span
                className={cn(
                  "palette__contrast-badge",
                  `palette__contrast-badge--${contrast.level}`,
                )}
              >
                {contrast.label}
              </span>
            </div>

            <ul className="palette__contrast-checks">
              <li
                className={cn(
                  "palette__contrast-check",
                  contrast.passesAaNormal && "is-pass",
                )}
              >
                <span>AA normal text</span>
                <span>{contrast.passesAaNormal ? "Pass" : "Fail"} · 4.5:1</span>
              </li>
              <li
                className={cn(
                  "palette__contrast-check",
                  contrast.passesAaLarge && "is-pass",
                )}
              >
                <span>AA large text</span>
                <span>{contrast.passesAaLarge ? "Pass" : "Fail"} · 3:1</span>
              </li>
              <li
                className={cn(
                  "palette__contrast-check",
                  contrast.passesAaaNormal && "is-pass",
                )}
              >
                <span>AAA normal text</span>
                <span>
                  {contrast.passesAaaNormal ? "Pass" : "Fail"} · 7:1
                </span>
              </li>
              <li
                className={cn(
                  "palette__contrast-check",
                  contrast.passesAaaLarge && "is-pass",
                )}
              >
                <span>AAA large text</span>
                <span>
                  {contrast.passesAaaLarge ? "Pass" : "Fail"} · 4.5:1
                </span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      {error ? (
        <p className="tool-error" role="alert">
          {error}
        </p>
      ) : null}

      <p className="tool-hint">
        Palettes generated locally in your browser · lock colors · export CSS,
        Tailwind, HEX, or RGB
      </p>
    </div>
  );
}

function LockIcon({ locked }: { locked: boolean }) {
  if (locked) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4.5 7V5.5a3.5 3.5 0 0 1 7 0V7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="3"
          y="7"
          width="10"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 7V5.5a3.5 3.5 0 0 1 6.7-1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="3"
        y="7"
        width="10"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
