"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  return (
    <div
      className={cn(
        "tool-grid image-editor-shell",
        className,
        hasSource && "is-preview-first image-editor-shell--editing",
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

        {privacyHint ? (
          <p className="tool-hint image-editor-shell__privacy-hint">
            {privacyHint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
