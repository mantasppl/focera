"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

type BeforeAfterPreviewProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  hint?: string;
  className?: string;
};

export default function BeforeAfterPreview({
  beforeSrc,
  afterSrc,
  beforeAlt = "Original image",
  afterAlt = "Background removed",
  hint = "Drag the slider to compare the original and transparent PNG.",
  className,
}: BeforeAfterPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  }, []);

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    updatePosition(event.clientX);
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!isDragging) return;
    updatePosition(event.clientX);
  }

  function onPointerUp(event: PointerEvent<HTMLButtonElement>) {
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div className={cn("compare", className)}>
      <div ref={containerRef} className="compare__stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={afterSrc} alt={afterAlt} className="compare__image compare__image--after" />

        <div
          className="compare__before"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={beforeSrc} alt={beforeAlt} className="compare__image compare__image--before" />
        </div>

        <button
          type="button"
          className="compare__handle"
          style={{ left: `${position}%` }}
          aria-label="Drag to compare before and after"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className="compare__handle-line" aria-hidden="true" />
          <span className="compare__handle-grip" aria-hidden="true" />
        </button>

        <span className="compare__badge compare__badge--before">Before</span>
        <span className="compare__badge compare__badge--after">After</span>
      </div>
      <p className="tool-hint">{hint}</p>
    </div>
  );
}
