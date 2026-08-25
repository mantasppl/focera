"use client";

import { useEffect, useState } from "react";
import {
  beginPreviewPrepare,
  isConstrainedClient,
  subscribeRemovalProgress,
} from "@/lib/background-removal";

type EnhancingPreviewProps = {
  src: string;
  alt?: string;
};

async function makePreviewUrl(src: string): Promise<string> {
  const maxEdge = isConstrainedClient() ? 320 : 480;
  const blob = await fetch(src).then((response) => response.blob());
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(
    1,
    maxEdge / Math.max(bitmap.width, bitmap.height),
  );

  if (scale >= 1) {
    bitmap.close();
    return src;
  }

  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    bitmap.close();
    return src;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const preview = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.7);
  });

  return preview ? URL.createObjectURL(preview) : src;
}

function creepCap(reported: number): number {
  if (reported >= 99) return 100;
  if (reported >= 70) return 97;
  if (reported >= 38) return 82;
  return 34;
}

export default function EnhancingPreview({
  src,
  alt = "Uploaded preview",
}: EnhancingPreviewProps) {
  const [previewSrc, setPreviewSrc] = useState("");
  const [reported, setReported] = useState(1);
  const [percent, setPercent] = useState(1);

  useEffect(() => {
    let cancelled = false;
    let createdUrl = "";
    const release = beginPreviewPrepare();

    void (async () => {
      try {
        const next = await makePreviewUrl(src);
        if (cancelled) {
          if (next !== src) URL.revokeObjectURL(next);
          return;
        }
        if (next !== src) createdUrl = next;
        setPreviewSrc(next);
      } catch {
        if (!cancelled) setPreviewSrc(src);
      } finally {
        release();
      }
    })();

    return () => {
      cancelled = true;
      release();
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [src]);

  useEffect(() => {
    setReported(1);
    setPercent(1);
    return subscribeRemovalProgress(setReported);
  }, [src]);

  useEffect(() => {
    setPercent((current) => Math.max(current, reported));
  }, [reported]);

  useEffect(() => {
    const cap = creepCap(reported);
    const timer = window.setInterval(() => {
      setPercent((current) => {
        if (current >= cap) return current;
        return current + 1;
      });
    }, 320);
    return () => window.clearInterval(timer);
  }, [reported]);

  return (
    <div className="enhancing" role="status" aria-live="polite">
      <span className="sr-only">Enhancing photo {percent} percent</span>
      <div className="enhancing__frame">
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewSrc}
            alt={alt}
            className="enhancing__image"
            decoding="async"
          />
        ) : (
          <span className="enhancing__placeholder" aria-hidden="true" />
        )}
        <span className="enhancing__glow" aria-hidden="true" />
        <span className="enhancing__scan" aria-hidden="true" />
        <div
          className="enhancing__hud"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Enhancing progress"
        >
          <p className="enhancing__percent">{percent}%</p>
        </div>
      </div>
    </div>
  );
}
