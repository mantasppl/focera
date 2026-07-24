"use client";

import { useId, useState } from "react";
import Button from "@/components/Button";
import {
  UNIT_CATEGORIES,
  convertValue,
  formatConvertedValue,
  getCategory,
  parseUnitInput,
  type UnitCategoryId,
} from "@/lib/units";
import { cn, copyText } from "@/lib/utils";

const DEFAULT_CATEGORY: UnitCategoryId = "length";
const DEFAULT_INPUT = "1";

export default function UnitConverter() {
  const fromValueId = useId();
  const fromUnitId = useId();
  const toValueId = useId();
  const toUnitId = useId();

  const [categoryId, setCategoryId] =
    useState<UnitCategoryId>(DEFAULT_CATEGORY);
  const [fromUnit, setFromUnit] = useState(
    () => getCategory(DEFAULT_CATEGORY).defaultFrom,
  );
  const [toUnit, setToUnit] = useState(
    () => getCategory(DEFAULT_CATEGORY).defaultTo,
  );
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const category = getCategory(categoryId);
  const parsed = parseUnitInput(input);
  const hasInvalidInput = input.trim() !== "" && parsed === null;

  const output =
    parsed === null
      ? ""
      : formatConvertedValue(
          convertValue(parsed, categoryId, fromUnit, toUnit),
        );

  function selectCategory(nextId: UnitCategoryId) {
    const next = getCategory(nextId);
    setCategoryId(nextId);
    setFromUnit(next.defaultFrom);
    setToUnit(next.defaultTo);
    setCopied(false);
    setError("");
  }

  function swapUnits() {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (output) {
      setInput(output);
    }
    setCopied(false);
    setError("");
  }

  async function handleCopy() {
    if (!output) {
      setError("Nothing to copy yet.");
      return;
    }
    const ok = await copyText(output);
    if (ok) {
      setCopied(true);
      setError("");
      setTimeout(() => setCopied(false), 1600);
      return;
    }
    setError("Could not copy to clipboard. Try selecting the result manually.");
  }

  function handleClear() {
    setInput("");
    setCopied(false);
    setError("");
  }

  return (
    <div className="unit-converter">
      <div
        className="unit-converter__tabs"
        role="tablist"
        aria-label="Conversion category"
      >
        {UNIT_CATEGORIES.map((item) => {
          const selected = item.id === categoryId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn(
                "unit-converter__tab",
                selected && "is-active",
              )}
              onClick={() => selectCategory(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <p className="unit-converter__category-hint">{category.description}</p>

      <div className="unit-converter__workspace">
        <div className="tool-panel unit-converter__panel">
          <div className="ui-field">
            <label className="ui-label" htmlFor={fromValueId}>
              From
            </label>
            <input
              id={fromValueId}
              className={cn("ui-input", hasInvalidInput && "is-invalid")}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setCopied(false);
                setError("");
              }}
              aria-invalid={hasInvalidInput}
              aria-describedby="unit-converter-status"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label" htmlFor={fromUnitId}>
              Unit
            </label>
            <select
              id={fromUnitId}
              className="ui-input ui-input--select"
              value={fromUnit}
              onChange={(e) => {
                setFromUnit(e.target.value);
                setCopied(false);
              }}
            >
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="unit-converter__swap">
          <Button
            variant="ghost"
            className="unit-converter__swap-btn"
            onClick={swapUnits}
            aria-label="Swap units"
          >
            Swap
          </Button>
        </div>

        <div className="tool-panel tool-panel--result unit-converter__panel">
          <div className="ui-field">
            <label className="ui-label" htmlFor={toValueId}>
              To
            </label>
            <input
              id={toValueId}
              className="ui-input unit-converter__result"
              type="text"
              readOnly
              value={output}
              placeholder="—"
              aria-live="polite"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label" htmlFor={toUnitId}>
              Unit
            </label>
            <select
              id={toUnitId}
              className="ui-input ui-input--select"
              value={toUnit}
              onChange={(e) => {
                setToUnit(e.target.value);
                setCopied(false);
              }}
            >
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="unit-converter__actions">
        <Button onClick={() => void handleCopy()} disabled={!output}>
          {copied ? "Copied" : "Copy result"}
        </Button>
        <Button variant="ghost" onClick={handleClear} disabled={!input}>
          Clear
        </Button>
      </div>

      <div
        id="unit-converter-status"
        className={cn(
          "unit-converter__status",
          hasInvalidInput && "unit-converter__status--error",
        )}
        role="status"
        aria-live="polite"
      >
        {hasInvalidInput
          ? "Enter a valid number to convert."
          : output
            ? `Instant ${category.label.toLowerCase()} conversion — updated as you type.`
            : `Enter a value to convert ${category.label.toLowerCase()} units instantly.`}
      </div>

      {error ? (
        <p className="tool-error" role="alert">
          {error}
        </p>
      ) : null}

      <p className="tool-hint">
        Converts in your browser · no upload · data units use 1024-based sizes
      </p>
    </div>
  );
}
