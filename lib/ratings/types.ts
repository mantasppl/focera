/** Public aggregate shown on tool pages (stars only in UI). */
export type PublicToolRating = {
  toolSlug: string;
  /** 5 when no real tool_ratings; otherwise average of those ratings. */
  average: number;
  /** Real tool_ratings count only. Not shown in the UI. */
  count: number;
  stars: Record<1 | 2 | 3 | 4 | 5, number>;
};
