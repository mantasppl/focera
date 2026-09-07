"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact" | "flexible";
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="https://challenges.cloudflare.com/turnstile/"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Turnstile script failed")),
        { once: true },
      );
      if (window.turnstile) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export type TurnstileWidgetHandle = {
  reset: () => void;
};

type TurnstileWidgetProps = {
  siteKey: string;
  onToken: (token: string | null) => void;
  onReady?: (handle: TurnstileWidgetHandle) => void;
  className?: string;
};

export default function TurnstileWidget({
  siteKey,
  onToken,
  onReady,
  className,
}: TurnstileWidgetProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    let cancelled = false;

    async function mount() {
      const host = hostRef.current;
      if (!host || !siteKey) return;

      try {
        await loadTurnstileScript();
      } catch {
        onTokenRef.current(null);
        return;
      }
      if (cancelled || !window.turnstile || !hostRef.current) return;

      // Clear previous render if React remounted.
      hostRef.current.innerHTML = "";

      const widgetId = window.turnstile.render(hostRef.current, {
        sitekey: siteKey,
        theme: "auto",
        size: "normal",
        callback: (token) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => onTokenRef.current(null),
      });
      widgetIdRef.current = widgetId;

      onReadyRef.current?.({
        reset: () => {
          if (!window.turnstile || !widgetIdRef.current) return;
          window.turnstile.reset(widgetIdRef.current);
          onTokenRef.current(null);
        },
      });
    }

    void mount();

    return () => {
      cancelled = true;
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // widget may already be gone
        }
      }
      widgetIdRef.current = null;
    };
  }, [siteKey]);

  return (
    <div
      className={className}
      ref={hostRef}
      data-turnstile-sitekey={siteKey}
    />
  );
}

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";
