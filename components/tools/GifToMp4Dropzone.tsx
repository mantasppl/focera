"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import {
  ACCEPTED_GIF_TYPES,
  MAX_GIF_FRAMES,
  MAX_GIF_SIZE_BYTES,
  validateGifFile,
} from "@/lib/gif-to-mp4";
import { formatFileSize } from "@/lib/image";
import { cn } from "@/lib/utils";

type GifToMp4DropzoneProps = {
  onFile: (file: File) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  className?: string;
};

export default function GifToMp4Dropzone({
  onFile,
  onError,
  disabled = false,
  className,
}: GifToMp4DropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file || disabled) return;

    const validationError = validateGifFile(file);
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
          accept={[...ACCEPTED_GIF_TYPES, ".gif"].join(",")}
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
            {isDragging ? "Drop your GIF here" : "Drag & drop a GIF"}
          </span>
          <span className="dropzone__hint">
            or click to browse · animated GIF · up to{" "}
            {formatFileSize(MAX_GIF_SIZE_BYTES)} · max {MAX_GIF_FRAMES} frames
          </span>
        </label>
      </div>
    </div>
  );
}
