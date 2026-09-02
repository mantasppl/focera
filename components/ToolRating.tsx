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

const DOWNLOADS_BEFORE_PROMPT = 3;
const DOWNLOAD_COUNT_KEY = "focera_product_download_count";

type ToolRatingProps = {
  toolSlug: string;
  toolName: string;
};

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success" }
  | { type: "error"; message: string };

function readDownloadCount(): number {
  try {
    const raw = window.localStorage.getItem(DOWNLOAD_COUNT_KEY);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeDownloadCount(value: number) {
  try {
    window.localStorage.setItem(DOWNLOAD_COUNT_KEY, String(value));
  } catch {
    // ignore quota / private mode
  }
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

  return (
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
            aria-label={`${stars} star${stars === 1 ? "" : "s"}`}
            className={cn("tool-rating__star", active && "is-on")}
            disabled={disabled}
            onMouseEnter={() => setHover(stars)}
            onFocus={() => setHover(stars)}
            onBlur={() => setHover(0)}
            onClick={() => onChange(stars)}
          >
            <span aria-hidden="true">★</span>
          </button>
        );
      })}
    </div>
  );
}

function RatingForm({
  toolSlug,
  toolName,
  idPrefix,
  onSuccess,
}: {
  toolSlug: string;
  toolName: string;
  idPrefix: string;
  onSuccess?: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const starsId = `${idPrefix}-stars`;
  const commentId = `${idPrefix}-comment`;

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
      setStatus({ type: "success" });
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
      <p className="tool-rating__thanks" role="status">
        Thanks for rating {toolName}.
      </p>
    );
  }

  return (
    <form className="tool-rating__form" onSubmit={onSubmit} noValidate>
      <StarPicker
        id={starsId}
        value={stars}
        onChange={(next) => {
          setStars(next);
          if (status.type === "error") setStatus({ type: "idle" });
        }}
        disabled={status.type === "loading"}
      />
      <label className="ui-label" htmlFor={commentId}>
        Comment (optional)
      </label>
      <textarea
        id={commentId}
        className="ui-input ui-input--textarea tool-rating__comment"
        name="comment"
        rows={3}
        maxLength={2000}
        placeholder="Tell us what worked or what we should improve"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        disabled={status.type === "loading"}
      />
      {status.type === "error" ? (
        <p className="tool-error" role="alert">
          {status.message}
        </p>
      ) : null}
      <Button type="submit" disabled={status.type === "loading" || stars < 1}>
        {status.type === "loading" ? "Sending…" : "Rate"}
      </Button>
    </form>
  );
}

export default function ToolRating({ toolSlug, toolName }: ToolRatingProps) {
  const baseId = useId();
  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    function onDownload() {
      const next = readDownloadCount() + 1;
      if (next >= DOWNLOADS_BEFORE_PROMPT) {
        writeDownloadCount(0);
        window.setTimeout(() => setModalOpen(true), 500);
        return;
      }
      writeDownloadCount(next);
    }

    window.addEventListener(PRODUCT_DOWNLOAD_EVENT, onDownload);
    return () => window.removeEventListener(PRODUCT_DOWNLOAD_EVENT, onDownload);
  }, []);

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
        <h2 id={`${baseId}-title`} className="tool-rating__title">
          Rate this tool
        </h2>
        <p className="tool-rating__lede">
          How was {toolName}? Tap stars, then press Rate. A comment is optional.
        </p>
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
            <div className="tool-rating-modal__head">
              <h2 id={`${baseId}-modal-title`} className="tool-rating__title">
                Rate this tool
              </h2>
              <button
                type="button"
                className="tool-rating-modal__close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="tool-rating__lede">
              You downloaded {DOWNLOADS_BEFORE_PROMPT} files. How was {toolName}?
            </p>
            <RatingForm
              toolSlug={toolSlug}
              toolName={toolName}
              idPrefix={`${baseId}-modal`}
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
