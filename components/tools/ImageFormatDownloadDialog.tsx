"use client";

import { useEffect, useId, useRef } from "react";
import Button from "@/components/Button";
import {
  IMAGE_DOWNLOAD_FORMATS,
  type ImageDownloadFormat,
} from "@/lib/image-download-formats";

function FormatIcon({ format }: { format: ImageDownloadFormat }) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (format === "jpg") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2.5" {...stroke} />
        <circle cx="8.5" cy="10" r="1.45" {...stroke} />
        <path d="M5.5 16.5 9 13l2.5 2.5L14.5 12l4.5 4.5" {...stroke} />
      </svg>
    );
  }

  if (format === "png") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2.5" {...stroke} />
        <path
          d="M3 12h6v7H5.5A2.5 2.5 0 0 1 3 16.5V12Zm6-7h6v7H9V5Zm6 7h6v5.5A2.5 2.5 0 0 1 18.5 20H15v-8Z"
          fill="currentColor"
          opacity="0.18"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M12 3.5 13.35 8.1 18 9.5 13.35 10.9 12 15.5 10.65 10.9 6 9.5l4.65-1.4L12 3.5Z"
        {...stroke}
      />
      <path
        d="M18.6 15.2 19.15 17 21 17.55 19.15 18.1 18.6 19.9 18.05 18.1 16.2 17.55 18.05 17Z"
        {...stroke}
      />
    </svg>
  );
}

type ImageFormatDownloadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (format: ImageDownloadFormat) => void | Promise<void>;
  downloading?: boolean;
  error?: string;
  title?: string;
};

export default function ImageFormatDownloadDialog({
  open,
  onOpenChange,
  onSelect,
  downloading = false,
  error = "",
  title = "Select Download Format",
}: ImageFormatDownloadDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="unblur-download"
      aria-labelledby={titleId}
      aria-busy={downloading}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onOpenChange(false);
        }
      }}
    >
      <h2 id={titleId} className="unblur-download__title">
        {title}
      </h2>
      <div className="unblur-download__options">
        {IMAGE_DOWNLOAD_FORMATS.map((option) => (
          <button
            key={option.value}
            type="button"
            className="unblur-download__option"
            disabled={downloading}
            onClick={() => void onSelect(option.value)}
          >
            <span className="unblur-download__option-icon" aria-hidden="true">
              <FormatIcon format={option.value} />
            </span>
            <span className="unblur-download__option-copy">
              <span className="unblur-download__option-label">
                {option.label}
              </span>
              <span className="unblur-download__option-hint">
                {option.hint}
              </span>
            </span>
          </button>
        ))}
      </div>
      {error && open ? (
        <p className="tool-error unblur-download__error" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        variant="ghost"
        className="unblur-download__cancel"
        onClick={() => onOpenChange(false)}
        disabled={downloading}
      >
        Cancel
      </Button>
    </dialog>
  );
}
