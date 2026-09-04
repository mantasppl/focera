"use client";

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type FormEvent,
} from "react";
import Button from "@/components/Button";
import { getAnalyticsSessionId } from "@/lib/analytics/client";
import { PRODUCT_DOWNLOAD_EVENT } from "@/lib/ratings/notify";
import { cn } from "@/lib/utils";

const DOWNLOADS_BEFORE_PROMPT = 5;
const DOWNLOAD_COUNT_KEY = "focera_product_download_count";
const RATED_TOOLS_KEY = "focera_tool_rated_at";
const RATED_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

const STAR_LABELS = [
  "",
  "Poor",
  "Fair",
  "Good",
  "Great",
  "Excellent",
] as const;

type ToolRatingProps = {
  toolSlug: string;
  toolName: string;
};

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success" }
  | { type: "error"; message: string };

function readDownloadCounts(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(DOWNLOAD_COUNT_KEY);
    if (!raw) return {};
    // Legacy global counter from the 3-download prompt.
    if (/^\d+$/.test(raw)) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const counts: Record<string, number> = {};
    for (const [slug, value] of Object.entries(parsed)) {
      const n = typeof value === "number" ? value : Number.parseInt(String(value), 10);
      if (slug && Number.isFinite(n) && n > 0) counts[slug] = n;
    }
    return counts;
  } catch {
    return {};
  }
}

function writeDownloadCounts(counts: Record<string, number>) {
  try {
    window.localStorage.setItem(DOWNLOAD_COUNT_KEY, JSON.stringify(counts));
  } catch {
    // ignore quota / private mode
  }
}

function readRatedAtMap(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(RATED_TOOLS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const map: Record<string, number> = {};
    for (const [slug, value] of Object.entries(parsed)) {
      const n = typeof value === "number" ? value : Number.parseInt(String(value), 10);
      if (slug && Number.isFinite(n) && n > 0) map[slug] = n;
    }
    return map;
  } catch {
    return {};
  }
}

function hasRecentlyRated(toolSlug: string): boolean {
  const ratedAt = readRatedAtMap()[toolSlug];
  if (!ratedAt) return false;
  return Date.now() - ratedAt < RATED_COOLDOWN_MS;
}

function markToolRated(toolSlug: string) {
  try {
    const map = readRatedAtMap();
    map[toolSlug] = Date.now();
    window.localStorage.setItem(RATED_TOOLS_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="tool-rating__star-icon"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 2.6l2.83 6.54 7.1.66-5.4 4.66 1.6 6.94L12 17.9l-6.13 3.5 1.6-6.94-5.4-4.66 7.1-.66L12 2.6z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarPicker({
  value,
  onChange,
  disabled,
  id,
}: {
  value: number;
  onChange: (stars: number) => void;
  disabled?: boolean;
  id: string;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const label = STAR_LABELS[shown] || "Tap a star";

  return (
    <div className="tool-rating__stars-wrap">
      <div
        className="tool-rating__stars"
        role="radiogroup"
        aria-label="Star rating"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((stars) => {
          const active = stars <= shown;
          return (
            <button
              key={stars}
              id={stars === 1 ? id : undefined}
              type="button"
              role="radio"
              aria-checked={value === stars}
              aria-label={`${stars} star${stars === 1 ? "" : "s"} — ${STAR_LABELS[stars]}`}
              className={cn(
                "tool-rating__star",
                active && "is-on",
                hover === stars && "is-hover",
              )}
              disabled={disabled}
              onMouseEnter={() => setHover(stars)}
              onFocus={() => setHover(stars)}
              onBlur={() => setHover(0)}
              onClick={() => onChange(stars)}
            >
              <StarIcon filled={active} />
            </button>
          );
        })}
      </div>
      <p
        className={cn(
          "tool-rating__stars-label",
          shown > 0 && "is-active",
        )}
        aria-live="polite"
      >
        {label}
      </p>
    </div>
  );
}

function RatingForm({
  toolSlug,
  toolName,
  idPrefix,
  onSuccess,
  compact,
}: {
  toolSlug: string;
  toolName: string;
  idPrefix: string;
  onSuccess?: () => void;
  compact?: boolean;
}) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const starsId = `${idPrefix}-stars`;
  const commentId = `${idPrefix}-comment`;
  const showComment = commentOpen || comment.length > 0 || stars > 0;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (stars < 1) {
      setStatus({
        type: "error",
        message: "Please choose a star rating.",
      });
      return;
    }

    setStatus({ type: "loading" });
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug,
          stars,
          comment,
          sessionId: getAnalyticsSessionId(),
        }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        setStatus({
          type: "error",
          message: data?.error || "Could not send your rating. Please try again.",
        });
        return;
      }
      setComment("");
      setStars(0);
      setCommentOpen(false);
      setStatus({ type: "success" });
      markToolRated(toolSlug);
      onSuccess?.();
    } catch {
      setStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
    }
  }

  if (status.type === "success") {
    return (
      <div className="tool-rating__thanks" role="status">
        <span className="tool-rating__thanks-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" focusable="false">
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
            <path
              d="M7.5 12.5l3 3 6-6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <p className="tool-rating__thanks-title">Thanks for rating {toolName}</p>
          <p className="tool-rating__thanks-lede">
            Your feedback helps us keep improving.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      className={cn("tool-rating__form", compact && "is-compact")}
      onSubmit={onSubmit}
      noValidate
    >
      <StarPicker
        id={starsId}
        value={stars}
        onChange={(next) => {
          setStars(next);
          if (!commentOpen) setCommentOpen(true);
          if (status.type === "error") setStatus({ type: "idle" });
        }}
        disabled={status.type === "loading"}
      />

      {showComment ? (
        <div className="tool-rating__comment-block">
          <div className="tool-rating__comment-head">
            <label className="tool-rating__comment-label" htmlFor={commentId}>
              Anything to add?
            </label>
            <span className="tool-rating__comment-hint">Optional</span>
          </div>
          <textarea
            id={commentId}
            className="ui-input ui-input--textarea tool-rating__comment"
            name="comment"
            rows={compact ? 3 : 2}
            maxLength={2000}
            placeholder="What worked well, or what should we improve?"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={status.type === "loading"}
          />
        </div>
      ) : null}

      {status.type === "error" ? (
        <p className="tool-error" role="alert">
          {status.message}
        </p>
      ) : null}

      <div className="tool-rating__actions">
        <Button
          type="submit"
          className="tool-rating__submit"
          disabled={status.type === "loading" || stars < 1}
        >
          {status.type === "loading" ? "Sending…" : "Submit rating"}
        </Button>
      </div>
    </form>
  );
}

function RatingHeader({
  titleId,
  toolName,
  eyebrow = "Feedback",
}: {
  titleId: string;
  toolName: string;
  eyebrow?: string;
}) {
  return (
    <div className="tool-rating__intro">
      <span className="tool-rating__badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
          <path
            d="M12 3.2l2.4 5.4 5.9.5-4.5 3.9 1.4 5.8L12 15.8 6.8 18.8l1.4-5.8-4.5-3.9 5.9-.5L12 3.2z"
            fill="currentColor"
          />
        </svg>
      </span>
      <div className="tool-rating__intro-copy">
        <p className="tool-rating__eyebrow">{eyebrow}</p>
        <h2 id={titleId} className="tool-rating__title">
          How was {toolName}?
        </h2>
        <p className="tool-rating__lede">
          Tap a star to rate — a short comment is optional.
        </p>
      </div>
    </div>
  );
}

export default function ToolRating({ toolSlug, toolName }: ToolRatingProps) {
  const baseId = useId();
  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    function onDownload() {
      if (hasRecentlyRated(toolSlug)) return;

      const counts = readDownloadCounts();
      const next = (counts[toolSlug] || 0) + 1;
      if (next >= DOWNLOADS_BEFORE_PROMPT) {
        counts[toolSlug] = 0;
        writeDownloadCounts(counts);
        window.setTimeout(() => {
          if (!hasRecentlyRated(toolSlug)) setModalOpen(true);
        }, 500);
        return;
      }
      counts[toolSlug] = next;
      writeDownloadCounts(counts);
    }

    window.addEventListener(PRODUCT_DOWNLOAD_EVENT, onDownload);
    return () => window.removeEventListener(PRODUCT_DOWNLOAD_EVENT, onDownload);
  }, [toolSlug]);

  useEffect(() => {
    if (!modalOpen) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal();
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen, closeModal]);

  return (
    <>
      <section className="tool-rating" aria-labelledby={`${baseId}-title`}>
        <RatingHeader titleId={`${baseId}-title`} toolName={toolName} />
        <RatingForm
          toolSlug={toolSlug}
          toolName={toolName}
          idPrefix={`${baseId}-inline`}
        />
      </section>

      {modalOpen ? (
        <div className="tool-rating-modal" role="presentation">
          <button
            type="button"
            className="tool-rating-modal__backdrop"
            aria-label="Close rating prompt"
            onClick={closeModal}
          />
          <div
            className="tool-rating-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${baseId}-modal-title`}
          >
            <button
              type="button"
              className="tool-rating-modal__close"
              onClick={closeModal}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M6.5 6.5l11 11M17.5 6.5l-11 11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <RatingHeader
              titleId={`${baseId}-modal-title`}
              toolName={toolName}
              eyebrow="Quick rating"
            />
            <RatingForm
              toolSlug={toolSlug}
              toolName={toolName}
              idPrefix={`${baseId}-modal`}
              compact
              onSuccess={() => {
                window.setTimeout(closeModal, 1200);
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
