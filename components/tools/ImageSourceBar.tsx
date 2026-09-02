"use client";

import { useId } from "react";
import { formatFileSize } from "@/lib/image";

type ImageSourceBarProps = {
  file: File;
  width?: number;
  height?: number;
  disabled?: boolean;
  onReplace: (file: File) => void;
};

export default function ImageSourceBar({
  file,
  width,
  height,
  disabled = false,
  onReplace,
}: ImageSourceBarProps) {
  const replaceInputId = useId();

  return (
    <div className="image-editor-shell__file-bar">
      <div className="upload-meta">
        <p className="upload-meta__name">{file.name}</p>
        <p className="upload-meta__size">
          {formatFileSize(file.size)}
          {width ? ` · ${width}×${height} px` : ""}
        </p>
      </div>
      <label
        className="image-editor-shell__replace-btn"
        htmlFor={replaceInputId}
      >
        Replace
        <input
          id={replaceInputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="image-editor-shell__replace-input"
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.files?.[0];
            if (next) onReplace(next);
            event.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
