"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { ACCEPTED_IMAGE_TYPES, formatFileSize } from "@/lib/image";
import {
  MAX_OVERLAY_FILES,
  MAX_OVERLAY_SIZE_BYTES,
  validateOverlayAddition,
} from "@/lib/add-images-to-image";
import { cn } from "@/lib/utils";

type AddImagesToImageDropzoneProps = {
  existingFiles: File[];
  onFiles: (files: File[]) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  className?: string;
};

export default function AddImagesToImageDropzone({
  existingFiles,
  onFiles,
  onError,
  disabled = false,
  className,
}: AddImagesToImageDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(fileList: FileList | File[] | null | undefined) {
    if (!fileList || disabled) return;

    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    const validationError = validateOverlayAddition(incoming, existingFiles);
    if (validationError) {
      onError(validationError);
      return;
    }

    onError("");
    onFiles(incoming);
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
    handleFiles(event.dataTransfer.files);
  }

  const remaining = Math.max(0, MAX_OVERLAY_FILES - existingFiles.length);

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
          accept={[...ACCEPTED_IMAGE_TYPES, ".jpg", ".jpeg", ".png", ".webp"].join(
            ",",
          )}
          className="dropzone__input"
          disabled={disabled || remaining === 0}
          multiple
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <label htmlFor={inputId} className="dropzone__label">
          <span className="dropzone__icon" aria-hidden="true">
            ↑
          </span>
          <span className="dropzone__title">
            {isDragging
              ? "Drop overlay images here"
              : existingFiles.length > 0
                ? "Add more overlays"
                : "Drag & drop overlay images"}
          </span>
          <span className="dropzone__hint">
            or click to browse · JPG, PNG, WebP · up to{" "}
            {formatFileSize(MAX_OVERLAY_SIZE_BYTES)} each · {remaining} of{" "}
            {MAX_OVERLAY_FILES} slots left
          </span>
        </label>
      </div>
    </div>
  );
}
