"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  TEXT_FONT_CATEGORIES,
  TEXT_FONT_COUNT,
  TEXT_FONTS,
  getFontOption,
  type TextFontId,
} from "@/lib/add-text-on-image";
import { cn } from "@/lib/utils";

type AddTextOnImageFontPickerProps = {
  value: TextFontId;
  onChange: (fontId: TextFontId) => void;
  disabled?: boolean;
};

export default function AddTextOnImageFontPicker({
  value,
  onChange,
  disabled = false,
}: AddTextOnImageFontPickerProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = getFontOption(value);
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = normalizedQuery
    ? TEXT_FONTS.filter(
        (font) =>
          font.label.toLowerCase().includes(normalizedQuery) ||
          font.category.toLowerCase().includes(normalizedQuery),
      )
    : TEXT_FONTS;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function selectFont(fontId: TextFontId) {
    onChange(fontId);
    setOpen(false);
    setQuery("");
  }

  function handleInputFocus() {
    if (disabled) return;
    setOpen(true);
    setQuery("");
  }

  function handleInputChange(next: string) {
    setQuery(next);
    if (!open) setOpen(true);
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "add-text-on-image__picker",
        open && "is-open",
        disabled && "is-disabled",
      )}
    >
      <label className="add-text-on-image__picker-label" htmlFor={listId}>
        Font
      </label>
      <div className="add-text-on-image__picker-control">
        <input
          ref={inputRef}
          id={listId}
          type="text"
          className="add-text-on-image__picker-input ui-input"
          value={open ? query : selected.label}
          placeholder={`Search ${TEXT_FONT_COUNT} fonts…`}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${listId}-listbox`}
          aria-autocomplete="list"
          onFocus={handleInputFocus}
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setQuery("");
              inputRef.current?.blur();
            }
            if (event.key === "Enter" && filtered[0]) {
              event.preventDefault();
              selectFont(filtered[0].value);
            }
          }}
        />
        <span className="add-text-on-image__picker-chevron" aria-hidden="true" />
      </div>

      {open ? (
        <div
          id={`${listId}-listbox`}
          className="add-text-on-image__picker-panel"
          role="listbox"
          aria-label="Font list"
        >
          {TEXT_FONT_CATEGORIES.map((category) => {
            const fonts = filtered.filter((font) => font.category === category);
            if (!fonts.length) return null;

            return (
              <div key={category} className="add-text-on-image__picker-group">
                <p className="add-text-on-image__picker-group-label">
                  {category}
                </p>
                <ul className="add-text-on-image__picker-list">
                  {fonts.map((font) => {
                    const isSelected = font.value === value;
                    return (
                      <li key={font.value}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={cn(
                            "add-text-on-image__picker-option",
                            isSelected && "is-active",
                          )}
                          style={{ fontFamily: font.css, fontWeight: font.weight }}
                          onClick={() => selectFont(font.value)}
                        >
                          <span className="add-text-on-image__picker-option-name">
                            {font.label}
                          </span>
                          <span className="add-text-on-image__picker-option-sample">
                            Aa Bb Cc 123
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          {!filtered.length ? (
            <p className="add-text-on-image__picker-empty">No fonts found.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
