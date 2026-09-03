"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { CONTACT_EMAIL } from "@/lib/contact";

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success" }
  | { type: "error"; message: string };

export default function ToolInquiry() {
  const titleId = useId();
  const ideaId = useId();
  const urlId = useId();
  const emailId = useId();

  const [open, setOpen] = useState(false);
  const [idea, setIdea] = useState("");
  const [similarUrl, setSimilarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setStatus({ type: "idle" });
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      document.getElementById(ideaId)?.focus();
    }, 30);

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open, close, ideaId]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading" });

    try {
      const response = await fetch("/api/tool-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, similarUrl, email }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setStatus({
          type: "error",
          message:
            data?.error ||
            `Could not send your request. Email us at ${CONTACT_EMAIL}.`,
        });
        return;
      }

      setIdea("");
      setSimilarUrl("");
      setEmail("");
      setStatus({ type: "success" });
    } catch {
      setStatus({
        type: "error",
        message: `Network error. Please email us at ${CONTACT_EMAIL}.`,
      });
    }
  }

  return (
    <section
      className="page-section tool-inquiry"
      aria-labelledby="tool-inquiry-heading"
      id="request-a-tool"
    >
      <div className="tool-inquiry__card">
        <div className="tool-inquiry__glow" aria-hidden="true" />
        <div className="tool-inquiry__mesh" aria-hidden="true" />

        <div className="tool-inquiry__copy">
          <p className="tool-inquiry__eyebrow">Can&apos;t find it?</p>
          <h2 id="tool-inquiry-heading" className="tool-inquiry__title">
            We&apos;ll build your tool in 24 hours — free.
          </h2>
          <p className="tool-inquiry__lede">
            Didn&apos;t see what you need? Tell us. We create it, put it live,
            and email you.
          </p>
          <button
            ref={triggerRef}
            type="button"
            className="tool-inquiry__cta"
            onClick={() => {
              setStatus({ type: "idle" });
              setOpen(true);
            }}
          >
            Request a tool
            <svg
              className="tool-inquiry__cta-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12h12.5M13 6.5 18.5 12 13 17.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <ul className="tool-inquiry__pills">
            <li>Free</li>
            <li>Live in 24 hours</li>
            <li>No signup</li>
          </ul>
        </div>

        <div className="tool-inquiry__aside" aria-hidden="true">
          <div className="tool-inquiry__clock">
            <svg viewBox="0 0 120 120" className="tool-inquiry__ring">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="rgba(248,250,252,0.12)"
                strokeWidth="6"
              />
              <circle
                className="tool-inquiry__ring-arc"
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="110 217"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="tool-inquiry__clock-label">
              <span className="tool-inquiry__clock-time">24h</span>
              <span className="tool-inquiry__clock-hint">turnaround</span>
            </div>
          </div>
        </div>
      </div>

      {mounted && open
        ? createPortal(
            <div className="tool-inquiry-modal" role="presentation">
              <button
                type="button"
                className="tool-inquiry-modal__backdrop"
                aria-label="Close tool inquiry"
                onClick={close}
              />
              <div
                ref={dialogRef}
                className="tool-inquiry-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
              >
                <div className="tool-inquiry-modal__head">
                  <div>
                    <p className="tool-inquiry-modal__kicker">New request</p>
                    <h2 id={titleId} className="tool-inquiry-modal__title">
                      New tool inquiry
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="tool-inquiry-modal__close"
                    onClick={close}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                {status.type !== "success" ? (
                  <p className="tool-inquiry-modal__lede">
                    Describe what you need. We build it free and email you when
                    it goes live.
                  </p>
                ) : null}

                {status.type === "success" ? (
                  <div className="tool-inquiry-modal__success" role="status">
                    <p className="tool-inquiry-modal__success-title">
                      Request sent
                    </p>
                    <p>We&apos;ll build it and email you within 24 hours.</p>
                    <Button type="button" onClick={close}>
                      Done
                    </Button>
                  </div>
                ) : (
                  <form
                    className="contact-form tool-inquiry-modal__form"
                    onSubmit={onSubmit}
                    noValidate
                  >
                    <Input
                      as="textarea"
                      id={ideaId}
                      label="Describe your tool idea"
                      name="idea"
                      required
                      placeholder="What should it do?"
                      value={idea}
                      onChange={(event) => setIdea(event.target.value)}
                      disabled={status.type === "loading"}
                    />
                    <Input
                      id={urlId}
                      label="Similar tool URL"
                      name="similarUrl"
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      placeholder="https://"
                      hint="Optional — a tool we can use as a reference."
                      value={similarUrl}
                      onChange={(event) => setSimilarUrl(event.target.value)}
                      disabled={status.type === "loading"}
                    />
                    <Input
                      id={emailId}
                      label="Your email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@email.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={status.type === "loading"}
                    />

                    {status.type === "error" ? (
                      <p className="tool-error" role="alert">
                        {status.message}
                      </p>
                    ) : null}

                    <Button type="submit" disabled={status.type === "loading"}>
                      {status.type === "loading" ? "Sending…" : "Send request"}
                    </Button>
                  </form>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
