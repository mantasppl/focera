"use client";

import { useId } from "react";
import Button from "@/components/Button";
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from "@/lib/image";
import { cn } from "@/lib/utils";
import { BLUR_RADIUS } from "@/lib/composite-image";

export type ExportMode = "transparent" | "color" | "image" | "blur";

const PRESET_COLORS = [
  "#ffffff",
  "#000000",
  "#f4f7f5",
  "#0f7a66",
  "#c45c26",
  "#3b82f6",
];

type BackgroundExportOptionsProps = {
  mode: ExportMode;
  onModeChange: (mode: ExportMode) => void;
  bgColor: string;
  onBgColorChange: (color: string) => void;
  blurRadius: number;
  onBlurRadiusChange: (radius: number) => void;
  bgImageName?: string;
  onBgImageSelect: (file: File) => void;
  onBgImageError: (message: string) => void;
  onDownload: () => void;
  downloadDisabled?: boolean;
  compositing?: boolean;
  disabled?: boolean;
};

export default function BackgroundExportOptions({
  mode,
  onModeChange,
  bgColor,
  onBgColorChange,
  blurRadius,
  onBlurRadiusChange,
  bgImageName,
  onBgImageSelect,
  onBgImageError,
  onDownload,
  downloadDisabled = false,
  compositing = false,
  disabled = false,
}: BackgroundExportOptionsProps) {
  const colorInputId = useId();
  const bgImageInputId = useId();

  function handleBgImage(file: File | undefined) {
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      onBgImageError(validationError);
      return;
    }

    onBgImageError("");
    onBgImageSelect(file);
  }

  return (
    <section className="export-options" aria-labelledby="export-options-heading">
      <h2 id="export-options-heading" className="export-options__heading">
        Export options
      </h2>
      <p className="export-options__lede">
        Download a transparent PNG, blur the original background like a portrait
        lens, or place your cutout on a solid color or custom photo.
      </p>

      <div className="export-options__choices" role="radiogroup" aria-label="Export type">
        <label
          className={cn("export-option", mode === "transparent" && "is-active")}
        >
          <input
            type="radio"
            name="export-mode"
            value="transparent"
            checked={mode === "transparent"}
            disabled={disabled}
            onChange={() => onModeChange("transparent")}
          />
          <span className="export-option__content">
            <span className="export-option__title">Transparent PNG</span>
            <span className="export-option__desc">
              Keep the alpha channel for overlays and design tools.
            </span>
          </span>
        </label>

        <label className={cn("export-option", mode === "color" && "is-active")}>
          <input
            type="radio"
            name="export-mode"
            value="color"
            checked={mode === "color"}
            disabled={disabled}
            onChange={() => onModeChange("color")}
          />
          <span className="export-option__content">
            <span className="export-option__title">Solid color</span>
            <span className="export-option__desc">
              Flatten the cutout onto a background color.
            </span>
          </span>
        </label>

        <label className={cn("export-option", mode === "blur" && "is-active")}>
          <input
            type="radio"
            name="export-mode"
            value="blur"
            checked={mode === "blur"}
            disabled={disabled}
            onChange={() => onModeChange("blur")}
          />
          <span className="export-option__content">
            <span className="export-option__title">Background blur</span>
            <span className="export-option__desc">
              Keep your subject sharp while softly blurring the original scene.
            </span>
          </span>
        </label>

        {mode === "blur" ? (
          <div className="export-option__panel">
            <div className="export-slider">
              <label className="export-slider__label" htmlFor="blur-radius">
                Blur intensity
                <span className="export-slider__value">{blurRadius}px</span>
              </label>
              <input
                id="blur-radius"
                type="range"
                min={BLUR_RADIUS.min}
                max={BLUR_RADIUS.max}
                step={BLUR_RADIUS.step}
                value={blurRadius}
                disabled={disabled}
                className="export-slider__input"
                onChange={(event) =>
                  onBlurRadiusChange(Number.parseInt(event.target.value, 10))
                }
              />
              <p className="ui-hint">
                Portrait-style depth effect — drag to fine-tune the background softness.
              </p>
            </div>
          </div>
        ) : null}

        {mode === "color" ? (
          <div className="export-option__panel">
            <div className="export-color">
              <label className="export-color__picker" htmlFor={colorInputId}>
                <span
                  className="export-color__swatch"
                  style={{ backgroundColor: bgColor }}
                  aria-hidden="true"
                />
                <input
                  id={colorInputId}
                  type="color"
                  value={bgColor}
                  disabled={disabled}
                  onInput={(event) => {
                    const next = event.currentTarget.value.toLowerCase();
                    if (next !== bgColor) onBgColorChange(next);
                  }}
                  className="export-color__input"
                />
                <span className="export-color__value">{bgColor.toUpperCase()}</span>
              </label>
              <div className="export-color__presets" role="list" aria-label="Preset colors">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    role="listitem"
                    className={cn(
                      "export-color__preset",
                      bgColor === color && "is-active",
                    )}
                    style={{ backgroundColor: color }}
                    disabled={disabled}
                    aria-label={`Use ${color}`}
                    aria-pressed={bgColor === color}
                    onClick={() => onBgColorChange(color)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <label className={cn("export-option", mode === "image" && "is-active")}>
          <input
            type="radio"
            name="export-mode"
            value="image"
            checked={mode === "image"}
            disabled={disabled}
            onChange={() => onModeChange("image")}
          />
          <span className="export-option__content">
            <span className="export-option__title">Background image</span>
            <span className="export-option__desc">
              Composite your subject onto another photo or texture.
            </span>
          </span>
        </label>

        {mode === "image" ? (
          <div className="export-option__panel">
            <input
              id={bgImageInputId}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              disabled={disabled}
              className="export-bg__input"
              onChange={(event) => {
                handleBgImage(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <label htmlFor={bgImageInputId} className="export-bg__label">
              {bgImageName ? `Selected: ${bgImageName}` : "Choose background image"}
            </label>
            <p className="ui-hint">JPG, PNG, or WebP · up to 10 MB</p>
          </div>
        ) : null}
      </div>

      <div className="export-options__actions">
        <Button onClick={onDownload} disabled={downloadDisabled || disabled}>
          {compositing
            ? "Preparing…"
            : mode === "transparent"
              ? "Download transparent PNG"
              : mode === "blur"
                ? "Download blurred PNG"
                : "Download PNG"}
        </Button>
      </div>
    </section>
  );
}
