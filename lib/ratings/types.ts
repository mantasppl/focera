export type RatingOverviewStats = {
  total: number;
  withComments: number;
  average: number;
};

export type ToolRatingSummary = {
  toolId: string;
  toolName: string;
  count: number;
  average: number;
  withComments: number;
  stars: Record<1 | 2 | 3 | 4 | 5, number>;
  /** Seeded/manual public count floor. */
  baseCount: number;
  /** Real submitted ratings (tool_ratings rows). */
  liveCount: number;
  /** baseCount + liveCount shown on the tool page. */
  displayCount: number;
};

export type RatingListItem = {
  id: number;
  toolId: string;
  toolName: string;
  stars: number;
  comment: string | null;
  createdAt: string;
};

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
