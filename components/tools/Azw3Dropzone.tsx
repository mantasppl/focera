"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import {
  ACCEPTED_AZW3_TYPES,
  validateAzw3File,
} from "@/lib/azw3-to-pdf";
import { cn } from "@/lib/utils";

type Azw3DropzoneProps = {
  onFile: (file: File) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  className?: string;
};

export default function Azw3Dropzone({
  onFile,
  onError,
  disabled = false,
  className,
}: Azw3DropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file || disabled) return;

    const validationError = validateAzw3File(file);
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
          accept={[...ACCEPTED_AZW3_TYPES, ".azw3"].join(",")}
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
            {isDragging ? "Drop your AZW3 here" : "Drag & drop an AZW3 file"}
          </span>
          <span className="dropzone__hint">
            or click to browse · AZW3 / KF8 · up to 25 MB
          </span>
        </label>
      </div>
    </div>
  );
}
