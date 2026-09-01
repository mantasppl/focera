"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  TEXT_COLOR_PRESETS,
  normalizeHexColor,
} from "@/lib/add-text-on-image";
import { cn } from "@/lib/utils";

type AddTextOnImageColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
};

export default function AddTextOnImageColorPicker({
  value,
  onChange,
  disabled = false,
}: AddTextOnImageColorPickerProps) {
  const triggerId = useId();
  const panelId = useId();
  const hexInputId = useId();
  const nativeInputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hexDraft, setHexDraft] = useState(value);

  const normalized = normalizeHexColor(value);

  useEffect(() => {
    if (!open) setHexDraft(normalized);
  }, [open, normalized]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function selectColor(color: string) {
    onChange(normalizeHexColor(color));
  }

  function commitHexDraft() {
    selectColor(hexDraft);
    setHexDraft(normalizeHexColor(hexDraft));
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "add-text-on-image__picker add-text-on-image__picker--color",
        open && "is-open",
        disabled && "is-disabled",
      )}
    >
      <span className="add-text-on-image__picker-label" id={triggerId}>
        Color
      </span>
      <button
        type="button"
        className="add-text-on-image__color-trigger"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={panelId}
        aria-labelledby={triggerId}
        onClick={() => setOpen((current) => !current)}
      >
        <span
          className="add-text-on-image__color-swatch"
          style={{ backgroundColor: normalized }}
          aria-hidden="true"
        />
        <span className="add-text-on-image__color-value">
          {normalized.toUpperCase()}
        </span>
        <span className="add-text-on-image__picker-chevron" aria-hidden="true" />
      </button>

      {open ? (
        <div id={panelId} className="add-text-on-image__picker-panel">
          <p className="add-text-on-image__picker-group-label">Palette</p>
          <div
            className="add-text-on-image__color-grid"
            role="list"
            aria-label="Color palette"
          >
            {TEXT_COLOR_PRESETS.map((preset) => {
              const isActive = preset === normalized;
              return (
                <button
                  key={preset}
                  type="button"
                  role="listitem"
                  className={cn(
                    "add-text-on-image__color-chip",
                    isActive && "is-active",
                  )}
                  style={{ backgroundColor: preset }}
                  aria-label={`Color ${preset}`}
                  aria-pressed={isActive}
                  onClick={() => selectColor(preset)}
                />
              );
            })}
          </div>

          <div className="add-text-on-image__color-custom">
            <label
              className="add-text-on-image__color-custom-picker"
              htmlFor={nativeInputId}
            >
              <span
                className="add-text-on-image__color-swatch add-text-on-image__color-swatch--large"
                style={{ backgroundColor: normalized }}
                aria-hidden="true"
              />
              <input
                id={nativeInputId}
                type="color"
                className="add-text-on-image__color-native"
                value={normalized}
                disabled={disabled}
                onChange={(event) => selectColor(event.target.value)}
              />
              <span>Custom color</span>
            </label>

            <div className="add-text-on-image__color-hex">
              <label className="ui-label" htmlFor={hexInputId}>
                Hex
              </label>
              <input
                id={hexInputId}
                type="text"
                className="ui-input add-text-on-image__color-hex-input"
                value={hexDraft}
                disabled={disabled}
                spellCheck={false}
                autoComplete="off"
                onChange={(event) => setHexDraft(event.target.value)}
                onBlur={commitHexDraft}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitHexDraft();
                  }
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
