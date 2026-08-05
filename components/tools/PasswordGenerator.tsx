"use client";

import { useEffect, useId, useState } from "react";
import Button from "@/components/Button";
import { useToolAnalytics } from "@/lib/analytics/client";
import {
  DEFAULT_LENGTH,
  MAX_LENGTH,
  MIN_LENGTH,
  assessStrength,
  formatEntropy,
  generatePassword,
  hasAnyCharset,
  type PasswordOptions,
} from "@/lib/password";
import { copyText } from "@/lib/utils";

const DEFAULT_OPTIONS: PasswordOptions = {
  length: DEFAULT_LENGTH,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
};

type CharsetKey = "lowercase" | "uppercase" | "numbers" | "symbols";

const CHARSET_OPTIONS: Array<{ key: CharsetKey; label: string; sample: string }> =
  [
    { key: "lowercase", label: "Lowercase", sample: "a–z" },
    { key: "uppercase", label: "Uppercase", sample: "A–Z" },
    { key: "numbers", label: "Numbers", sample: "0–9" },
    { key: "symbols", label: "Symbols", sample: "!@#$…" },
  ];

export default function PasswordGenerator() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const lengthId = useId();
  const passwordId = useId();
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const canGenerate = hasAnyCharset(options);
  const strength = assessStrength(options.length, options);

  function applyOptions(next: PasswordOptions) {
    setOptions(next);
    setCopied(false);

    if (!hasAnyCharset(next)) {
      setError("Select at least one character type.");
      setPassword("");
      return;
    }

    try {
      setPassword(generatePassword(next));
      setError("");
      trackSuccess();
    } catch {
      trackFailure();
      setError("Could not generate a password. Try again.");
      setPassword("");
    }
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setPassword(generatePassword(DEFAULT_OPTIONS));
      } catch {
        setPassword("");
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function regenerate() {
    applyOptions(options);
  }

  function updateLength(value: number) {
    applyOptions({
      ...options,
      length: Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, value)),
    });
  }

  function toggleCharset(key: CharsetKey) {
    const next = { ...options, [key]: !options[key] };
    if (!hasAnyCharset(next)) {
      setError("Select at least one character type.");
      return;
    }
    applyOptions(next);
  }

  async function copyPassword() {
    if (!password) return;
    const ok = await copyText(password);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      return;
    }
    setError("Could not copy to clipboard. Try selecting the password manually.");
  }

  return (
    <div className="tool-grid">
      <div className="tool-panel">
        <div className="pw-field">
          <div className="pw-length-header">
            <label className="ui-label" htmlFor={lengthId}>
              Password length
            </label>
            <output className="pw-length-value" htmlFor={lengthId}>
              {options.length}
            </output>
          </div>
          <input
            id={lengthId}
            className="pw-range"
            type="range"
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            step={1}
            value={options.length}
            onChange={(e) => updateLength(Number(e.target.value))}
            aria-valuemin={MIN_LENGTH}
            aria-valuemax={MAX_LENGTH}
            aria-valuenow={options.length}
            aria-valuetext={`${options.length} characters`}
          />
          <div className="pw-length-scale" aria-hidden="true">
            <span>{MIN_LENGTH}</span>
            <span>{MAX_LENGTH}</span>
          </div>
        </div>

        <fieldset className="pw-charset">
          <legend className="ui-label">Character sets</legend>
          <div className="pw-charset__grid">
            {CHARSET_OPTIONS.map((item) => (
              <label key={item.key} className="pw-check">
                <input
                  type="checkbox"
                  checked={options[item.key]}
                  onChange={() => toggleCharset(item.key)}
                />
                <span className="pw-check__text">
                  <span className="pw-check__label">{item.label}</span>
                  <span className="pw-check__sample">{item.sample}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="tool-actions">
          <Button onClick={regenerate} disabled={!canGenerate}>
            Generate password
          </Button>
          <Button
            variant="ghost"
            onClick={() => void copyPassword()}
            disabled={!password}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        {error ? (
          <p className="tool-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="tool-panel tool-panel--preview">
        <div className="pw-output">
          <label className="ui-label" htmlFor={passwordId}>
            Generated password
          </label>
          <div className="pw-output__row">
            <input
              id={passwordId}
              className="ui-input pw-output__input"
              type="text"
              value={password}
              readOnly
              spellCheck={false}
              placeholder="Your password will appear here"
              aria-live="polite"
            />
            <Button
              variant="ghost"
              onClick={() => void copyPassword()}
              disabled={!password}
              aria-label={copied ? "Copied" : "Copy password"}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        <div
          className="pw-strength"
          role="status"
          aria-label={`Password strength: ${strength.label}`}
        >
          <div className="pw-strength__header">
            <span className="ui-label">Strength</span>
            <span
              className={`pw-strength__label pw-strength__label--${strength.level}`}
            >
              {strength.label}
            </span>
          </div>
          <div
            className="pw-meter"
            aria-hidden="true"
            data-level={strength.level}
          >
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={`pw-meter__bar${index < strength.score ? " is-active" : ""}`}
              />
            ))}
          </div>
        </div>

        <dl className="pw-stats">
          <div className="pw-stats__item">
            <dt>Entropy</dt>
            <dd>{formatEntropy(strength.entropy)}</dd>
          </div>
          <div className="pw-stats__item">
            <dt>Character pool</dt>
            <dd>{strength.poolSize}</dd>
          </div>
          <div className="pw-stats__item">
            <dt>Length</dt>
            <dd>{options.length}</dd>
          </div>
        </dl>

        <p className="tool-hint">
          Cryptographically random · generated locally in your browser · never
          uploaded
        </p>
      </div>
    </div>
  );
}
