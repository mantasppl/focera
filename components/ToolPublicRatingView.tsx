"use client";

import { useEffect, useId, useState } from "react";
import {
  TOOL_RATING_UPDATED_EVENT,
  type ToolRatingUpdatedDetail,
} from "@/lib/ratings/events";
import type { PublicToolRating } from "@/lib/ratings/types";
import { cn } from "@/lib/utils";

type ToolPublicRatingViewProps = {
  toolSlug: string;
  toolName: string;
  initial: PublicToolRating;
};

function StarGlyph({
  fill,
  halfId,
  size = 16,
}: {
  fill: "full" | "half" | "empty";
  halfId: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className="tool-public-rating__star-icon"
    >
      {fill === "half" ? (
        <defs>
          <linearGradient id={halfId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      ) : null}
      <path
        d="M12 2.6l2.83 6.54 7.1.66-5.4 4.66 1.6 6.94L12 17.9l-6.13 3.5 1.6-6.94-5.4-4.66 7.1-.66L12 2.6z"
        fill={
          fill === "full"
            ? "currentColor"
            : fill === "half"
              ? `url(#${halfId})`
              : "none"
        }
        stroke="currentColor"
        strokeWidth={fill === "full" ? 0 : 1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function starsForAverage(average: number): Array<"full" | "half" | "empty"> {
  const rounded = Math.round(average * 2) / 2;
  return Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    if (rounded >= n) return "full";
    if (rounded >= n - 0.5) return "half";
    return "empty";
  });
}

export default function ToolPublicRatingView({
  toolSlug,
  toolName,
  initial,
}: ToolPublicRatingViewProps) {
  const halfId = useId().replace(/:/g, "");
  const [rating, setRating] = useState(initial);

  useEffect(() => {
    setRating(initial);
  }, [initial]);

  useEffect(() => {
    async function refresh() {
      try {
        const res = await fetch(
          `/api/ratings?toolSlug=${encodeURIComponent(toolSlug)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as PublicToolRating;
        if (typeof data.average === "number" && typeof data.count === "number") {
          setRating(data);
        }
      } catch {
        // keep SSR value
      }
    }

    function onUpdated(event: Event) {
      const detail = (event as CustomEvent<ToolRatingUpdatedDetail>).detail;
      if (detail?.toolSlug && detail.toolSlug !== toolSlug) return;
      void refresh();
    }

    window.addEventListener(TOOL_RATING_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(TOOL_RATING_UPDATED_EVENT, onUpdated);
  }, [toolSlug]);

  if (rating.count < 1) {
    return (
      <p className="tool-public-rating tool-public-rating--empty">
        No public ratings yet
      </p>
    );
  }

  const fills = starsForAverage(rating.average);
  const label = `${rating.average.toFixed(1)} out of 5 stars from ${rating.count} rating${rating.count === 1 ? "" : "s"} for ${toolName}`;

  return (
    <div className="tool-public-rating" aria-label={label}>
      <span className="tool-public-rating__stars" aria-hidden="true">
        {fills.map((fill, i) => (
          <span
            key={i}
            className={cn(
              "tool-public-rating__star",
              fill !== "empty" && "is-on",
            )}
          >
            <StarGlyph fill={fill} halfId={`${halfId}-${i}`} />
          </span>
        ))}
      </span>
      <span className="tool-public-rating__score">{rating.average.toFixed(1)}</span>
      <span className="tool-public-rating__sep" aria-hidden="true">
        ·
      </span>
      <span className="tool-public-rating__count">
        {rating.count} {rating.count === 1 ? "rating" : "ratings"}
      </span>
    </div>
  );
}
