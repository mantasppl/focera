/** Public aggregate shown on tool pages. */
export type PublicToolRating = {
  toolSlug: string;
  average: number;
  /** Public display count = baseCount + liveCount. */
  count: number;
  baseCount: number;
  liveCount: number;
  stars: Record<1 | 2 | 3 | 4 | 5, number>;
};
