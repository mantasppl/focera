"use client";

import { useRef, useState } from "react";
import { useAdminPath } from "@/components/admin/AdminPathContext";
import { adminFetch } from "@/lib/admin/csrf-client";

type ImageUrlFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  onUploaded?: (url: string) => void;
};

export default function ImageUrlField({
  label,
  value,
  onChange,
  placeholder = "https://… or upload a file",
  onUploaded,
}: ImageUrlFieldProps) {
  const { api } = useAdminPath();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await adminFetch(api("/content/images"), {
        method: "POST",
        body,
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; url?: string; path?: string; error?: string }
        | null;
      const url = payload?.url || payload?.path;
      if (!response.ok || !url) {
        throw new Error(payload?.error || "Could not upload the image.");
      }
      onChange(url);
      onUploaded?.(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload the image.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="admin-image-field">
      <label className="admin-field">
        {label}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </label>
      <div className="admin-image-field__actions">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <button
          type="button"
          className="ui-btn ui-btn--ghost"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? "Uploading…" : "Upload image"}
        </button>
        {value ? (
          <span className="admin-image-field__url" title={value}>
            {value}
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="admin-image-field__error" role="alert">
          {error}
        </p>
      ) : null}
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="admin-image-field__preview" src={value} alt="" />
      ) : null}
    </div>
  );
}
