/** Public aggregate shown on tool pages (stars only in UI). */
export type PublicToolRating = {
  toolSlug: string;
  /** 5 when no real reviews; otherwise weighted average of real reviews. */
  average: number;
  /** Real review count (tool_ratings + user comments). Not shown in the UI. */
  count: number;
  stars: Record<1 | 2 | 3 | 4 | 5, number>;
};
