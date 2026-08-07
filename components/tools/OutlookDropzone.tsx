"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import {
  ACCEPTED_OUTLOOK_EXTENSIONS,
  ACCEPTED_OUTLOOK_TYPES,
  validateOutlookFile,
} from "@/lib/outlook-to-pdf";
import { cn } from "@/lib/utils";

type OutlookDropzoneProps = {
  onFile: (file: File) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  className?: string;
};

export default function OutlookDropzone({
  onFile,
  onError,
  disabled = false,
  className,
}: OutlookDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file || disabled) return;

    const validationError = validateOutlookFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }

    onError("");
    onFile(file);
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFile(event.dataTransfer.files[0]);
  }

  return (
    <div className={cn("dropzone", className)}>
      <div
        className={cn(
          "dropzone__surface",
          isDragging && "is-dragging",
          disabled && "is-disabled",
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="presentation"
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={[...ACCEPTED_OUTLOOK_TYPES, ...ACCEPTED_OUTLOOK_EXTENSIONS].join(
            ",",
          )}
          className="dropzone__input"
          disabled={disabled}
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <label htmlFor={inputId} className="dropzone__label">
          <span className="dropzone__icon" aria-hidden="true">
            ↑
          </span>
          <span className="dropzone__title">
            {isDragging
              ? "Drop your Outlook email here"
              : "Drag & drop an Outlook email"}
          </span>
          <span className="dropzone__hint">
            or click to browse · MSG or EML · up to 25 MB
          </span>
        </label>
      </div>
    </div>
  );
}
