"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import {
  CUTOUT_FORMAT_PRESETS,
  CUTOUT_OUTLINE_PRESETS,
  CUTOUT_PADDING_PRESETS,
  CUTOUT_SHADOW_PRESETS,
  type CutoutFormat,
  type CutoutOutline,
  type CutoutShadow,
} from "@/lib/transparent-cutout";

const OUTLINE_PRESET_COLORS = [
  "#ffffff",
  "#111111",
  "#0f7a66",
  "#3b82f6",
  "#ef4444",
  "#f59e0b",
];

type TransparentCutoutOptionsProps = {
  crop: boolean;
  onCropChange: (crop: boolean) => void;
  padding: number;
  onPaddingChange: (padding: number) => void;
  shadow: CutoutShadow;
  onShadowChange: (shadow: CutoutShadow) => void;
  outline: CutoutOutline;
  onOutlineChange: (outline: CutoutOutline) => void;
  outlineColor: string;
  onOutlineColorChange: (color: string) => void;
  format: CutoutFormat;
  onFormatChange: (format: CutoutFormat) => void;
  disabled?: boolean;
};

export default function TransparentCutoutOptions({
  crop,
  onCropChange,
  padding,
  onPaddingChange,
  shadow,
  onShadowChange,
  outline,
  onOutlineChange,
  outlineColor,
  onOutlineColorChange,
  format,
  onFormatChange,
  disabled = false,
}: TransparentCutoutOptionsProps) {
  const paddingId = useId();
  const shadowId = useId();
  const outlineId = useId();
  const formatId = useId();
  const colorInputId = useId();

  return (
    <section
      className="export-options"
      aria-labelledby="transparent-cutout-options-heading"
    >
      <h2
        id="transparent-cutout-options-heading"
        className="export-options__heading"
      >
        Cutout options
      </h2>
      <p className="export-options__lede">
        Crop tight, add padding, drop a shadow or sticker outline, then
        download a transparent PNG or WebP.
      </p>

      <label className={cn("export-option", crop && "is-active")}>
        <input
          type="checkbox"
          checked={crop}
          disabled={disabled}
          onChange={(event) => onCropChange(event.target.checked)}
        />
        <span className="export-option__content">
          <span className="export-option__title">Crop to subject</span>
          <span className="export-option__desc">
            Trim empty transparent pixels so the file hugs the cutout.
          </span>
        </span>
      </label>

      <div className="export-field">
        <span className="export-field__label" id={paddingId}>
          Padding
        </span>
        <div
          className="export-chips export-chips--four"
          role="radiogroup"
          aria-labelledby={paddingId}
        >
          {CUTOUT_PADDING_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              role="radio"
              aria-checked={padding === preset.value}
              className={cn(
                "export-chip",
                padding === preset.value && "is-active",
              )}
              disabled={disabled}
              onClick={() => onPaddingChange(preset.value)}
            >
              <span className="export-chip__label">{preset.label}</span>
              <span className="export-chip__hint">{preset.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="export-field">
        <span className="export-field__label" id={shadowId}>
          Drop shadow
        </span>
        <div
          className="export-chips"
          role="radiogroup"
          aria-labelledby={shadowId}
        >
          {CUTOUT_SHADOW_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              role="radio"
              aria-checked={shadow === preset.value}
              className={cn(
                "export-chip",
                shadow === preset.value && "is-active",
              )}
              disabled={disabled}
              onClick={() => onShadowChange(preset.value)}
            >
              <span className="export-chip__label">{preset.label}</span>
              <span className="export-chip__hint">{preset.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="export-field">
        <span className="export-field__label" id={outlineId}>
          Sticker outline
        </span>
        <div
          className="export-chips export-chips--four"
          role="radiogroup"
          aria-labelledby={outlineId}
        >
          {CUTOUT_OUTLINE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              role="radio"
              aria-checked={outline === preset.value}
              className={cn(
                "export-chip",
                outline === preset.value && "is-active",
              )}
              disabled={disabled}
              onClick={() => onOutlineChange(preset.value)}
            >
              <span className="export-chip__label">{preset.label}</span>
              <span className="export-chip__hint">{preset.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {outline === "custom" ? (
        <div className="export-option__panel">
          <div className="export-color">
            <label className="export-color__picker" htmlFor={colorInputId}>
              <span
                className="export-color__swatch"
                style={{ backgroundColor: outlineColor }}
                aria-hidden="true"
              />
              <input
                id={colorInputId}
                type="color"
                value={outlineColor}
                disabled={disabled}
                onInput={(event) => {
                  const next = event.currentTarget.value.toLowerCase();
                  if (next !== outlineColor) onOutlineColorChange(next);
                }}
                className="export-color__input"
              />
              <span className="export-color__value">
                {outlineColor.toUpperCase()}
              </span>
            </label>
            <div
              className="export-color__presets"
              role="list"
              aria-label="Outline colors"
            >
              {OUTLINE_PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="listitem"
                  className={cn(
                    "export-color__preset",
                    outlineColor === color && "is-active",
                  )}
                  style={{ backgroundColor: color }}
                  disabled={disabled}
                  aria-label={`Use ${color}`}
                  aria-pressed={outlineColor === color}
                  onClick={() => onOutlineColorChange(color)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="export-field">
        <span className="export-field__label" id={formatId}>
          Download as
        </span>
        <div
          className="export-chips export-chips--two"
          role="radiogroup"
          aria-labelledby={formatId}
        >
          {CUTOUT_FORMAT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              role="radio"
              aria-checked={format === preset.value}
              className={cn(
                "export-chip",
                format === preset.value && "is-active",
              )}
              disabled={disabled}
              onClick={() => onFormatChange(preset.value)}
            >
              <span className="export-chip__label">{preset.label}</span>
              <span className="export-chip__hint">{preset.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
