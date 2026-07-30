"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import {
  ACCEPTED_VIDEO_TYPES,
  formatVideoFileSize,
  MAX_VIDEO_SIZE_BYTES,
  validateVideoFile,
} from "@/lib/video-caption";
import { cn } from "@/lib/utils";

type VideoDropzoneProps = {
  onFile: (file: File) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  className?: string;
};

export default function VideoDropzone({
  onFile,
  onError,
  disabled = false,
  className,
}: VideoDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file || disabled) return;

    const validationError = validateVideoFile(file);
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
          accept={[...ACCEPTED_VIDEO_TYPES, ".mp4", ".webm", ".mov"].join(",")}
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
            {isDragging ? "Drop your video here" : "Drag & drop a video"}
          </span>
          <span className="dropzone__hint">
            or click to browse · MP4, WebM, MOV · up to{" "}
            {formatVideoFileSize(MAX_VIDEO_SIZE_BYTES)}
          </span>
        </label>
      </div>
    </div>
  );
}
