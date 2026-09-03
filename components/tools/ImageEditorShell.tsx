"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const MOBILE_QUERY = "(max-width: 859px)";
/** Collapse sticky preview after this much page scroll on mobile. */
const COLLAPSE_AFTER_SCROLL_PX = 56;

type ImageEditorShellProps = {
  className?: string;
  hasSource: boolean;
  sidebar: ReactNode;
  sidebarFooter?: ReactNode;
  previewTitle?: string;
  previewMeta?: ReactNode;
  previewHint?: ReactNode;
  loading?: boolean;
  loadingText?: string;
  loadingSubtext?: string;
  stageReady?: boolean;
  privacyHint?: string;
  children: ReactNode;
};

function ExpandIcon({ expanded }: { expanded: boolean }) {
  if (expanded) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 9 4.5 4.5M4.5 4.5H9M4.5 4.5V9M15 9l4.5-4.5M19.5 4.5H15M19.5 4.5V9M9 15l-4.5 4.5M4.5 19.5H9M4.5 19.5V15M15 15l4.5 4.5M19.5 19.5H15M19.5 19.5V15"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3.5H4.5V8M15 3.5h4.5V8M9 20.5H4.5V16M15 20.5h4.5V16"
      />
    </svg>
  );
}

export default function ImageEditorShell({
  className,
  hasSource,
  sidebar,
  sidebarFooter,
  previewTitle = "Preview",
  previewMeta,
  previewHint,
  loading = false,
  loadingText = "Processing…",
  loadingSubtext = "Your image stays on this device.",
  stageReady = false,
  privacyHint,
  children,
}: ImageEditorShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const scrollBaselineRef = useRef(0);

  // New upload → big preview again, leave fullscreen.
  useEffect(() => {
    if (!hasSource) {
      setCollapsed(false);
      setFullscreen(false);
      return;
    }
    setCollapsed(false);
    setFullscreen(false);
    const frame = window.requestAnimationFrame(() => {
      scrollBaselineRef.current =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hasSource]);

  // Collapse to compact dock after scrolling options into view (mobile only).
  useEffect(() => {
    if (!hasSource || fullscreen) return;

    const media = window.matchMedia(MOBILE_QUERY);

    const sync = () => {
      if (!media.matches) {
        setCollapsed(false);
        return;
      }
      const y =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setCollapsed(y > scrollBaselineRef.current + COLLAPSE_AFTER_SCROLL_PX);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    media.addEventListener("change", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      media.removeEventListener("change", sync);
    };
  }, [hasSource, fullscreen]);

  // Lock page scroll while fullscreen, Esc to exit.
  useEffect(() => {
    if (!fullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const showExpand = hasSource && (stageReady || hasSource) && !loading;

  return (
    <div
      className={cn(
        "tool-grid image-editor-shell",
        className,
        hasSource && "is-preview-first image-editor-shell--editing",
        hasSource && !collapsed && !fullscreen && "is-preview-expanded",
        hasSource && collapsed && !fullscreen && "is-preview-collapsed",
        fullscreen && "is-preview-fullscreen",
      )}
    >
      <aside className="image-editor-shell__sidebar tool-panel">
        {sidebar}
        {sidebarFooter ? (
          <div className="image-editor-shell__sidebar-footer">
            {sidebarFooter}
          </div>
        ) : null}
      </aside>

      <div className="image-editor-shell__canvas-panel tool-panel tool-panel--preview">
        <div className="image-editor-shell__canvas-header">
          <div>
            <p className="image-editor-shell__canvas-title">{previewTitle}</p>
            {previewMeta ? (
              <p className="image-editor-shell__canvas-meta">{previewMeta}</p>
            ) : null}
          </div>
          {previewHint ? (
            <p className="image-editor-shell__canvas-hint">{previewHint}</p>
          ) : null}
        </div>

        <div className="image-editor-shell__stage-wrap">
          <div
            className={cn(
              "image-editor-shell__stage tool-stage",
              (stageReady || hasSource) && "is-ready",
              loading && "is-loading",
            )}
          >
            {loading ? (
              <div className="tool-loading" role="status" aria-live="polite">
                <span className="tool-loading__spinner" aria-hidden="true" />
                <span className="tool-loading__text">{loadingText}</span>
                <span className="tool-loading__subtext">{loadingSubtext}</span>
              </div>
            ) : hasSource || stageReady ? (
              children
            ) : (
              <div className="image-editor-shell__empty-canvas">
                <p className="tool-placeholder">
                  Your image preview appears here
                </p>
                <p className="image-editor-shell__empty-hint">
                  Upload a photo to get started.
                </p>
              </div>
            )}
          </div>

          {showExpand ? (
            <button
              type="button"
              className="image-editor-shell__expand-btn"
              aria-label={
                fullscreen
                  ? "Exit full screen preview"
                  : "Expand preview to full screen"
              }
              aria-pressed={fullscreen}
              onClick={() => setFullscreen((value) => !value)}
            >
              <ExpandIcon expanded={fullscreen} />
              <span className="image-editor-shell__expand-label">
                {fullscreen ? "Close" : "Expand"}
              </span>
            </button>
          ) : null}
        </div>

        {privacyHint ? (
          <p className="tool-hint image-editor-shell__privacy-hint">
            {privacyHint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
