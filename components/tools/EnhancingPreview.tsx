"use client";

type EnhancingPreviewProps = {
  src: string;
  alt?: string;
};

export default function EnhancingPreview({
  src,
  alt = "Uploaded preview",
}: EnhancingPreviewProps) {
  return (
    <div className="enhancing" role="status" aria-live="polite">
      <span className="sr-only">Enhancing photo</span>
      <div className="enhancing__frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="enhancing__image" />
        <span className="enhancing__glow" aria-hidden="true" />
        <span className="enhancing__shimmer" aria-hidden="true" />
        <span className="enhancing__scan" aria-hidden="true" />
      </div>
    </div>
  );
}
