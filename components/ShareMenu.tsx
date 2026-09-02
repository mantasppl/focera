"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  SHARE_NETWORKS,
  canonicalShareUrl,
  shareNetworkHref,
  sharePageText,
  sharePageTitle,
  type ShareNetworkId,
} from "@/lib/share";
import { cn, copyText } from "@/lib/utils";

type ShareMenuProps = {
  title?: string;
  text?: string;
  url?: string;
  variant?: "icon" | "labeled";
  align?: "start" | "end";
  className?: string;
};

export default function ShareMenu({
  title,
  text,
  url,
  variant = "icon",
  align = "end",
  className,
}: ShareMenuProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [centerOnMobile, setCenterOnMobile] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 959px)");
    function sync() {
      setCenterOnMobile(media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  function payload() {
    const shareUrl = canonicalShareUrl(url);
    const shareTitle = sharePageTitle(title);
    return {
      url: shareUrl,
      title: shareTitle,
      text: sharePageText(shareTitle, text),
    };
  }

  async function onCopy() {
    const { url: shareUrl } = payload();
    const ok = await copyText(shareUrl);
    setCopied(ok);
  }

  async function onNativeShare() {
    const share = payload();
    try {
      await navigator.share({
        title: share.title,
        text: share.text,
        url: share.url,
      });
      setOpen(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  const useCenteredPortal = variant === "icon" && centerOnMobile;

  const panel = open ? (
    <div
      ref={panelRef}
      id={panelId}
      className="share-panel"
      role="dialog"
      aria-label="Share options"
    >
      <p className="share-panel__title">Share</p>
      <button
        type="button"
        className={cn("share-copy", copied && "is-copied")}
        onClick={() => void onCopy()}
      >
        {copied ? <CheckIcon /> : <LinkIcon />}
        <span className="share-copy__text">
          <span className="share-copy__label">
            {copied ? "Address copied" : "Copy address"}
          </span>
          <span className="share-copy__url">{payload().url}</span>
        </span>
      </button>

      <ul className="share-grid">
        {SHARE_NETWORKS.map((network) => {
          const share = payload();
          const href = shareNetworkHref(network.id, share.url, share.text);
          const isMail = network.id === "email";
          return (
            <li key={network.id}>
              <a
                className="share-network"
                href={href}
                target={isMail ? undefined : "_blank"}
                rel={isMail ? undefined : "noopener noreferrer"}
                onClick={() => setOpen(false)}
              >
                <span className="share-network__icon" aria-hidden="true">
                  <NetworkIcon id={network.id} />
                </span>
                {network.label}
              </a>
            </li>
          );
        })}
      </ul>

      {canNativeShare ? (
        <button
          type="button"
          className="share-native"
          onClick={() => void onNativeShare()}
        >
          <ShareNodesIcon />
          Share via device
        </button>
      ) : null}
    </div>
  ) : null;

  return (
    <div
      ref={rootRef}
      className={cn(
        "share-menu",
        `share-menu--${variant}`,
        `share-menu--${align}`,
        open && "is-open",
        className,
      )}
    >
      <button
        type="button"
        className={cn(
          "share-trigger",
          variant === "icon" ? "share-trigger--icon" : "share-trigger--labeled",
        )}
        aria-label="Share this page"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <ShareNodesIcon />
        {variant === "labeled" ? <span>Share</span> : null}
      </button>

      {useCenteredPortal && panel && typeof document !== "undefined"
        ? createPortal(
            <div className="share-portal">
              <button
                type="button"
                className="share-portal__backdrop"
                aria-label="Close share options"
                onClick={() => setOpen(false)}
              />
              {panel}
            </div>,
            document.body,
          )
        : panel}
    </div>
  );
}

function ShareNodesIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.2 13.8a4.2 4.2 0 0 1 0-5.9l2.4-2.4a4.2 4.2 0 0 1 5.9 5.9l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13.8 10.2a4.2 4.2 0 0 1 0 5.9l-2.4 2.4a4.2 4.2 0 1 1-5.9-5.9l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.5 12.5 10 17l8.5-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NetworkIcon({ id }: { id: ShareNetworkId }) {
  switch (id) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14.6 8.5h2.2V5.2h-2.2c-2.6 0-4.3 1.6-4.3 4.3v1.7H8.3v3.3h2v6.3h3.3v-6.3h2.3l.5-3.3h-2.8V9.6c0-.7.3-1.1 1.1-1.1Z"
          />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M13.4 10.7 19.2 4h-1.4l-5 5.9L8.8 4H4.2l6.1 8.9L4.2 20h1.4l5.3-6.3 4.3 6.3h4.6l-6.4-9.3Zm-1.9 2.2-.6-.9-4.9-7h2.1l4 5.7.6.9 5.2 7.4h-2.1l-4.3-6.1Z"
          />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M7.4 9.2H4.6V19h2.8V9.2ZM6 4.2A1.6 1.6 0 1 0 6 7.4 1.6 1.6 0 0 0 6 4.2ZM19.4 19h-2.8v-5.1c0-1.6-.6-2.5-1.8-2.5-1 0-1.5.7-1.8 1.3-.1.2-.1.6-.1.9V19h-2.8s.1-8.4 0-9.8h2.8v1.6c.4-.7 1.3-1.8 3.2-1.8 2.3 0 4.1 1.5 4.1 4.8V19Z"
          />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12.1 4.2A7.7 7.7 0 0 0 5 15.3L4.2 19l3.8-.8a7.7 7.7 0 1 0 4.1-14ZM12 18.2a6.1 6.1 0 0 1-3.1-.8l-.2-.1-2.3.5.5-2.2-.1-.2a6.1 6.1 0 1 1 5.2 2.8Zm3.3-4.6c-.2-.1-1.1-.6-1.3-.6s-.3 0-.5.2l-.4.5c-.2.2-.3.2-.6.1a5 5 0 0 1-1.5-1 5.5 5.5 0 0 1-1-1.5c-.1-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.1-.5s-.6-1.3-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3s-.9.9-.9 2.1.9 2.5 1 2.6c.1.2 1.8 2.8 4.4 3.8 1.8.7 2.2.6 2.6.5s1.1-.5 1.3-1 .2-.9.1-1c0-.1-.2-.1-.4-.2Z"
          />
        </svg>
      );
    case "telegram":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M19.3 5.4 16.7 18.3c-.2.9-.7 1.1-1.5.7l-4.1-3-2-1.9-3.6-1.1c-1-.3-1-1 .2-1.5l14-5.4c.8-.3 1.5.2 1.3 1.3ZM8.7 12.7l7.8-4.8-6 5.8-.2 2.6-1.6-3.6Z"
          />
        </svg>
      );
    case "reddit":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M17.3 12a1.4 1.4 0 0 0-2.4-1 6.8 6.8 0 0 0-3.1-.8l.5-2.5 1.7.4a1.2 1.2 0 1 0 .1-1l-2.1-.4c-.2 0-.4.1-.4.3l-.6 3.1a6.8 6.8 0 0 0-3.2.8 1.4 1.4 0 1 0-1.5 2.3 3 3 0 0 0-.1.7c0 2.2 2.6 4 5.8 4s5.8-1.8 5.8-4a3 3 0 0 0-.1-.7c.4-.2.7-.6.7-1.1Zm-6.6.6a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0Zm4.4 2.6c-.5.5-1.4.8-2.3.8s-1.8-.3-2.3-.8a.4.4 0 0 1 .6-.6c.4.3 1 .5 1.7.5s1.3-.2 1.7-.5a.4.4 0 1 1 .6.6Zm-.3-1.8a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Z"
          />
        </svg>
      );
    case "pinterest":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12.2 4.2A7.7 7.7 0 0 0 8 18.2c0-1.1.1-1.8.6-2.9l2.2-9.2s-.3-.5-.3-1.3c0-1.2.7-2.1 1.6-2.1.7 0 1.1.6 1.1 1.2 0 .7-.5 1.8-.7 2.8-.2.8.4 1.5 1.3 1.5 1.5 0 2.5-1.9 2.5-4.2 0-1.7-1.1-3-3.2-3-2.3 0-3.8 1.7-3.8 3.7 0 .7.2 1.2.5 1.6l.1.2-.2.8c0 .3-.2.4-.5.3-1.4-.6-2-2.2-2-3.9 0-2.9 2.4-6.4 7.3-6.4 3.9 0 6.4 2.8 6.4 5.8 0 4-2.2 7-5.5 7-1.1 0-2.1-.6-2.5-1.3l-.7 2.6c-.2.9-.7 1.9-1.1 2.6a7.7 7.7 0 0 0 8.8-7.6 7.7 7.7 0 0 0-7.8-7.7Z"
          />
        </svg>
      );
    case "threads":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16.4 11.2c-.1-2.2-1.3-3.6-3.7-3.7-1.6 0-3 .7-3.5 1.8l1.4.8c.3-.6 1-.9 2.1-.9 1.4.1 2.1.8 2.2 2.2-1-.4-2-.5-3.1-.3-1.8.3-3 1.4-2.9 3.1.1 1.6 1.3 2.6 3.1 2.6 1.1 0 2-.4 2.6-1.1.4.5.8 1 1.4 1.4-.8.9-2 1.5-3.9 1.5-2.7 0-4.6-1.6-4.7-4.3-.1-2.8 1.8-4.7 5.2-5.2 2.2-.3 4.3.3 5.4 1.6 1 1.2 1.4 2.9 1.4 5.3v.5h-1.6c0-1.6 0-2.8-.4-3.3Zm-3.5 3.9c-.9 0-1.5-.5-1.5-1.2 0-1 .8-1.5 2.2-1.6.5 0 1 .1 1.4.2-.1 1.6-1 2.6-2.1 2.6Z"
          />
        </svg>
      );
    case "bluesky":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M7.3 5.4c2.1 1.6 4.3 4.8 4.7 6.5.4-1.7 2.6-4.9 4.7-6.5 1.5-1.2 4-2.1 4-4.1 0-.9-.5-1.6-1.6-1.6-1.2 0-2.6.7-4.3 2.4C12.9 4 12 6.1 12 6.1S11.1 4 9.2 2.1C7.5.4 6.1-.3 4.9-.3 3.8-.3 3.3.4 3.3 1.3c0 2 2.5 2.9 4 4.1ZM12 14.3c-.3.6-1.1 2-1.1 3.5 0 1.1.4 1.8 1.1 1.8s1.1-.7 1.1-1.8c0-1.5-.8-2.9-1.1-3.5Zm-2.4.9c-2.1.6-5.7 1.3-5.7 4.8 0 2.1 1.9 3.6 4.4 3.6 3.2 0 4.9-2.3 5.7-4.6.8 2.3 2.5 4.6 5.7 4.6 2.5 0 4.4-1.5 4.4-3.6 0-3.5-3.6-4.2-5.7-4.8-1.6 2.3-3.3 3.4-4.4 3.4s-2.8-1.1-4.4-3.4Z"
          />
        </svg>
      );
    case "tumblr":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14.8 19.6c-2.6 0-4.5-1.3-4.5-4.5V11H8.2V8.3c2.6-.7 3.5-2.9 3.6-4.8h2.5v4.4h3.1V11h-3.1v3.7c0 1.1.6 1.5 1.5 1.5.6 0 1.3-.2 1.9-.5v2.6c-.8.5-1.8.8-2.9.8Z"
          />
        </svg>
      );
    case "line":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 4.2c-4.6 0-8.3 3-8.3 6.7 0 3.3 2.9 6.1 6.9 6.6.3 0 .6.2.7.5l.5 1.8c.1.3.4.2.6 0l1.5-1.2c.2-.1.3-.1.5-.1 4.3-.6 7.6-3.6 7.6-7.6 0-3.7-3.7-6.7-8-6.7Zm-3.3 8.8H7.3V9.2h1.4v3.8Zm2.3 0h-1.4V9.2h1.4v3.8Zm3.4 0h-1.2l-1.3-1.8v1.8h-1.4V9.2h1.2l1.3 1.8V9.2H16v3.8Zm2.6 0h-1.4V9.2H18v3.8Z"
          />
        </svg>
      );
    case "email":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
          <rect
            x="4"
            y="6.5"
            width="16"
            height="11"
            rx="1.6"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M5.2 8.2 12 13l6.8-4.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
