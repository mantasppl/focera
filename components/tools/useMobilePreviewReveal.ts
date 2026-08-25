"use client";

import { useEffect, useRef } from "react";

const MOBILE_PREVIEW_QUERY = "(max-width: 859px)";

export function useMobilePreviewReveal(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const node = ref.current;
    if (!node || !window.matchMedia(MOBILE_PREVIEW_QUERY).matches) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    node.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [active]);

  return ref;
}
